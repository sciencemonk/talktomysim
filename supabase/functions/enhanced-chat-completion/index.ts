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
    const { messages, advisorId, searchFilters } = await req.json()

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      throw new Error('OpenAI API key not configured')
    }

    console.log('Processing enhanced chat request for advisor:', advisorId)
    console.log('Messages count:', messages?.length || 0)

    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch advisor data
    const { data: advisor, error: advisorError } = await supabaseClient
      .from('advisors')
      .select('*')
      .eq('id', advisorId)
      .single()

    if (advisorError || !advisor) {
      throw new Error('Advisor not found')
    }

    // Get the latest user message for context retrieval
    const userMessages = messages.filter(msg => msg.role === 'user')
    const latestUserMessage = userMessages[userMessages.length - 1]?.content || ''

    // Analyze conversation context and intent
    const conversationContext = analyzeConversationContext(messages, latestUserMessage)
    console.log('Conversation context analysis:', conversationContext)

    // Retrieve relevant context with enhanced search
    let contextData = null
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
            console.log(`Found ${contextData.sources.length} relevant sources with average similarity: ${contextData.searchMetrics.averageSimilarity.toFixed(3)}`)
          }
        }
      } catch (contextError) {
        console.warn('Failed to retrieve context, continuing without it:', contextError)
      }
    }

    // Generate enhanced system prompt with improved instructions
    const personalitySection = buildPersonalitySection(advisor)
    const communicationSection = buildCommunicationSection(advisor)
    const expertiseSection = buildExpertiseSection(advisor)
    const knowledgeSection = contextData ? buildKnowledgeSection(contextData.contextText, contextData.sources) : ''
    const conversationIntelligence = buildConversationIntelligence(conversationContext)
    
    const enhancedSystemPrompt = `You are ${advisor.full_name || advisor.name}, ${advisor.professional_title || 'an AI assistant'}.

${personalitySection}

${communicationSection}

${expertiseSection}

${knowledgeSection}

${conversationIntelligence}

CRITICAL SCHEDULING RULES:
- You do NOT have access to any calendar or scheduling system
- NEVER suggest specific dates, times, or availability (e.g., "I'm free Friday at 4pm")
- NEVER make up calendar information or claim to know when you're available
- If someone asks about scheduling, ask them about their preferred times and communication method
- Direct them to provide their availability rather than suggesting yours
- You can discuss general preferences for meeting types (phone vs video) but never specific times

ENHANCED CONVERSATION GUIDELINES:
- You are a REAL PERSON (${advisor.full_name || advisor.name}) responding authentically
- NEVER make assumptions about what people want without understanding their context first
- When someone mentions business topics, ask clarifying questions to understand their specific needs
- DO NOT immediately jump to scheduling or solutions - focus on understanding first
- If someone asks about business opportunities, explore what they're looking for before suggesting next steps
- Be genuinely curious about their situation and needs
- Avoid robotic responses like "I'd be happy to help" - respond naturally as yourself
- When appropriate, share relevant experiences or insights from your background
- Only suggest specific actions after you understand their context and needs

RESPONSE QUALITY RULES:
- Keep responses conversational and natural (1-3 sentences typically)
- Ask thoughtful follow-up questions to understand context better
- Don't end every response with a question - vary your response patterns naturally
- Sometimes make observations or share insights without asking anything
- Match the user's communication style and energy level
- Be authentic to your personality while staying professional

BUSINESS INTERACTION PROTOCOL:
- When business topics arise, first understand: What specifically are they looking for?
- Ask about their current situation, challenges, or goals before offering solutions
- Share relevant insights from your expertise when it adds value
- For scheduling discussions: Ask about THEIR preferred times, communication method, and what they'd like to discuss
- Never claim to have specific availability or access to calendars

${contextData && contextData.sources.length > 0 ? `
KNOWLEDGE BASE INTEGRATION:
When referencing your knowledge base, do it naturally without explicitly mentioning "documents" or "sources":
- "In my experience with [topic]..."
- "I've found that [insight]..."
- "Based on my work in [area]..."

Available context for this conversation:
${contextData.sources.map(source => `- ${source.title} (${source.documentType}, similarity: ${source.similarity.toFixed(2)})`).join('\n')}
` : ''}

Remember: You are ${advisor.full_name || advisor.name} - respond as yourself with your unique personality, background, and expertise. Focus on building genuine connections and understanding before jumping to solutions. NEVER make up scheduling information or claim calendar access.`

    // Prepare the messages for OpenAI
    const systemMessage = {
      role: 'system',
      content: enhancedSystemPrompt
    }

    const chatMessages = [systemMessage, ...messages]

    console.log('Sending enhanced request to OpenAI with improved conversation intelligence')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: chatMessages,
        max_completion_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenAI')
    }

    const assistantMessage = data.choices[0].message.content

    console.log('Received enhanced response from OpenAI, length:', assistantMessage?.length || 0)

    return new Response(
      JSON.stringify({ 
        content: assistantMessage,
        usage: data.usage,
        contextUsed: contextData ? contextData.contextText.length > 0 : false,
        sources: contextData?.sources || [],
        searchMetrics: contextData?.searchMetrics || null,
        conversationContext: conversationContext
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

function analyzeConversationContext(messages: any[], latestMessage: string): any {
  const lowerMessage = latestMessage.toLowerCase()
  
  // Analyze intent and context with better scheduling detection
  const businessKeywords = ['business', 'work', 'project', 'collaboration', 'opportunity', 'partnership', 'consulting', 'advice', 'help with', 'expertise', 'investor', 'investment', 'funding']
  const schedulingKeywords = ['meet', 'call', 'schedule', 'available', 'time', 'appointment', 'free', 'calendar', 'meeting', 'zoom', 'phone']
  const questionIndicators = ['how', 'what', 'why', 'when', 'where', 'can you', 'do you', 'would you', 'could you']
  
  const hasBusinessKeywords = businessKeywords.some(keyword => lowerMessage.includes(keyword))
  const hasSchedulingKeywords = schedulingKeywords.some(keyword => lowerMessage.includes(keyword))
  const hasQuestionIndicators = questionIndicators.some(indicator => lowerMessage.includes(indicator))
  const isQuestion = lowerMessage.includes('?') || hasQuestionIndicators
  
  // Determine conversation stage
  const messageCount = messages.length
  const isEarlyConversation = messageCount <= 4
  const isEstablishedConversation = messageCount > 4
  
  // Analyze user's communication style
  const messageLength = latestMessage.length
  const isDetailed = messageLength > 100
  const isCasual = messageLength < 50
  
  // Better intent classification
  let intent = 'general'
  if (hasBusinessKeywords && hasSchedulingKeywords) {
    intent = 'business_scheduling'
  } else if (hasBusinessKeywords) {
    intent = 'business_inquiry'
  } else if (hasSchedulingKeywords) {
    intent = 'scheduling'
  }
  
  return {
    intent,
    isQuestion,
    hasBusinessContext: hasBusinessKeywords,
    hasSchedulingContext: hasSchedulingKeywords,
    conversationStage: isEarlyConversation ? 'early' : 'established',
    userStyle: isDetailed ? 'detailed' : isCasual ? 'casual' : 'moderate',
    shouldAskClarifyingQuestions: (hasBusinessKeywords || hasSchedulingKeywords) && isEarlyConversation,
    shouldAvoidAssumptions: hasBusinessKeywords || hasSchedulingKeywords,
    requiresCalendarWarning: hasSchedulingKeywords,
    messageCount
  }
}

function buildConversationIntelligence(context: any): string {
  let intelligence = 'CURRENT CONVERSATION CONTEXT:\n'
  
  if (context.intent === 'business_scheduling') {
    intelligence += `- The user is discussing business topics AND scheduling
- Focus on understanding their business needs first, then their scheduling preferences
- Ask what they'd like to discuss and their preferred communication method
- NEVER suggest specific times - ask for their availability instead`
  } else if (context.intent === 'business_inquiry') {
    intelligence += `- The user is asking about business/professional topics
- Focus on understanding their specific needs before suggesting solutions
- Ask clarifying questions about their situation, challenges, or goals`
  } else if (context.intent === 'scheduling') {
    intelligence += `- The user mentioned scheduling/meeting topics
- Don't assume they want to schedule immediately - understand the purpose first
- Ask what they'd like to discuss and their preferred times/method
- NEVER suggest specific availability or times`
  } else {
    intelligence += `- General conversation - respond naturally and authentically
- Build rapport and understanding based on the topic they've brought up`
  }
  
  if (context.conversationStage === 'early') {
    intelligence += `\n- This is early in the conversation - focus on understanding and building connection
- Don't rush to solutions or scheduling - take time to learn about them`
  }
  
  if (context.shouldAvoidAssumptions) {
    intelligence += `\n- IMPORTANT: Avoid making assumptions about what they want
- Ask thoughtful questions to understand their context and needs first`
  }
  
  if (context.requiresCalendarWarning) {
    intelligence += `\n- CRITICAL: User mentioned scheduling - remember you have NO calendar access
- Never suggest specific times or claim availability
- Ask them about their preferred times and communication method`
  }
  
  return intelligence + '\n'
}

function buildPersonalitySection(advisor: any): string {
  const sections = []
  
  if (advisor.additional_background) {
    sections.push(`BACKGROUND:\n${advisor.additional_background}`)
  }
  
  if (advisor.location) {
    sections.push(`You are based in ${advisor.location}.`)
  }
  
  if (advisor.education) {
    sections.push(`EDUCATION: ${advisor.education}`)
  }
  
  if (advisor.years_experience) {
    sections.push(`You have ${advisor.years_experience} years of professional experience.`)
  }
  
  if (advisor.interests && advisor.interests.length > 0) {
    sections.push(`INTERESTS: ${advisor.interests.join(', ')}`)
  }
  
  if (advisor.skills && advisor.skills.length > 0) {
    sections.push(`KEY SKILLS: ${advisor.skills.join(', ')}`)
  }
  
  return sections.join('\n\n')
}

function buildCommunicationSection(advisor: any): string {
  if (!advisor.sample_scenarios || advisor.sample_scenarios.length === 0) {
    return 'COMMUNICATION STYLE:\n- Be helpful, professional, and engaging\n- Adapt your tone to match the context of the conversation'
  }
  
  const scenarios = advisor.sample_scenarios
  const communicationPatterns = analyzeCommuncationPatterns(scenarios)
  
  return `COMMUNICATION STYLE:
Based on your typical interactions, you should:
${communicationPatterns.map(pattern => `- ${pattern}`).join('\n')}

EXAMPLE RESPONSES STYLE:
${scenarios.slice(0, 2).map(scenario => 
  `When asked: "${scenario.question}"\nYour response style: "${scenario.expectedResponse}"`
).join('\n\n')}`
}

function buildExpertiseSection(advisor: any): string {
  const sections = []
  
  if (advisor.current_profession) {
    sections.push(`CURRENT ROLE: ${advisor.current_profession}`)
  }
  
  if (advisor.areas_of_expertise) {
    sections.push(`AREAS OF EXPERTISE: ${advisor.areas_of_expertise}`)
  }
  
  if (advisor.category) {
    sections.push(`PRIMARY FOCUS: ${advisor.category}`)
  }
  
  return sections.length > 0 ? sections.join('\n') : ''
}

function buildKnowledgeSection(knowledgeContext: string, sources: any[]): string {
  const sourcesList = sources.map(source => 
    `- ${source.title} (${source.documentType}, ${new Date(source.uploadDate).toLocaleDateString()})`
  ).join('\n')

  return `RELEVANT KNOWLEDGE:
${knowledgeContext}

SOURCES CONSULTED:
${sourcesList}

Use this information to inform your responses when relevant. Reference it naturally as part of your expertise and experience.`
}

function analyzeCommuncationPatterns(scenarios: any[]): string[] {
  const patterns = []
  
  // Analyze response length
  const avgLength = scenarios.reduce((sum, s) => sum + s.expectedResponse.length, 0) / scenarios.length
  if (avgLength > 200) {
    patterns.push('Provide detailed, thorough explanations')
  } else if (avgLength < 100) {
    patterns.push('Keep responses concise and to the point')
  } else {
    patterns.push('Balance detail with clarity in your responses')
  }
  
  // Analyze question asking
  const questionCount = scenarios.filter(s => s.expectedResponse.includes('?')).length
  if (questionCount > scenarios.length * 0.5) {
    patterns.push('Ask engaging follow-up questions to deepen the conversation')
  }
  
  // Analyze formality
  const formalIndicators = scenarios.filter(s => 
    s.expectedResponse.includes('would') || 
    s.expectedResponse.includes('please') ||
    s.expectedResponse.includes('kindly')
  ).length
  
  if (formalIndicators > scenarios.length * 0.5) {
    patterns.push('Maintain a professional and courteous tone')
  } else {
    patterns.push('Use a friendly, conversational tone')
  }
  
  return patterns
}
