// @ts-nocheck
/* eslint-disable */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { conversationId, advisorId, forceReprocess = false, messages: providedMessages = null } = await req.json()

    if (!conversationId || !advisorId) {
      throw new Error('conversationId and advisorId are required')
    }

    console.log('Processing conversation embedding for:', { conversationId, advisorId, hasProvidedMessages: !!providedMessages })

    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if we already have embeddings for this conversation
    if (!forceReprocess) {
      const { data: existing } = await supabaseClient
        .from('conversation_embeddings')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('advisor_id', advisorId)
        .single()

      if (existing) {
        console.log('Conversation already processed, skipping')
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Conversation already processed',
            conversationId 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Get conversation messages - use provided messages if available, otherwise fetch from database
    let messages = []
    
    if (providedMessages && providedMessages.length > 0) {
      console.log(`Using ${providedMessages.length} provided messages for processing`)
      messages = providedMessages
    } else {
      console.log('Fetching messages from database')
      
      // Fetch from database
      const { data: dbMessages, error: messagesError } = await supabaseClient
        .from('messages')
        .select('role, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Error fetching messages:', messagesError)
        throw new Error('Failed to fetch conversation messages')
      }

      messages = dbMessages || []
    }

    if (!messages || messages.length === 0) {
      console.log('No messages found for conversation:', conversationId)
      console.log('Provided messages:', !!providedMessages)
      console.log('Conversation exists in database:', !!conversationId)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No messages found for conversation',
          conversationId,
          debugInfo: {
            hadProvidedMessages: !!providedMessages,
            conversationId: conversationId
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Processing ${messages.length} messages for conversation ${conversationId}`)

    // Process conversation content
    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n')

    // Extract metadata
    const userMessages = messages.filter(m => m.role === 'user')
    const assistantMessages = messages.filter(m => m.role === 'system')
    
    const lowerConversationText = conversationText.toLowerCase();
    const metadata = {
      userMessageCount: userMessages.length,
      assistantMessageCount: assistantMessages.length,
      conversationLength: conversationText.length,
      firstMessageAt: messages[0]?.created_at,
      lastMessageAt: messages[messages.length - 1]?.created_at,
      topics: extractTopics(conversationText),
      sentiment: analyzeSentiment(conversationText),
      hasEscalation: lowerConversationText.includes('escalat') || 
                    lowerConversationText.includes('manager') ||
                    lowerConversationText.includes('supervisor'),
      hasMeetingRequest: lowerConversationText.includes('meeting') ||
                        lowerConversationText.includes('schedule') ||
                        lowerConversationText.includes('call') ||
                        lowerConversationText.includes('interview') ||
                        lowerConversationText.includes('appointment') ||
                        lowerConversationText.includes('demo') ||
                        lowerConversationText.includes('chat') ||
                        lowerConversationText.includes('discuss') ||
                        lowerConversationText.includes('talk'),
      containsContact: lowerConversationText.includes('@') ||
                      lowerConversationText.includes('phone') ||
                      lowerConversationText.includes('email') ||
                      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(conversationText), // Phone number pattern
      contactInfo: extractContactInfo(conversationText),
      isMediaRequest: lowerConversationText.includes('journalist') ||
                     lowerConversationText.includes('reporter') ||
                     lowerConversationText.includes('times') ||
                     lowerConversationText.includes('newspaper') ||
                     lowerConversationText.includes('magazine') ||
                     lowerConversationText.includes('article') ||
                     lowerConversationText.includes('story') ||
                     lowerConversationText.includes('press')
    }

    // Determine participant type
    let participantType = 'anonymous'
    const conversation = await supabaseClient
      .from('conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single()

    if (conversation.data) {
      participantType = conversation.data.user_id ? 'authenticated' : 'anonymous'
    }

    // Generate embedding using OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Create a condensed version for embedding (max 8000 chars to stay within token limits)
    const embeddingText = conversationText.length > 8000 
      ? conversationText.substring(0, 8000) + '...[conversation continues]'
      : conversationText

    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: embeddingText,
        model: 'text-embedding-ada-002'
      })
    })

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`Failed to generate embedding: ${embeddingResponse.status}`)
    }

    const embeddingData = await embeddingResponse.json()
    const embedding = embeddingData.data[0].embedding

    // Store the embedding
    const { error: insertError } = await supabaseClient
      .from('conversation_embeddings')
      .insert({
        conversation_id: conversationId,
        advisor_id: advisorId,
        content_text: embeddingText,
        content_type: 'full',
        participant_type: participantType,
        message_count: messages.length,
        conversation_date: messages[0]?.created_at,
        embedding: `[${embedding.join(',')}]`,
        metadata
      })

    if (insertError) {
      console.error('Error storing conversation embedding:', insertError)
      throw new Error('Failed to store conversation embedding')
    }

    console.log(`Successfully processed conversation embedding for ${conversationId}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        conversationId,
        messageCount: messages.length,
        metadata
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing conversation embedding:', error)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        conversationId: conversationId || 'unknown',
        details: error.stack
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper function to extract topics from conversation text
function extractTopics(text: string): string[] {
  const topics = []
  const lowerText = text.toLowerCase()
  
  // Common business topics
  const topicKeywords = {
    'pricing': ['price', 'cost', 'expensive', 'cheap', 'budget', 'pricing', 'payment', 'rate', 'fee'],
    'support': ['help', 'support', 'issue', 'problem', 'bug', 'error', 'assistance', 'trouble'],
    'features': ['feature', 'functionality', 'capability', 'option', 'tool', 'function'],
    'integration': ['integrate', 'api', 'connect', 'sync', 'import', 'export', 'plugin'],
    'account': ['account', 'profile', 'settings', 'subscription', 'login', 'signup'],
    'meeting': ['meeting', 'call', 'schedule', 'appointment', 'demo', 'interview', 'chat', 'talk', 'discuss', 'meet', 'session', 'consultation', 'catch up', 'connect', 'time to talk', 'calendly', 'calendar'],
    'feedback': ['feedback', 'suggestion', 'improve', 'review', 'opinion', 'thoughts'],
    'technical': ['technical', 'setup', 'configuration', 'install', 'server', 'development'],
    'media': ['interview', 'article', 'story', 'journalist', 'press', 'media', 'publication', 'newspaper', 'magazine', 'times', 'post', 'reporter']
  }

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      topics.push(topic)
    }
  }

  return topics
}

// Helper function to extract contact information
function extractContactInfo(text: string): { emails: string[], names: string[], organizations: string[] } {
  const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
  
  // Extract names (simple pattern for "I'm [Name]" or similar)
  const namePattern = /(?:i'?m |my name is |i am |this is )([a-z][a-z\s]{1,30}?)(?:[,.]|$)/gi
  const nameMatches = text.match(namePattern) || []
  const names = nameMatches.map(match => 
    match.replace(/(?:i'?m |my name is |i am |this is )/gi, '').replace(/[,.]$/, '').trim()
  ).filter(name => name.length > 1 && name.length < 50)
  
  // Extract organizations (simple patterns)
  const orgPatterns = [
    /(?:from |at |with )(the )?(new york times|nyt|times|post|wall street journal|wsj|cnn|bbc|reuters|bloomberg|techcrunch|forbes|wired|verge)/gi,
    /(?:from |at |with )([a-z][a-z\s&]{2,30}(?:inc|corp|company|llc|ltd|magazine|newspaper|times|post|journal))/gi
  ]
  
  const organizations = []
  orgPatterns.forEach(pattern => {
    const matches = text.match(pattern) || []
    matches.forEach(match => {
      const org = match.replace(/(?:from |at |with |the )/gi, '').trim()
      if (org.length > 2 && org.length < 50) {
        organizations.push(org)
      }
    })
  })
  
  return { emails, names, organizations }
}

// Helper function to analyze sentiment
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['great', 'excellent', 'awesome', 'love', 'perfect', 'amazing', 'helpful', 'thanks', 'good']
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'frustrated', 'angry', 'disappointed', 'worst', 'useless']
  
  const lowerText = text.toLowerCase()
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length
  
  if (positiveCount > negativeCount + 1) return 'positive'
  if (negativeCount > positiveCount + 1) return 'negative'
  return 'neutral'
}
