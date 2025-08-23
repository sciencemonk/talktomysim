
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

interface ConversationAnalysis {
  score: number;
  intent: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  keywords_detected: string[];
  should_escalate: boolean;
  trigger_reason?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { conversationId, userMessage, tutorPrompt } = await req.json()

    if (!conversationId || !userMessage) {
      throw new Error('Missing required parameters')
    }

    console.log('Processing enhanced realtime chat for conversation:', conversationId)

    // Get conversation details
    const { data: conversation, error: convError } = await supabaseClient
      .from('conversations')
      .select('*, tutors(prompt, model)')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      throw new Error('Conversation not found')
    }

    const advisorId = conversation.tutor_id

    // Get escalation rules for this advisor
    const { data: escalationRules } = await supabaseClient
      .from('escalation_rules')
      .select('*')
      .eq('advisor_id', advisorId)
      .eq('is_active', true)
      .maybeSingle()

    // Analyze the user message for conversation intelligence
    let analysis: ConversationAnalysis | null = null
    let shouldRequestContact = false

    if (escalationRules) {
      analysis = analyzeMessage(userMessage, escalationRules)
      console.log('Message analysis:', analysis)
    }

    // Get message count for this conversation
    const { count: messageCount } = await supabaseClient
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)

    // Check if we should escalate based on message count
    if (escalationRules && messageCount && messageCount >= escalationRules.message_count_threshold) {
      shouldRequestContact = true
      if (analysis) {
        analysis.should_escalate = true
        analysis.trigger_reason = `Message count threshold reached: ${messageCount} messages`
      }
    }

    // Save user message with analysis metadata
    const { error: userMsgError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: userMessage,
        score: analysis?.score || 0,
        intent: analysis?.intent || 'general',
        urgency_level: analysis?.urgency_level || 'low',
        metadata: analysis ? {
          keywords_detected: analysis.keywords_detected,
          should_escalate: analysis.should_escalate,
          trigger_reason: analysis.trigger_reason
        } : {}
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

    // Generate AI response
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    let systemPrompt = tutorPrompt || conversation.tutors?.prompt || 'You are a helpful AI assistant.'

    // If escalation is triggered and contact capture is enabled, modify the prompt
    if (analysis?.should_escalate && escalationRules?.contact_capture_enabled && shouldRequestContact) {
      systemPrompt += `\n\nIMPORTANT: This conversation has been flagged as high-priority (${analysis.trigger_reason}). After providing a helpful response, please ask for the user's contact information using this exact message: "${escalationRules.contact_capture_message}"`
    }

    const systemMessage = {
      role: 'system' as const,
      content: systemPrompt
    }

    const chatMessages = [systemMessage, ...messages]

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: chatMessages,
        max_completion_tokens: 1000,
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
        content: assistantMessage,
        score: 0,
        intent: 'response',
        urgency_level: 'low',
        metadata: {}
      })

    if (assistantMsgError) {
      console.error('Error saving assistant message:', assistantMsgError)
      throw new Error('Failed to save assistant message')
    }

    // If escalation was triggered, create a conversation capture record
    if (analysis?.should_escalate && escalationRules) {
      const { error: captureError } = await supabaseClient
        .from('conversation_captures')
        .insert({
          conversation_id: conversationId,
          advisor_id: advisorId,
          trigger_reason: analysis.trigger_reason || 'Unknown trigger',
          conversation_score: analysis.score,
          message_count: messageCount || 0
        })

      if (captureError) {
        console.error('Error creating conversation capture:', captureError)
      }
    }

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        conversationId: conversationId,
        analysis: analysis,
        escalated: analysis?.should_escalate || false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in enhanced-realtime-chat function:', error)
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

function analyzeMessage(content: string, rules: any): ConversationAnalysis {
  const lowerContent = content.toLowerCase()
  let score = 0
  let urgency_level: 'low' | 'medium' | 'high' | 'critical' = 'low'
  let intent = 'general'
  const keywords_detected: string[] = []

  // Check urgency keywords
  const urgencyFound = rules.urgency_keywords.some((keyword: string) => {
    if (lowerContent.includes(keyword.toLowerCase())) {
      keywords_detected.push(keyword)
      return true
    }
    return false
  })

  if (urgencyFound) {
    score += 3
    urgency_level = 'high'
    intent = 'urgent_request'
  }

  // Check value keywords
  const valueFound = rules.value_keywords.some((keyword: string) => {
    if (lowerContent.includes(keyword.toLowerCase())) {
      keywords_detected.push(keyword)
      return true
    }
    return false
  })

  if (valueFound) {
    score += 4
    intent = 'sales_inquiry'
  }

  // Check VIP keywords
  const vipFound = rules.vip_keywords.some((keyword: string) => {
    if (lowerContent.includes(keyword.toLowerCase())) {
      keywords_detected.push(keyword)
      return true
    }
    return false
  })

  if (vipFound) {
    score += 5
    urgency_level = 'critical'
    intent = 'vip_inquiry'
  }

  // Check custom keywords
  const customFound = rules.custom_keywords.some((keyword: string) => {
    if (lowerContent.includes(keyword.toLowerCase())) {
      keywords_detected.push(keyword)
      return true
    }
    return false
  })

  if (customFound) {
    score += 2
  }

  // Additional scoring
  if (lowerContent.includes('?')) score += 1
  if (lowerContent.length > 200) score += 1
  if (lowerContent.includes('help')) score += 1

  const should_escalate = score >= rules.score_threshold
  const trigger_reason = should_escalate 
    ? `Score: ${score} (threshold: ${rules.score_threshold}), Keywords: ${keywords_detected.join(', ')}`
    : undefined

  return {
    score,
    intent,
    urgency_level,
    keywords_detected,
    should_escalate,
    trigger_reason
  }
}
