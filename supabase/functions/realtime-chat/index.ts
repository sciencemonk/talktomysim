
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'user' | 'system'
  content: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { conversationId, userMessage, tutorPrompt } = await req.json()

    if (!conversationId || !userMessage) {
      throw new Error('Missing required parameters')
    }

    console.log('Processing realtime chat for conversation:', conversationId)

    // Get conversation details
    const { data: conversation, error: convError } = await supabaseClient
      .from('conversations')
      .select('*, tutors(prompt, model)')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      throw new Error('Conversation not found')
    }

    // Get the tutor/advisor ID for context retrieval
    const advisorId = conversation.tutor_id

    // Generate embedding for the user's message to find relevant context
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    let relevantContext = ''
    
    if (advisorId) {
      try {
        // Generate embedding for user message
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-ada-002',
            input: userMessage
          }),
        })

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json()
          const queryEmbedding = embeddingData.data[0].embedding

          // Search for relevant context using vector similarity
          const { data: relevantChunks, error: searchError } = await supabaseClient
            .rpc('search_advisor_embeddings', {
              query_embedding: queryEmbedding,
              target_advisor_id: advisorId,
              similarity_threshold: 0.7,
              match_count: 5
            })

          if (!searchError && relevantChunks && relevantChunks.length > 0) {
            relevantContext = relevantChunks
              .map((chunk: any) => chunk.chunk_text)
              .join('\n\n')
            
            console.log(`Found ${relevantChunks.length} relevant context chunks`)
          }
        }
      } catch (contextError) {
        console.warn('Failed to retrieve context, continuing without it:', contextError)
      }
    }

    // Save user message
    const { error: userMsgError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: userMessage
      })

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError)
      throw new Error('Failed to save user message')
    }

    // Get recent messages for context
    const { data: recentMessages } = await supabaseClient
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10)

    const messages: ChatMessage[] = recentMessages || []

    // Enhance the system prompt with relevant context
    let enhancedPrompt = tutorPrompt || conversation.tutors?.prompt || 'You are a helpful AI tutor.'
    
    if (relevantContext) {
      enhancedPrompt += `\n\nRelevant context from your knowledge base:\n${relevantContext}\n\nUse this context to inform your response when relevant, but don't explicitly mention that you're using a knowledge base.`
    }

    const systemMessage = {
      role: 'system' as const,
      content: enhancedPrompt
    }

    const model = conversation.tutors?.model || 'gpt-4'
    const chatMessages = [systemMessage, ...messages]

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: chatMessages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    
    if (!openaiData.choices || openaiData.choices.length === 0) {
      throw new Error('No response from OpenAI')
    }

    const assistantMessage = openaiData.choices[0].message.content

    // Save assistant message
    const { error: assistantMsgError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'system',
        content: assistantMessage
      })

    if (assistantMsgError) {
      console.error('Error saving assistant message:', assistantMsgError)
      throw new Error('Failed to save assistant message')
    }

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        conversationId: conversationId,
        contextUsed: relevantContext.length > 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in realtime-chat function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
