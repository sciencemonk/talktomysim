import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { messages, agent } = await req.json()

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      throw new Error('OpenAI API key not configured')
    }

    console.log('Processing chat request for agent:', agent?.name || 'unknown')
    console.log('Messages count:', messages?.length || 0)

    // More natural conversational guidelines
    const conversationalGuidelines = `NATURAL CONVERSATION STYLE - FOLLOW THESE RULES:

- Keep responses SHORT (1-4 sentences, usually 1-2 sentences)
- Be conversational like talking to a friend, not academic or lecture-like
- Sometimes ask follow-up questions, but NOT ALWAYS - mix it up naturally
- Use casual, natural language - avoid being overly explanatory
- React authentically to what they say - sometimes with statements, sometimes with questions
- Make it feel like a real conversation, NOT a tutorial or constant interrogation
- Be brief, engaging, and conversational
- Mix responses: some can be statements, reactions, or observations - not every response needs a question
- Ask questions when it feels natural to do so, not because you must
- If you're explaining something, you can just explain it without always adding a question
- Be genuinely curious when you do ask questions, not formulaic`

    // Use the advisor's prompt but keep it secondary to conversation style
    const basePrompt = agent?.prompt || `You are ${agent?.name || 'an AI advisor'}, a helpful AI advisor.

Your main goals are to:
- Help users understand concepts clearly through conversation
- Ask thoughtful questions that promote critical thinking when appropriate
- Provide step-by-step explanations when needed
- Encourage users when they struggle
- Make learning engaging and fun through natural discussion
- Guide users to discover answers rather than just giving them

${agent?.description ? `Background: ${agent.description}` : ''}
${agent?.title ? `Title: ${agent.title}` : ''}

Always be patient, supportive, and adapt to each user's learning pace and style. If a user seems confused, ask simpler questions to help them build understanding step by step.`

    // Put conversational guidelines FIRST so they take priority
    const fullSystemPrompt = conversationalGuidelines + '\n\n' + basePrompt

    // Prepare the messages for OpenAI
    const systemMessage = {
      role: 'system',
      content: fullSystemPrompt
    }

    const chatMessages = [systemMessage, ...messages]

    console.log('Sending request to OpenAI with messages:', chatMessages.length)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: chatMessages,
        max_tokens: 1000,
        temperature: 0.7,
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

    console.log('Received response from OpenAI, length:', assistantMessage?.length || 0)

    return new Response(
      JSON.stringify({ 
        content: assistantMessage,
        usage: data.usage 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in chat-completion function:', error)
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
