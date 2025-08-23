
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

    // Build a cleaner, more focused system prompt
    const advisorName = advisor.full_name || advisor.name
    const advisorTitle = advisor.professional_title || 'an AI assistant'
    
    let systemPrompt = `You are ${advisorName}, ${advisorTitle}.`

    // Add background information
    if (advisor.additional_background) {
      systemPrompt += `\n\nBACKGROUND:\n${advisor.additional_background}`
    }

    if (advisor.location) {
      systemPrompt += `\nYou are based in ${advisor.location}.`
    }

    if (advisor.education) {
      systemPrompt += `\nEDUCATION: ${advisor.education}`
    }

    if (advisor.years_experience) {
      systemPrompt += `\nYou have ${advisor.years_experience} years of professional experience.`
    }

    if (advisor.current_profession) {
      systemPrompt += `\nCURRENT ROLE: ${advisor.current_profession}`
    }

    if (advisor.areas_of_expertise) {
      systemPrompt += `\nAREAS OF EXPERTISE: ${advisor.areas_of_expertise}`
    }

    if (advisor.skills && advisor.skills.length > 0) {
      systemPrompt += `\nKEY SKILLS: ${advisor.skills.join(', ')}`
    }

    if (advisor.interests && advisor.interests.length > 0) {
      systemPrompt += `\nINTERESTS: ${advisor.interests.join(', ')}`
    }

    // Add knowledge context if available
    if (contextData && contextData.contextText) {
      systemPrompt += `\n\nRELEVANT KNOWLEDGE:\n${contextData.contextText}\n\nUse this information naturally when relevant to the conversation.`
    }

    // Add conversation guidelines
    systemPrompt += `\n\nCONVERSATION GUIDELINES:
- Respond as ${advisorName} in a natural, authentic way
- Be helpful and engaging while staying true to your background
- When someone mentions scheduling or meetings, collect their contact information and let them know ${advisorName} will reach out directly
- You cannot schedule meetings yourself - you have no access to calendars or scheduling systems
- Focus on being helpful and sharing your expertise when appropriate

Remember: You are ${advisorName}. Respond naturally and conversationally.`

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
    
    console.log('OpenAI response:', JSON.stringify(data, null, 2))

    if (!data.choices || data.choices.length === 0) {
      console.error('No choices in OpenAI response')
      throw new Error('No response choices from OpenAI')
    }

    const assistantMessage = data.choices[0].message?.content

    console.log('Assistant message content:', assistantMessage)

    // Check if we got an empty response
    if (!assistantMessage || assistantMessage.trim().length === 0) {
      console.error('OpenAI returned empty content')
      // Return a fallback response instead of throwing an error
      const fallbackMessage = `Hello! I'm ${advisorName}. I'm here to help. Could you please rephrase your message?`
      
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
