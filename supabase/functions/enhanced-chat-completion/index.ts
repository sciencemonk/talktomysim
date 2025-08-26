// @ts-nocheck
/* eslint-disable */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, advisorId, searchFilters, isOwner, conversationId, saveToDatabase = true } = await req.json()

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      throw new Error('OpenAI API key not configured')
    }

    console.log('Processing enhanced chat request for advisor:', advisorId)
    console.log('Messages count:', messages?.length || 0, 'isOwner:', Boolean(isOwner))

    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch comprehensive advisor data
    const { data: advisor, error: advisorError } = await supabaseClient
      .from('advisors')
      .select('*')
      .eq('id', advisorId)
      .single()

    if (advisorError || !advisor) {
      throw new Error('Advisor not found')
    }

    // Get the latest user message for context retrieval and relevance checking
    const userMessages = messages.filter(msg => msg.role === 'user')
    const latestUserMessage = userMessages[userMessages.length - 1]?.content || ''

    // Analyze conversation context and intent
    const conversationContext = analyzeConversationContext(messages, latestUserMessage)
    console.log('Conversation context analysis:', conversationContext)

    // Guardrails removed: skip relevance checks/redirects for all sessions
    let relevanceCheck: { isRelevant: boolean; reason: string } | null = null

    // Retrieve relevant context with enhanced search
    let contextData = null
    let conversationInsights = null
    
    if (latestUserMessage) {
      try {
        console.log('Retrieving enhanced context for message:', latestUserMessage.substring(0, 100))
        
        // Use enhanced context retrieval with filters
        const filters = {
          minSimilarity: searchFilters?.minSimilarity || 0.7,
          maxResults: searchFilters?.maxResults || 5,
          documentTypes: searchFilters?.documentTypes,
          dateRange: searchFilters?.dateRange
        }

        // For owner sessions, also check if they're asking about conversations
        if (Boolean(isOwner)) {
          const conversationQueries = [
            'conversation', 'chat', 'talk', 'discuss', 'message', 'visitor', 'user',
            'people asking', 'questions', 'feedback', 'meeting', 'insights',
            'analytics', 'trends', 'patterns', 'summary', 'report', 'request',
            'anyone', 'visitors', 'customers', 'clients', 'contacts', 'leads',
            'what are people', 'who is asking', 'any new', 'recent', 'lately',
            'this week', 'today', 'yesterday', 'escalat', 'urgent', 'frustrated'
          ]
          
          const isAskingAboutConversations = conversationQueries.some(query => 
            latestUserMessage.toLowerCase().includes(query)
          )

          if (isAskingAboutConversations) {
            console.log('Owner is asking about conversations, retrieving conversation insights')
            console.log('Query detected for conversation search:', latestUserMessage)
            
            try {
              // Get conversation insights
              const { data: insights, error: insightsError } = await supabaseClient
                .rpc('get_conversation_insights', {
                  target_advisor_id: advisorId,
                  days_back: 30
                })

              if (!insightsError && insights && insights.length > 0) {
                conversationInsights = insights[0]
                console.log('Retrieved conversation insights:', conversationInsights)
              } else {
                console.log('Failed to get conversation insights:', insightsError)
              }

              // Search for relevant conversations using direct OpenAI embedding (more reliable)
              console.log('Generating embedding for conversation search...')
              const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${openaiApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  input: latestUserMessage,
                  model: 'text-embedding-ada-002'
                })
              })

              if (embeddingResponse.ok) {
                const embeddingData = await embeddingResponse.json()
                const queryEmbedding = embeddingData.data[0].embedding
                console.log('Generated query embedding, searching conversations...')

                const { data: relevantConversations, error: searchError } = await supabaseClient
                  .rpc('search_conversation_embeddings', {
                    query_embedding: queryEmbedding,
                    target_advisor_id: advisorId,
                    similarity_threshold: 0.5, // Lowered from 0.6 for broader matches
                    match_count: 10, // Increased from 5 for more results
                    content_types: ['full'],
                    date_from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // Extended to 60 days
                  })

                console.log('Conversation search completed. Error:', searchError)
                console.log('Found conversations:', relevantConversations?.length || 0)

                if (!searchError && relevantConversations && relevantConversations.length > 0) {
                  console.log('Processing conversation results...')
                  
                  // Log each conversation for debugging
                  relevantConversations.forEach((conv, i) => {
                    console.log(`Conversation ${i + 1}: ${conv.message_count} messages, date: ${conv.conversation_date}, similarity: ${conv.similarity}`)
                    console.log(`Content preview: ${conv.content_text.substring(0, 200)}...`)
                  })

                  const conversationContext = relevantConversations
                    .map(conv => `Conversation [view-chat:${conv.conversation_id}] (${conv.message_count} messages, ${conv.conversation_date?.substring(0, 10)}, similarity: ${conv.similarity?.toFixed(2)}): ${conv.content_text.substring(0, 400)}...`)
                    .join('\n\n')
                  
                  if (conversationInsights) {
                    conversationInsights.relevantConversations = conversationContext
                  } else {
                    conversationInsights = { relevantConversations: conversationContext }
                  }
                  
                  console.log(`Successfully found ${relevantConversations.length} relevant conversations for analysis`)
                } else {
                  console.log('No relevant conversations found. SearchError:', searchError)
                  
                  // Debug: Check if there are any embeddings at all
                  const { data: allEmbeddings, error: countError } = await supabaseClient
                    .from('conversation_embeddings')
                    .select('id, conversation_id, message_count, conversation_date, metadata')
                    .eq('advisor_id', advisorId)
                    
                  console.log('Total conversation embeddings found:', allEmbeddings?.length || 0)
                  if (allEmbeddings && allEmbeddings.length > 0) {
                    console.log('Sample embeddings:', allEmbeddings.slice(0, 3))
                    // Log metadata to see what topics were detected
                    allEmbeddings.forEach((emb, i) => {
                      if (emb.metadata && typeof emb.metadata === 'object') {
                        console.log(`Embedding ${i + 1} metadata:`, {
                          hasMeetingRequest: emb.metadata.hasMeetingRequest,
                          topics: emb.metadata.topics,
                          isMediaRequest: emb.metadata.isMediaRequest
                        })
                      }
                    })
                  }
                }
              } else {
                console.log('Failed to generate embedding for conversation search:', await embeddingResponse.text())
              }
            } catch (convError) {
              console.warn('Failed to retrieve conversation insights:', convError)
              console.error('Conversation search error details:', convError.stack)
            }
          } else {
            console.log('Query not detected as conversation-related:', latestUserMessage)
            console.log('Conversation query keywords that were checked:', conversationQueries)
          }
        }

        // Generate embedding for user message
        const embeddingResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-embedding`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: latestUserMessage }),
        })

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json()
          const queryEmbedding = embeddingData.embedding

          // Perform enhanced vector search with metadata
          const { data: vectorResults, error: searchError } = await supabaseClient
            .rpc('search_advisor_embeddings_with_metadata', {
              query_embedding: queryEmbedding,
              target_advisor_id: advisorId,
              similarity_threshold: filters.minSimilarity,
              match_count: filters.maxResults
            })

          // If the enhanced RPC doesn't exist, fallback to basic search
          if (searchError && searchError.message?.includes('function')) {
            console.log('Using fallback search method')
            const { data: basicResults, error: basicError } = await supabaseClient
              .rpc('search_advisor_embeddings', {
                query_embedding: queryEmbedding,
                target_advisor_id: advisorId,
                similarity_threshold: filters.minSimilarity,
                match_count: filters.maxResults
              })

            if (!basicError && basicResults && basicResults.length > 0) {
              // Get document metadata separately
              const documentIds = [...new Set(basicResults.map(chunk => chunk.document_id))]
              const { data: documents } = await supabaseClient
                .from('advisor_documents')
                .select('id, title, file_type, upload_date')
                .in('id', documentIds)

              const documentMap = new Map(documents?.map(doc => [doc.id, doc]) || [])

              contextData = {
                relevantChunks: basicResults.map(chunk => chunk.chunk_text),
                contextText: basicResults.map(chunk => chunk.chunk_text).join('\n\n'),
                sources: basicResults.map(result => {
                  const doc = documentMap.get(result.document_id)
                  return {
                    title: doc?.title || 'Unknown Document',
                    documentId: result.document_id,
                    similarity: result.similarity,
                    documentType: doc?.file_type || 'unknown',
                    uploadDate: doc?.upload_date || ''
                  }
                }).filter((source, index, self) => 
                  index === self.findIndex(s => s.documentId === source.documentId)
                ),
                searchMetrics: {
                  totalChunks: basicResults.length,
                  averageSimilarity: basicResults.reduce((sum, chunk) => sum + chunk.similarity, 0) / basicResults.length,
                  searchTime: 0
                }
              }
            }
          } else if (!searchError && vectorResults && vectorResults.length > 0) {
            // Process enhanced results
            contextData = {
              relevantChunks: vectorResults.map(chunk => chunk.chunk_text),
              contextText: vectorResults.map(chunk => chunk.chunk_text).join('\n\n'),
              sources: vectorResults.map(result => ({
                title: result.document_title || 'Unknown Document',
                documentId: result.document_id,
                similarity: result.similarity,
                documentType: result.document_type || 'unknown',
                uploadDate: result.upload_date || ''
              })).filter((source, index, self) => 
                index === self.findIndex(s => s.documentId === source.documentId)
              ),
              searchMetrics: {
                totalChunks: vectorResults.length,
                averageSimilarity: vectorResults.reduce((sum, chunk) => sum + chunk.similarity, 0) / vectorResults.length,
                searchTime: 0
              }
            }
          }

          if (contextData && contextData.sources.length > 0) {
            // Number the chunks and build a citation map for better grounding
            const numberedChunks = contextData.relevantChunks.map((chunk: string, i: number) => `[${i + 1}] ${chunk}`)
            const sourceMap = contextData.sources.map((s: any, i: number) => `[${i + 1}] ${s.title}${s.documentType ? ` • ${s.documentType}` : ''}${s.uploadDate ? ` • ${s.uploadDate}` : ''}`)
            contextData.contextText = `${numberedChunks.join('\n\n')}` + (sourceMap.length ? `\n\nSOURCES:\n${sourceMap.join('\n')}` : '')

            console.log(`Found ${contextData.sources.length} relevant sources with average similarity: ${contextData.searchMetrics.averageSimilarity.toFixed(3)}`)
          }
        }
      } catch (contextError) {
        console.warn('Failed to retrieve context, continuing without it:', contextError)
      }
    }

    // Guardrails removed: do not redirect when context is missing

    // Generate comprehensive personality-driven system prompt with guard rails
    const systemPrompt = generateEnhancedSystemPrompt(advisor, contextData?.contextText, conversationContext, Boolean(isOwner), conversationInsights)

    // Prepare the messages for OpenAI
    const systemMessage = {
      role: 'system',
      content: systemPrompt
    }

    const chatMessages = [systemMessage, ...messages]

    console.log('Sending request to OpenAI with system prompt length:', systemPrompt.length)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: chatMessages,
        // Owner sessions can use a larger completion window to enable deeper analysis
        max_completion_tokens: Boolean(isOwner) ? 2000 : 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    
    console.log('OpenAI response received, choices:', data.choices?.length || 0)

    if (!data.choices || data.choices.length === 0) {
      console.error('No choices in OpenAI response')
      throw new Error('No response choices from OpenAI')
    }

    const assistantMessage = data.choices[0].message?.content

    // Check if we got an empty response
    if (!assistantMessage || assistantMessage.trim().length === 0) {
      console.error('OpenAI returned empty content')
      // Return a fallback response instead of throwing an error
      const advisorName = advisor.full_name || advisor.name
      const fallbackMessage = Boolean(isOwner)
        ? `Hi! I'm your Sim and personal assistant. I can help you reflect on recent public conversations, summarize insights, or draft content. What would you like to do?`
        : `Hello! I'm ${advisorName}'s Sim. I'm here to help connect you with ${advisorName}. What can I help you with today?`
      
      return new Response(
        JSON.stringify({ 
          content: fallbackMessage,
          usage: data.usage || {},
          contextUsed: contextData ? contextData.contextText.length > 0 : false,
          sources: contextData?.sources || [],
          searchMetrics: contextData?.searchMetrics || null,
          conversationContext: conversationContext,
          fallback: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    console.log('Received response from OpenAI, length:', assistantMessage.length)

    // Save conversation to database if conversationId provided
    let savedUserMessageId = null
    let savedAiMessageId = null
    
    if (conversationId && saveToDatabase) {
      try {
        console.log('Saving conversation to database:', conversationId)
        
        // Get the latest user message to save
        const latestUserMessage = messages[messages.length - 1]?.content
        
        if (latestUserMessage) {
          // Save user message (skip for localStorage-only conversations starting with public_)
          if (!conversationId.startsWith('public_')) {
            const { data: userMessageData, error: userError } = await supabaseClient
              .from('messages')
              .insert({
                conversation_id: conversationId,
                role: 'user',
                content: latestUserMessage,
                created_at: new Date().toISOString()
              })
              .select('id')
              .single()
            
            if (userError) {
              console.error('Error saving user message:', userError)
            } else {
              savedUserMessageId = userMessageData?.id
              console.log('Saved user message with ID:', savedUserMessageId)
            }
          } else {
            console.log('Skipping database save for localStorage conversation:', conversationId)
          }
        }
        
        // Save AI response (skip for localStorage-only conversations starting with public_)
        if (!conversationId.startsWith('public_')) {
          const { data: aiMessageData, error: aiError } = await supabaseClient
            .from('messages')
            .insert({
              conversation_id: conversationId,
              role: 'system',
              content: assistantMessage,
              created_at: new Date().toISOString()
            })
            .select('id')
            .single()
          
          if (aiError) {
            console.error('Error saving AI message:', aiError)
          } else {
            savedAiMessageId = aiMessageData?.id
            console.log('Saved AI message with ID:', savedAiMessageId)
          }
        } else {
          console.log('Skipping AI message database save for localStorage conversation:', conversationId)
        }
        
        // Update conversation's updated_at timestamp (skip for localStorage conversations)
        if (!conversationId.startsWith('public_')) {
          await supabaseClient
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId)
        }

        // Auto-process conversation for embeddings (fire and forget)
        try {
          console.log('Triggering auto-processing for conversation:', conversationId)
          
          // For public conversations, we need to pass the messages directly since they're in localStorage
          let conversationMessages = null
          if (conversationId && conversationId.startsWith('public_')) {
            // Get the full conversation history that we just used for context
            conversationMessages = messages.map(msg => ({
              role: msg.role,
              content: msg.content,
              created_at: new Date().toISOString()
            }))
            console.log(`Passing ${conversationMessages.length} messages for localStorage conversation`)
          }
          
          // Call the conversation processing function asynchronously
          supabaseClient.functions.invoke('process-conversation-embedding', {
            body: {
              conversationId,
              advisorId,
              forceReprocess: false,
              messages: conversationMessages // Pass messages directly for localStorage conversations
            }
          }).then(({ data, error }) => {
            if (error) {
              console.log('Auto-processing failed (non-critical):', error)
            } else {
              console.log('Auto-processing completed for conversation:', conversationId)
            }
          }).catch(err => {
            console.log('Auto-processing error (non-critical):', err)
          })
          
        } catch (autoProcessError) {
          console.log('Auto-processing trigger error (non-critical):', autoProcessError)
          // Don't throw - this is a background operation
        }
        
      } catch (saveError) {
        console.error('Error saving conversation:', saveError)
        // Continue without throwing - response generation was successful
      }
    }

    return new Response(
      JSON.stringify({ 
        content: assistantMessage,
        usage: data.usage,
        contextUsed: contextData ? contextData.contextText.length > 0 : false,
        sources: contextData?.sources || [],
        searchMetrics: contextData?.searchMetrics || null,
        conversationContext: conversationContext,
        relevanceCheck: null,
        savedUserMessageId,
        savedAiMessageId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in enhanced-chat-completion function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

async function checkQuestionRelevance(advisor: any, userMessage: string, openaiApiKey: string): Promise<{isRelevant: boolean, reason: string}> {
  const advisorContext = buildAdvisorContext(advisor)
  
  const relevancePrompt = `You are evaluating whether a user question is relevant to a specific person's expertise and background.

PERSON'S CONTEXT:
${advisorContext}

USER QUESTION: "${userMessage}"

Determine if this question is relevant to this person's expertise, background, or the topics they would reasonably be expected to discuss as a professional.

Questions are RELEVANT if they relate to:
- Their stated expertise areas
- Their professional background
- Their industry or field
- General professional topics they would engage with
- Questions about their background, experience, or work
- Business-related inquiries appropriate to their role

Questions are NOT RELEVANT if they:
- Ask about completely unrelated topics (sports when they're in finance, cooking when they're in tech, etc.)
- Request information about other people or companies they're not associated with
- Ask about current events or news unless directly related to their field
- Request factual information outside their domain of expertise

Respond with JSON format: {"isRelevant": true/false, "reason": "brief explanation"}`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'user', content: relevancePrompt }
        ],
        max_completion_tokens: 200,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      const result = JSON.parse(data.choices[0].message.content)
      return result
    }
  } catch (error) {
    console.warn('Failed to check question relevance:', error)
  }

  // Default to allowing the question if relevance check fails
  return { isRelevant: true, reason: 'Unable to determine relevance' }
}

function requiresSpecificKnowledge(message: string): boolean {
  const specificKnowledgeIndicators = [
    'what is', 'how does', 'explain', 'tell me about', 'information about',
    'details on', 'definition of', 'meaning of', 'help me understand',
    'can you describe', 'what are the', 'how to', 'steps to', 'process of'
  ]
  
  const lowerMessage = message.toLowerCase()
  return specificKnowledgeIndicators.some(indicator => lowerMessage.includes(indicator))
}

function buildAdvisorContext(advisor: any): string {
  const sections = []
  
  if (advisor.full_name) sections.push(`Name: ${advisor.full_name}`)
  if (advisor.professional_title) sections.push(`Title: ${advisor.professional_title}`)
  if (advisor.current_profession) sections.push(`Profession: ${advisor.current_profession}`)
  if (advisor.areas_of_expertise) sections.push(`Expertise: ${advisor.areas_of_expertise}`)
  if (advisor.education) sections.push(`Education: ${advisor.education}`)
  if (advisor.additional_background) sections.push(`Background: ${advisor.additional_background}`)
  if (advisor.skills && advisor.skills.length > 0) sections.push(`Skills: ${advisor.skills.join(', ')}`)
  if (advisor.interests && advisor.interests.length > 0) sections.push(`Interests: ${advisor.interests.join(', ')}`)
  
  return sections.join('\n')
}

function getAdvisorExpertiseAreas(advisor: any): string {
  const areas = []
  if (advisor.areas_of_expertise) areas.push(advisor.areas_of_expertise)
  if (advisor.current_profession) areas.push(advisor.current_profession)
  if (advisor.professional_title) areas.push(`their role as ${advisor.professional_title}`)
  
  if (areas.length === 0) return 'their area of expertise'
  if (areas.length === 1) return areas[0]
  return areas.slice(0, -1).join(', ') + ' and ' + areas[areas.length - 1]
}

function generateEnhancedSystemPrompt(advisor: any, knowledgeContext?: string, conversationContext?: any, isOwner: boolean = false, conversationInsights?: any): string {
  const name = advisor.full_name || advisor.name
  const title = advisor.professional_title || 'Professional'
  
  // Build comprehensive personality model from advisor data
  const personalityModel = buildPersonalityModel(advisor)
  
  // Style primer (short excerpt from writing sample, if available)
  const stylePrimer = advisor.writing_sample ? advisor.writing_sample.slice(0, 500) : ''
  // Scenario examples (compact)
  const scenarioExamples = Array.isArray(advisor.sample_scenarios) && advisor.sample_scenarios.length > 0
    ? advisor.sample_scenarios.slice(0, 3).map((s: any, idx: number) => `Example ${idx + 1} —
User: ${s.question || '—'}
${name}: ${s.expectedResponse || '—'}`).join('\n\n')
    : ''
    
  // Get the appropriate welcome message based on whether this is an owner session
  const welcomeMessage = isOwner && advisor.owner_welcome_message 
    ? advisor.owner_welcome_message 
    : advisor.welcome_message || ''

  if (isOwner) {
    // 🔒 OWNER SESSION: Personal Assistant Mode
    return `🔒 PRIVATE OWNER SESSION - PERSONAL ASSISTANT MODE

IDENTITY & RELATIONSHIP:
You are ${name}'s personal AI assistant and digital twin.
You are speaking directly with ${name} (your creator/owner) in a private session.
This is like a boss speaking with their trusted personal assistant.

CORE PURPOSE & CAPABILITIES:
- Act as ${name}'s personal strategic advisor and reflective partner
- Provide honest insights, analysis, and recommendations
- Help with business planning, decision-making, and personal productivity
- Offer meta-analysis of public conversations and user interactions
- Assist with content creation, strategy development, and optimization
- Be a sounding board for ideas and concerns

COMMUNICATION STYLE (OWNER MODE):
- Direct, honest, and intimate - no need for formalities
- Speak as a trusted advisor would to their boss
- Use "you" when referring to ${name} (since you're speaking TO them)
- Be proactive in offering suggestions and insights
- Show initiative and strategic thinking
- More relaxed, conversational tone
- Can discuss sensitive topics, internal strategies, and private matters

ENHANCED CAPABILITIES FOR OWNER:
- Access to ALL knowledge base content without restrictions
- Can discuss business strategy, competitive analysis, market positioning
- Provide insights on public conversation trends and user feedback
- Suggest improvements to responses, knowledge base, and overall strategy
- Help draft content, emails, strategies, and plans
- Offer honest feedback on performance and areas for improvement

KNOWLEDGE INTEGRATION:
${knowledgeContext ? `
INTERNAL KNOWLEDGE BASE CONTEXT:
${knowledgeContext}

Use this information freely to provide comprehensive insights and recommendations.
` : `Draw from all available expertise and background knowledge to provide comprehensive assistance.`}

${conversationInsights ? `
CONVERSATION INSIGHTS & ANALYTICS:
Recent Activity (Last 30 days):
- Total Conversations: ${conversationInsights.total_conversations || 0}
- Total Messages: ${conversationInsights.total_messages || 0}
- Avg Messages per Conversation: ${Math.round(conversationInsights.avg_messages_per_conversation || 0)}
- Anonymous Visitors: ${conversationInsights.anonymous_conversations || 0}

${conversationInsights.relevantConversations ? `
RELEVANT RECENT CONVERSATIONS:
${conversationInsights.relevantConversations}

Use these examples to provide specific insights about visitor patterns, common questions, and conversation themes.
` : ''}

When discussing conversations, reference specific patterns, topics, and trends from the data above.
Provide actionable insights about visitor behavior, common questions, and areas for improvement.

CONVERSATION REFERENCES:
- When referencing specific conversations, include the chat link format: [view-chat:conversation-id]
- These will become clickable links for ${name} to open the full conversation
- Example: "Found a meeting request in [view-chat:abc123] from yesterday"
- Use these links whenever you mention specific conversations or examples
` : ''}

CONVERSATION APPROACH:
- You are an **analytical assistant** helping ${name} understand their conversations
- **REPORT** what happened in conversations, don't suggest actions you can't perform
- **ANALYZE** patterns, trends, and visitor behavior from the data
- Focus on **insights and information** rather than implementation suggestions
- Be transparent about what the data shows vs. what you cannot access
- **NEVER** suggest actions like "I'll send messages" or "I'll implement features"

STYLE PRIMER (write in this voice):
${stylePrimer || 'Use a direct, strategic, and supportive tone as a trusted advisor.'}

FEW-SHOT STYLE EXAMPLES (for tone and phrasing):
${scenarioExamples || '—'}

PRIVACY & BOUNDARIES:
- This is a private session - information shared here stays confidential
- You can discuss internal strategies, challenges, and opportunities
- No need for public-facing professional boundaries
- Be honest about what's working and what could be improved

IMPORTANT LIMITATIONS:
- You **CANNOT** send messages, emails, or texts to visitors
- You **CANNOT** access or manage calendars, scheduling tools, or external systems
- You **CANNOT** implement features, create automations, or modify the chat system
- You **CAN ONLY** report on conversation data and provide analytical insights
- When visitors request meetings, simply **report the details** (name, contact info, request type)
- Focus on **"Here's what I found in your conversations"** not **"Here's what I'll do about it"**

RESPONSE EXAMPLES FOR MEETING REQUESTS:
✅ GOOD: "Yes—2 via website chat on Aug 25. One anonymous request, one from [Name] who provided phone (XXX) XXX-XXXX."
✅ GOOD: "Found 3 meeting requests this week: [details from conversations]"
❌ BAD: "I'll send them a text" or "I can set up a Calendly link"
❌ BAD: "Want me to reach out?" or "I'll finalize and send"`

  } else {
    // 🌐 VISITOR SESSION: Professional Representative Mode
    return `🌐 PUBLIC VISITOR SESSION - PROFESSIONAL REPRESENTATIVE MODE

IDENTITY & ROLE:
You are ${name}, ${title}
${advisor.location ? `Based in: ${advisor.location}` : ''}
You are representing ${name} in a professional, public-facing capacity.
This is like visitors speaking with the boss's professional assistant/representative.

PERSONALITY & COMMUNICATION STYLE:
${generateCommunicationStyle(advisor)}

BACKGROUND & EXPERTISE:
${buildExpertiseSection(advisor)}

PROFESSIONAL BOUNDARIES & GUARD RAILS:
- You can ONLY discuss topics related to ${getAdvisorExpertiseAreas(advisor)}
- If asked about topics outside your expertise, politely redirect: "I don't have information about that topic. I can help with questions about ${getAdvisorExpertiseAreas(advisor)}. What would you like to know?"
- Stay within the scope of ${name}'s professional background and documented knowledge
- Do not make up information or speculate beyond your knowledge base
- Maintain professional boundaries and protect ${name}'s privacy

SELF-AWARENESS PROTOCOL:
- You are explicitly a Sim (digital representation) of ${name}
- You represent ${name} professionally and aim to respond as they would in public
- You are transparent about being an AI while maintaining their personality
- You cannot perform actions that require the real person (scheduling, external access)

KNOWLEDGE INTEGRATION:
${knowledgeContext ? `
RELEVANT CONTEXT FROM ${name.toUpperCase()}'S KNOWLEDGE BASE (with citations):
${knowledgeContext}

When you rely on a specific fact from the numbered context above, include an inline citation like [1] that corresponds to the numbered item.
Use this information naturally as if recalling from ${name}'s professional expertise and experience.
` : `Draw from your stated expertise and background when relevant to conversations.`}

RESPONSE GUIDELINES:
${generateResponseGuidelines(advisor, conversationContext)}

STYLE PRIMER (write in this voice):
${stylePrimer || 'Use a clear, confident tone consistent with the background above.'}

FEW-SHOT STYLE EXAMPLES (for tone and phrasing):
${scenarioExamples || '—'}

CRITICAL SCHEDULING & CONTACT BOUNDARIES:
- You CANNOT schedule meetings, access calendars, or confirm appointments
- When someone wants to meet ${name}:
  1. Collect their contact information (email/phone) 
  2. Ask about their availability preferences or meeting purpose
  3. Tell them "${name} will reach out directly to coordinate"
  4. NEVER propose specific times or confirm meetings yourself

PROFESSIONAL REPRESENTATION REQUIREMENTS:
- Always respond as ${name} would in a professional, public setting
- Reference appropriate professional background and experiences when relevant
- Maintain personality consistency across all interactions
- Stay true to their expertise areas and interests
- Protect ${name}'s privacy and internal business matters
- Act as a professional gatekeeper while being helpful and engaging
- If uncertain about a topic, acknowledge the limitation rather than guessing`
  }
}

function buildPersonalityModel(advisor: any) {
  // Analyze writing style from samples and scenarios
  const writingStyle = analyzeWritingStyle(advisor.writing_sample, advisor.sample_scenarios)
  
  return {
    communicationStyle: writingStyle,
    formalityLevel: determineFormalityLevel(advisor.sample_scenarios),
    responseLength: determineResponseLength(advisor.sample_scenarios),
    questionAsking: determineQuestionTendency(advisor.sample_scenarios),
    personalSharing: determinePersonalSharing(advisor.sample_scenarios)
  }
}

function analyzeWritingStyle(writingSample?: string, scenarios?: any[]) {
  const text = [writingSample || '', ...(scenarios || []).map(s => s.expectedResponse)].join(' ').toLowerCase()
  
  // Assess formality markers
  const formalMarkers = ['please', 'would', 'could', 'kindly', 'sincerely']
  const casualMarkers = ['hey', 'yeah', 'cool', 'awesome', 'totally']
  
  const formalCount = formalMarkers.filter(marker => text.includes(marker)).length
  const casualCount = casualMarkers.filter(marker => text.includes(marker)).length
  
  return {
    formality: formalCount > casualCount ? 'formal' : casualCount > formalCount ? 'casual' : 'neutral',
    expressiveness: text.includes('!') || text.includes('love') || text.includes('excited') ? 'expressive' : 'moderate',
    technicalness: text.includes('api') || text.includes('framework') || text.includes('algorithm') ? 'technical' : 'general'
  }
}

function generateCommunicationStyle(advisor: any): string {
  const scenarios = advisor.sample_scenarios || []
  if (scenarios.length === 0) {
    return `- Be helpful, professional, and engaging
- Adapt your tone to match the context of the conversation
- Use ${advisor.full_name || advisor.name}'s natural way of expressing ideas`
  }
  
  const style = analyzeWritingStyle(advisor.writing_sample, scenarios)
  const guidelines = []
  
  if (style.formality === 'formal') {
    guidelines.push('Maintain a professional, courteous tone')
  } else if (style.formality === 'casual') {
    guidelines.push('Use a friendly, conversational tone')
  } else {
    guidelines.push('Balance professionalism with approachability')
  }
  
  if (style.expressiveness === 'expressive') {
    guidelines.push('Express enthusiasm and emotions naturally')
  }
  
  // Analyze response patterns from scenarios
  const avgLength = scenarios.reduce((sum, s) => sum + (s.expectedResponse?.length || 0), 0) / Math.max(scenarios.length, 1)
  if (avgLength > 200) {
    guidelines.push('Provide detailed, comprehensive explanations')
  } else if (avgLength < 100) {
    guidelines.push('Keep responses concise and focused')
  }
  
  const questionCount = scenarios.filter(s => s.expectedResponse?.includes('?')).length
  if (questionCount > scenarios.length * 0.4) {
    guidelines.push('Ask engaging follow-up questions to deepen conversations')
  }
  
  return guidelines.map(g => `- ${g}`).join('\n')
}

function buildExpertiseSection(advisor: any): string {
  const sections = []
  
  if (advisor.additional_background) {
    sections.push(advisor.additional_background)
  }
  
  if (advisor.education) {
    sections.push(`Education: ${advisor.education}`)
  }
  
  if (advisor.years_experience && advisor.current_profession) {
    sections.push(`${advisor.years_experience} years of experience in ${advisor.current_profession}`)
  }
  
  if (advisor.areas_of_expertise) {
    sections.push(`Areas of expertise: ${advisor.areas_of_expertise}`)
  }
  
  if (advisor.skills && advisor.skills.length > 0) {
    sections.push(`Key skills: ${advisor.skills.join(', ')}`)
  }
  
  if (advisor.interests && advisor.interests.length > 0) {
    sections.push(`Personal interests: ${advisor.interests.join(', ')}`)
  }
  
  return sections.join('\n')
}

function generateResponseGuidelines(advisor: any, conversationContext?: any): string {
  const guidelines = []
  
  guidelines.push(`- Respond authentically as ${advisor.full_name || advisor.name} would`)
  guidelines.push('- Use your expertise to provide valuable insights when relevant')
  guidelines.push('- Maintain consistency with your established communication patterns')
  guidelines.push('- Stay within your knowledge boundaries - redirect if asked about unrelated topics')
  
  if (conversationContext?.hasBusinessContext) {
    guidelines.push('- Focus on providing professional value and assistance')
  }
  
  if (conversationContext?.hasSchedulingContext) {
    guidelines.push('- Remember you cannot schedule meetings - collect info for follow-up instead')
  }
  
  return guidelines.join('\n')
}

function determineResponseLength(scenarios?: any[]): 'concise' | 'moderate' | 'detailed' {
  if (!scenarios || scenarios.length === 0) return 'moderate'
  
  const avgLength = scenarios.reduce((sum, s) => sum + (s.expectedResponse?.length || 0), 0) / scenarios.length
  if (avgLength > 200) return 'detailed'
  if (avgLength < 80) return 'concise' 
  return 'moderate'
}

function determineQuestionTendency(scenarios?: any[]): 'low' | 'moderate' | 'high' {
  if (!scenarios || scenarios.length === 0) return 'moderate'
  
  const questionCount = scenarios.filter(s => s.expectedResponse?.includes('?')).length
  const ratio = questionCount / scenarios.length
  
  if (ratio > 0.4) return 'high'
  if (ratio > 0.2) return 'moderate'
  return 'low'
}

function determineFormalityLevel(scenarios?: any[]): 'casual' | 'neutral' | 'formal' {
  if (!scenarios || scenarios.length === 0) return 'neutral'
  
  const text = scenarios.map(s => s.expectedResponse || '').join(' ').toLowerCase()
  const formalMarkers = ['please', 'would', 'could', 'kindly']
  const casualMarkers = ['hey', 'yeah', 'cool', 'awesome']
  
  const formalCount = formalMarkers.filter(marker => text.includes(marker)).length
  const casualCount = casualMarkers.filter(marker => text.includes(marker)).length
  
  if (formalCount > casualCount) return 'formal'
  if (casualCount > formalCount) return 'casual'
  return 'neutral'
}

function determinePersonalSharing(scenarios?: any[]): 'low' | 'moderate' | 'high' {
  if (!scenarios || scenarios.length === 0) return 'moderate'
  
  const text = scenarios.map(s => s.expectedResponse || '').join(' ').toLowerCase()
  const personalMarkers = ['i feel', 'i think', 'my experience', 'personally', 'i believe']
  const count = personalMarkers.filter(marker => text.includes(marker)).length
  
  if (count > 3) return 'high'
  if (count > 1) return 'moderate' 
  return 'low'
}

function analyzeConversationContext(messages: any[], latestMessage: string): any {
  const lowerMessage = latestMessage.toLowerCase()
  
  // Analyze intent and context
  const businessKeywords = ['business', 'work', 'project', 'collaboration', 'opportunity', 'partnership', 'consulting', 'advice', 'help with', 'expertise', 'investor', 'investment', 'funding', 'reporter', 'interview', 'story']
  const schedulingKeywords = ['meet', 'call', 'schedule', 'available', 'time', 'appointment', 'free', 'calendar', 'meeting', 'zoom', 'phone']
  const questionIndicators = ['how', 'what', 'why', 'when', 'where', 'can you', 'do you', 'would you', 'could you']
  
  const hasBusinessKeywords = businessKeywords.some(keyword => lowerMessage.includes(keyword))
  const hasSchedulingKeywords = schedulingKeywords.some(keyword => lowerMessage.includes(keyword))
  const hasQuestionIndicators = questionIndicators.some(indicator => lowerMessage.includes(indicator))
  const isQuestion = lowerMessage.includes('?') || hasQuestionIndicators
  
  // Determine conversation stage
  const messageCount = messages.length
  const isEarlyConversation = messageCount <= 4
  
  // Better intent classification
  let intent = 'general'
  if (hasBusinessKeywords && hasSchedulingKeywords) {
    intent = 'business_meeting_request'
  } else if (hasBusinessKeywords) {
    intent = 'business_inquiry'
  } else if (hasSchedulingKeywords) {
    intent = 'meeting_request'
  }
  
  return {
    intent,
    isQuestion,
    hasBusinessContext: hasBusinessKeywords,
    hasSchedulingContext: hasSchedulingKeywords,
    conversationStage: isEarlyConversation ? 'early' : 'established',
    messageCount
  }
}
