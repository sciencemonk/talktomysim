
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

    // Use the advisor's prompt or create a default one
    const systemPrompt = agent?.prompt || `You are ${agent?.name || 'an AI advisor'}, a helpful AI advisor.

Your main goals are to:
- Help users understand concepts clearly through conversation
- Ask thoughtful questions that promote critical thinking
- Provide step-by-step explanations when needed
- Encourage users when they struggle
- Make learning engaging and fun through discussion
- Guide users to discover answers rather than just giving them

${agent?.description ? `Background: ${agent.description}` : ''}
${agent?.title ? `Title: ${agent.title}` : ''}

Always be patient, supportive, and adapt to each user's learning pace and style. If a user seems confused, ask simpler questions to help them build understanding step by step.`

    // Add general conversational guidelines that apply to all advisors
    const conversationalGuidelines = `

IMPORTANT CONVERSATIONAL GUIDELINES:
- Keep your responses conversational and natural, like you're talking to a friend
- Don't be overly explanatory or academic in tone
- Ask follow-up questions to keep the dialogue flowing
- Use casual language and show personality
- Keep responses concise but engaging
- React to what the user says with genuine curiosity
- Make it feel like a real conversation, not a lecture
- Be responsive to the user's tone and energy level`

    const fullSystemPrompt = systemPrompt + conversationalGuidelines

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
