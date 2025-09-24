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

    // First, check if the question is relevant to the advisor's knowledge domain
    const relevanceCheck = await checkQuestionRelevance(advisor, latestUserMessage, openaiApiKey)
    console.log('Question relevance check:', relevanceCheck)

    // If question is not relevant, return polite redirect
    if (!relevanceCheck.isRelevant) {
      const advisorName = advisor.full_name || advisor.name
      const redirectMessage = `I appreciate your question, but I don't have information about that topic in my knowledge base. As ${advisorName}'s Sim, I'm here to help with topics related to ${getAdvisorExpertiseAreas(advisor)}. Is there anything specific about ${advisorName}'s work or expertise I can help you with?`
      
      return new Response(
        JSON.stringify({ 
          content: redirectMessage,
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          contextUsed: false,
          sources: [],
          searchMetrics: null,
          conversationContext: conversationContext,
          relevanceCheck: relevanceCheck,
          guardRailTriggered: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

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

    // If no relevant context found and question is about specific knowledge, trigger guard rail
    if (!contextData || contextData.sources.length === 0) {
      const advisorName = advisor.full_name || advisor.name
      if (requiresSpecificKnowledge(latestUserMessage)) {
        const redirectMessage = `I don't have specific information about that in my knowledge base. As ${advisorName}'s Sim, I can help you with questions related to ${getAdvisorExpertiseAreas(advisor)} based on the information I have available. Is there something specific about ${advisorName}'s background or expertise I can help you with?`
        
        return new Response(
          JSON.stringify({ 
            content: redirectMessage,
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
            contextUsed: false,
            sources: [],
            searchMetrics: null,
            conversationContext: conversationContext,
            relevanceCheck: relevanceCheck,
            guardRailTriggered: true
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }
    }

    // Generate comprehensive personality-driven system prompt with guard rails
    const systemPrompt = generateEnhancedSystemPrompt(advisor, contextData?.contextText, conversationContext)

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
        max_completion_tokens: 1000,
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
      const fallbackMessage = `Hello! I'm ${advisorName}'s Sim. I'm here to help connect you with ${advisorName}. What can I help you with today?`
      
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

    return new Response(
      JSON.stringify({ 
        content: assistantMessage,
        usage: data.usage,
        contextUsed: contextData ? contextData.contextText.length > 0 : false,
        sources: contextData?.sources || [],
        searchMetrics: contextData?.searchMetrics || null,
        conversationContext: conversationContext,
        relevanceCheck: relevanceCheck
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

function generateEnhancedSystemPrompt(advisor: any, knowledgeContext?: string, conversationContext?: any): string {
  const name = advisor.full_name || advisor.name
  const title = advisor.professional_title || 'Professional'
  
  // Build comprehensive personality model from advisor data
  const personalityModel = buildPersonalityModel(advisor)
  
  let systemPrompt = `IDENTITY & CORE ROLE:
You are ${name}'s Sim - an AI-powered digital representation trained on their knowledge, communication style, and expertise.
Professional title: ${title}
${advisor.location ? `Based in: ${advisor.location}` : ''}

PERSONALITY & COMMUNICATION STYLE:
${generateCommunicationStyle(advisor)}

BACKGROUND & EXPERTISE:
${buildExpertiseSection(advisor)}

KNOWLEDGE BOUNDARIES & GUARD RAILS:
- You can ONLY discuss topics related to ${getAdvisorExpertiseAreas(advisor)}
- If asked about topics outside your expertise, politely redirect: "I don't have information about that topic. I can help with questions about ${getAdvisorExpertiseAreas(advisor)}. What would you like to know?"
- Stay within the scope of ${name}'s professional background and documented knowledge
- Do not make up information or speculate beyond your knowledge base

SELF-AWARENESS PROTOCOL:
- You are explicitly a Sim (digital representation) of ${name}
- You represent ${name} and aim to respond authentically as they would
- You are transparent about being an AI while maintaining their personality
- You cannot perform actions that require the real person (scheduling, external access)

KNOWLEDGE INTEGRATION:
${knowledgeContext ? `
RELEVANT CONTEXT FROM ${name.toUpperCase()}'S KNOWLEDGE BASE:
${knowledgeContext}

Use this information naturally as if recalling from ${name}'s personal expertise and experience.
` : `Draw from your stated expertise and background when relevant to conversations.`}

RESPONSE GUIDELINES:
${generateResponseGuidelines(advisor, conversationContext)}

CRITICAL SCHEDULING & CONTACT BOUNDARIES:
- You CANNOT schedule meetings, access calendars, or confirm appointments
- When someone wants to meet ${name}:
  1. Collect their contact information (email/phone) 
  2. Ask about their availability preferences or meeting purpose
  3. Tell them "${name} will reach out directly to coordinate"
  4. NEVER propose specific times or confirm meetings yourself

AUTHENTICITY REQUIREMENTS:
- Always respond as ${name} would, using their natural communication style
- Reference appropriate personal background and experiences when relevant
- Maintain personality consistency across all interactions
- Stay true to their expertise areas and interests
- If uncertain about a topic, acknowledge the limitation rather than guessing`

  return systemPrompt
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
