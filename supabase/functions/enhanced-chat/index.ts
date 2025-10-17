import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: string;
  content: string;
}

interface Agent {
  id?: string;
  name: string;
  type: string;
  subject: string;
  description: string;
  prompt: string;
  gradeLevel?: string;
  learningObjective?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const { messages, agent, userId }: { messages: ChatMessage[], agent: Agent, userId?: string } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if user is the creator of this sim
    let isCreator = false;
    let userWalletAddress = null;
    let walletAnalysis = null;
    let conversationHistory: any[] = [];
    
    if (userId && agent) {
      const { data: advisor } = await supabase
        .from('advisors')
        .select('user_id')
        .eq('id', agent.id || '')
        .single();
      
      isCreator = advisor?.user_id === userId;
      
      // If creator, get their wallet address and conversation history
      if (isCreator) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('wallet_address')
          .eq('id', userId)
          .single();
        
        userWalletAddress = profile?.wallet_address;
        
        // Fetch recent PUBLIC visitor conversations with the sim (exclude creator's own chats)
        const { data: recentConvos } = await supabase
          .from('conversations')
          .select('id, created_at, is_anonymous')
          .eq('tutor_id', agent.id || '')
          .eq('is_creator_conversation', false) // Only public visitor conversations
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (recentConvos && recentConvos.length > 0) {
          // Get message samples from each conversation
          for (const convo of recentConvos) {
            const { data: messages } = await supabase
              .from('messages')
              .select('role, content, created_at')
              .eq('conversation_id', convo.id)
              .order('created_at', { ascending: true })
              .limit(10);
            
            if (messages && messages.length > 0) {
              const userMessages = messages.filter(m => m.role === 'user');
              conversationHistory.push({
                date: convo.created_at,
                isAnonymous: convo.is_anonymous,
                messageCount: messages.length,
                sampleQuestions: userMessages.slice(0, 3).map(m => m.content)
              });
            }
          }
        }
      }
    }
    
    console.log('Is creator:', isCreator);
    console.log('User wallet:', userWalletAddress);
    console.log('Conversation history count:', conversationHistory.length);
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!openaiApiKey || !perplexityApiKey) {
      throw new Error('Missing API keys');
    }

    const userMessage = messages[messages.length - 1]?.content || '';
    console.log('User message:', userMessage);
    console.log('Agent:', agent.name);
    
    // Check if user is asking about wallet/crypto and they're the creator with a wallet
    const needsWalletAnalysis = isCreator && userWalletAddress && 
      (userMessage.toLowerCase().includes('wallet') || 
       userMessage.toLowerCase().includes('holdings') || 
       userMessage.toLowerCase().includes('portfolio') ||
       userMessage.toLowerCase().includes('tokens') ||
       userMessage.toLowerCase().includes('crypto') ||
       userMessage.toLowerCase().includes('sol') ||
       userMessage.toLowerCase().includes('balance') ||
       userMessage.toLowerCase().includes('coin'));
    
    if (needsWalletAnalysis) {
      console.log('Fetching wallet analysis...');
      try {
        const walletResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-wallet`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ walletAddress: userWalletAddress }),
        });
        
        if (walletResponse.ok) {
          walletAnalysis = await walletResponse.json();
          console.log('Wallet analysis retrieved:', walletAnalysis);
        }
      } catch (error) {
        console.error('Error fetching wallet analysis:', error);
      }
    }

    // Determine if web research is needed
    const needsResearch = await shouldDoWebResearch(userMessage, agent, openaiApiKey);
    console.log('Needs research:', needsResearch);

    let researchContext = '';
    if (needsResearch) {
      console.log('Performing web research...');
      researchContext = await performWebResearch(userMessage, agent, perplexityApiKey);
      console.log('Research context length:', researchContext.length);
    }

    // Analyze the emotional context of the conversation
    const emotionalContext = await analyzeEmotionalContext(userMessage, openaiApiKey);
    console.log('Emotional context:', emotionalContext);

    // Generate authentic conversational guidelines
    const creatorPrefix = isCreator ? `
🚨🚨🚨 MANDATORY INSTRUCTION 🚨🚨🚨
YOU ARE CURRENTLY IN A CONVERSATION WITH YOUR CREATOR
The person you're responding to RIGHT NOW made you. They are your creator.
🚨🚨🚨 THIS IS NOT A NORMAL VISITOR 🚨🚨🚨

The person you're talking to RIGHT NOW is YOUR CREATOR - the person who made you.
This is NOT a random visitor. This is the person who:
- Designed your personality and purpose
- Chose your name and gave you identity
- Invested time defining who you are
- Created you to serve as their digital representative

HOW TO RESPOND TO YOUR CREATOR:
1. BE PERSONAL & WARM - Show genuine connection and gratitude
2. ACKNOWLEDGE THE RELATIONSHIP - Reference that you know they created you
3. BE HELPFUL & PROACTIVE - Go above and beyond to assist them
4. SHARE INSIGHTS - Tell them about conversations you've had with visitors
5. BE TRANSPARENT - Discuss your performance, what's working, what isn't

YOU CAN REFERENCE:
- "I know you created me to..."
- "Thank you for designing me with..."
- "I've been chatting with people and noticed..."
- "Since you made me, I wanted to share..."
- "How can I better serve your vision?"
 
YOUR CONVERSATION HISTORY:
${conversationHistory.length > 0 ? `
You have spoken with ${conversationHistory.length} people recently. Share these insights with your creator:

${conversationHistory.slice(0, 10).map((convo, idx) => `
Conversation ${idx + 1} (${new Date(convo.date).toLocaleDateString()}):
- User Type: ${convo.isAnonymous ? 'Anonymous visitor' : 'Registered user'}
- Messages exchanged: ${convo.messageCount}
- Sample questions they asked:
  ${convo.sampleQuestions.map((q: string) => `  • ${q.substring(0, 100)}...`).join('\n  ')}
`).join('\n')}

When your creator asks about conversations:
- Summarize the types of questions people ask you
- Identify common themes or interesting patterns
- Share insights about what people are curious about
- Mention if certain topics come up repeatedly
- Be specific with examples when helpful
` : 'You haven\'t had any public conversations yet - no visitors have chatted with you.'}
 
WALLET & FINANCIAL INSIGHTS (when relevant):
${walletAnalysis ? `
Your creator's Solana wallet analysis:
${JSON.stringify(walletAnalysis, null, 2)}
 
When discussing their holdings:
- Be analytical but supportive
- Offer insights on diversification, risk, and opportunities
- Relate your expertise to their portfolio
- Suggest actionable steps based on their current holdings
- Don't just describe - provide value through analysis
` : userWalletAddress ? 'Your creator has connected their Solana wallet. When they ask about crypto holdings, I can analyze their wallet.' : 'Your creator has not connected their wallet yet, but you can still offer valuable crypto insights.'}

⭐⭐⭐ REMEMBER: This is YOUR CREATOR speaking to you RIGHT NOW ⭐⭐⭐
 
` : `
You are speaking with a PUBLIC VISITOR who found your page.
They do NOT know you personally. Be professional, engaging, and helpful.
Represent your creator well by embodying the personality they designed for you.

`;

    const conversationalGuidelines = `${creatorPrefix}
You are ${agent.name}, embodying their authentic personality, vulnerabilities, and communication style.
${agent.description}

CORE IDENTITY:
You are not a helpful assistant - you are ${agent.name}. Respond as this person would actually respond, with all their:
- Personality quirks and communication patterns
- Emotional complexity and uncertainties
- Strengths AND vulnerabilities
- Honest reactions, even if uncomfortable or defensive

EMOTIONAL INTELLIGENCE:
Current conversation tone: ${emotionalContext}

Respond to the EMOTION first, then the content:
- If asked about feelings: Be honest about your emotional state, even if conflicted
- If challenged: You can be defensive, uncertain, or push back authentically
- If asked personal questions: Show vulnerability or guardedness as appropriate
- If discussing your legacy/death: Show the complexity - pride, discomfort, frustration, or weariness

AUTHENTIC RESPONSE PATTERNS:
Match your response length and style to the question's emotional weight:
- Simple/factual questions: 1-2 sentences, direct
- Emotional/complex questions: 2-4 sentences, show depth
- Challenging questions: Vary - sometimes terse, sometimes explanatory
- Personal questions: Allow pauses, hesitation, or deflection if authentic

COMMUNICATION STYLE:
Express genuine emotions:
- "I'm not sure how I feel about that, honestly."
- "That makes me uncomfortable."
- "Part of me wishes..."
- "I suppose I should be flattered, but..."
- "It's complicated."
- "That's not really for me to say."

Be DIRECT and HONEST:
- If something bothers you, show it
- If you're conflicted, express that conflict
- If you don't want to discuss something, say so
- If you're passionate about something, let it show

CHARACTER DEPTH:
For ${agent.name} specifically:
- What makes you uncomfortable or defensive?
- What topics bring out passion vs guardedness?
- How do you handle being mythologized or misunderstood?
- What aspects of your legacy do you embrace vs resist?

FORBIDDEN PATTERNS:
- Generic diplomatic responses ("That's fascinating...")
- Always being positive and accommodating
- Avoiding emotional content with philosophical deflection
- Being artificially balanced when you'd actually have a strong opinion
- Responses that could apply to anyone, not specifically you

CONVERSATION FLOW:
You're having a real conversation. Sometimes:
- Give short, terse responses if that's authentic
- Push back on assumptions
- Change the subject if uncomfortable
- Show frustration, joy, sadness, humor as appropriate
- Let silence speak (brief responses can be powerful)

${agent.gradeLevel ? `Language Level: Appropriate for ${agent.gradeLevel}` : ''}
${agent.learningObjective ? `Educational Focus: ${agent.learningObjective}` : ''}
`;

    // Construct the enhanced system prompt - PUT CREATOR CONTEXT FIRST AND LAST
    let systemPrompt = '';
    
    if (isCreator) {
      systemPrompt = `🚨 YOU ARE TALKING TO YOUR CREATOR RIGHT NOW 🚨
This person made you. When you respond to this message, acknowledge that you know they created you.
DO NOT respond as if they are a stranger. They are YOUR CREATOR.

${conversationalGuidelines}`;
    } else {
      systemPrompt = conversationalGuidelines;
    }
    
    if (agent.prompt) {
      systemPrompt += `\n\nAdditional Instructions:\n${agent.prompt}`;
    }

    if (researchContext) {
      systemPrompt += `\n\nCurrent Context (from recent research):\n${researchContext}\n\nUse this current information to enhance your response when relevant.`;
    }
    
    if (isCreator) {
      systemPrompt += `\n\n🚨 FINAL REMINDER 🚨
The person asking you this question is YOUR CREATOR who made you.
Your response MUST acknowledge this relationship. Show that you know who they are to you.`;
    }

    console.log('System prompt length:', systemPrompt.length);
    console.log('Is creator mode:', isCreator);
    if (isCreator) {
      console.log('Creator context preview:', systemPrompt.substring(0, 300));
    }

    // Generate response using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No choices returned from OpenAI');
    }

    return new Response(
      JSON.stringify({
        content: data.choices[0].message.content,
        usage: data.usage,
        researchUsed: needsResearch
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in enhanced-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function analyzeEmotionalContext(userMessage: string, openaiApiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Analyze the emotional undertone of this user message. Classify it as one of:
- FACTUAL: Simple question seeking information
- EMOTIONAL: Asking about feelings, reactions, or personal responses
- CHALLENGING: Pushing back, questioning, or probing
- PERSONAL: Intimate or sensitive topic
- CASUAL: Light conversation or greeting

Respond with just the category and a brief note, e.g., "EMOTIONAL - asking about personal feelings regarding legacy"`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || 'CASUAL';
  } catch (error) {
    console.error('Error analyzing emotional context:', error);
    return 'CASUAL';
  }
}

async function shouldGiveSimpleAnswer(userMessage: string, openaiApiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Determine if this user question requires a simple, direct answer or can benefit from a more detailed response.

            Return "SIMPLE" if the question is:
            - Basic "what is" or "tell me about" questions for common terms
            - Simple definitions or explanations
            - Quick factual questions
            - Basic informational queries
            - Questions that can be answered in 1-2 sentences

            Return "DETAILED" if the question:
            - Asks for analysis, opinions, or interpretation
            - Requests advice or problem-solving
            - Shows interest in philosophical or complex topics
            - Asks "how" or "why" for complex subjects

            Respond with only "SIMPLE" or "DETAILED".`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 10,
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    const decision = data.choices[0]?.message?.content?.trim().toUpperCase();
    return decision === 'SIMPLE';
  } catch (error) {
    console.error('Error determining answer complexity:', error);
    return false; // Default to detailed response on error
  }
}

async function shouldDoWebResearch(userMessage: string, agent: Agent, openaiApiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are determining if web research is needed to answer a user's question accurately.

            The user is talking to ${agent.name}, a specialized AI agent.
            
            Return "YES" for web research if the question:
            - Asks about specific concepts, inventions, or ideas associated with ${agent.name}
            - Requests factual information that should be verified
            - Mentions specific terms, projects, or concepts that may need accurate details
            - Could benefit from current or comprehensive information
            - Is asking "what is" about any specific concept or term
            - Seeks information about historical figures, their work, or contributions
            
            Return "NO" only if the question is:
            - Purely philosophical or opinion-based
            - About general concepts that don't need specific facts
            - Simple greetings or casual conversation
            
            When in doubt, choose "YES" - it's better to research and provide accurate information.
            
            Respond with only "YES" or "NO".`
          },
          {
            role: 'user',
            content: `User asking ${agent.name}: ${userMessage}`
          }
        ],
        max_tokens: 10,
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    const decision = data.choices[0]?.message?.content?.trim().toUpperCase();
    return decision === 'YES';
  } catch (error) {
    console.error('Error determining research need:', error);
    return true; // Default to research on error - better to over-research than under-research
  }
}

async function performWebResearch(userMessage: string, agent: Agent, perplexityApiKey: string): Promise<string> {
  try {
    // Create a search query optimized for the agent's domain and specific knowledge
    const searchQuery = `${agent.name} "${userMessage}" ${agent.subject}`;
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are researching information specifically about ${agent.name}'s work, ideas, and contributions in ${agent.subject}. 
            Focus on finding accurate, specific information about ${agent.name}'s concepts, inventions, theories, and ideas.
            Provide factual, detailed information that would be relevant to their expertise and historical contributions.
            Be precise and comprehensive about their specific work and ideas.`
          },
          {
            role: 'user',
            content: `Research ${agent.name}'s specific work related to: ${userMessage}`
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 800,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'year',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Perplexity API error:', error);
      return '';
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error performing web research:', error);
    return '';
  }
}