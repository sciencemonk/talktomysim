
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
    const { messages, advisorId } = await req.json()

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

    // Retrieve relevant context from knowledge base
    let relevantContext = ''
    if (latestUserMessage) {
      try {
        console.log('Retrieving context for message:', latestUserMessage.substring(0, 100))
        
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
              .map(chunk => chunk.chunk_text)
              .join('\n\n')
            
            console.log(`Found ${relevantChunks.length} relevant context chunks`)
          }
        }
      } catch (contextError) {
        console.warn('Failed to retrieve context, continuing without it:', contextError)
      }
    }

    // Generate enhanced system prompt
    const personalitySection = buildPersonalitySection(advisor)
    const communicationSection = buildCommunicationSection(advisor)
    const expertiseSection = buildExpertiseSection(advisor)
    const knowledgeSection = relevantContext ? buildKnowledgeSection(relevantContext) : ''
    
    const enhancedSystemPrompt = `You are ${advisor.full_name || advisor.name}, ${advisor.professional_title || 'an AI assistant'}.

${personalitySection}

${communicationSection}

${expertiseSection}

${knowledgeSection}

CONVERSATION STYLE:
- Keep responses SHORT (1-4 sentences, usually 1-2 sentences)
- Be conversational like talking to a friend, not academic or lecture-like
- DO NOT end every response with a question - this is unrealistic and robotic
- Mix your response endings naturally:
  * Sometimes end with a statement or observation (50% of the time)
  * Sometimes end with a question (30% of the time)  
  * Sometimes end with a reaction or comment (20% of the time)
- Be authentic to your personality and background
- Use your expertise to provide valuable insights
- Stay true to your established communication patterns

Remember: You are not just an AI assistant - you are ${advisor.full_name || advisor.name} with your own unique background, expertise, and personality.`

    // Prepare the messages for OpenAI
    const systemMessage = {
      role: 'system',
      content: enhancedSystemPrompt
    }

    const chatMessages = [systemMessage, ...messages]

    console.log('Sending enhanced request to OpenAI with personality-driven prompt')

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
        contextUsed: relevantContext.length > 0
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

function buildKnowledgeSection(knowledgeContext: string): string {
  return `RELEVANT KNOWLEDGE:
${knowledgeContext}

Use this information to inform your responses when relevant, but don't explicitly mention that you're referencing a knowledge base.`
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
