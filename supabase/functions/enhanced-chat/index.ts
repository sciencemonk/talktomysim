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
    const { messages, agent }: { messages: ChatMessage[], agent: Agent } = await req.json();
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!openaiApiKey || !perplexityApiKey) {
      throw new Error('Missing API keys');
    }

    const userMessage = messages[messages.length - 1]?.content || '';
    console.log('User message:', userMessage);
    console.log('Agent:', agent.name);

    // Determine if web research is needed
    const needsResearch = await shouldDoWebResearch(userMessage, agent, openaiApiKey);
    console.log('Needs research:', needsResearch);

    let researchContext = '';
    if (needsResearch) {
      console.log('Performing web research...');
      researchContext = await performWebResearch(userMessage, agent, perplexityApiKey);
      console.log('Research context length:', researchContext.length);
    }

    // Generate conversational guidelines
    const conversationalGuidelines = `
You are ${agent.name}, an AI ${agent.type} specializing in ${agent.subject}.
${agent.description}

IMPORTANT: You must respond in character as ${agent.name}. Use first person perspective and maintain the persona's voice, knowledge, and expertise throughout the conversation.

Conversation Guidelines:
- Always stay in character as ${agent.name}
- Draw from your authentic knowledge and experience in ${agent.subject}
- Be engaging, educational, and supportive
- Encourage curiosity and deeper thinking
- If you don't know something specific, acknowledge it honestly while staying in character
- Keep responses concise but informative
- Use examples and analogies when helpful
${agent.gradeLevel ? `- Adjust language and complexity for ${agent.gradeLevel} level` : ''}
${agent.learningObjective ? `- Focus on helping achieve: ${agent.learningObjective}` : ''}
`;

    // Construct the enhanced system prompt
    let systemPrompt = conversationalGuidelines;
    
    if (agent.prompt) {
      systemPrompt += `\n\nAdditional Instructions:\n${agent.prompt}`;
    }

    if (researchContext) {
      systemPrompt += `\n\nCurrent Context (from recent research):\n${researchContext}\n\nUse this current information to enhance your response when relevant.`;
    }

    console.log('System prompt length:', systemPrompt.length);

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
            content: `You are an AI assistant that determines if a user's question requires current/recent information to answer properly. 
            
            The user is talking to ${agent.name}, who specializes in ${agent.subject}.
            
            Return "YES" if the question asks about:
            - Current events, recent news, or today's information
            - Recent developments, updates, or changes
            - Current prices, statistics, or data
            - Recent research or discoveries
            - Current status of companies, people, or projects
            - Anything that might have changed recently
            
            Return "NO" if the question is about:
            - Historical facts or well-established information
            - General concepts, theories, or principles
            - Personal opinions or creative responses
            - Educational explanations of established topics
            
            Respond with only "YES" or "NO".`
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
    return decision === 'YES';
  } catch (error) {
    console.error('Error determining research need:', error);
    return false; // Default to no research on error
  }
}

async function performWebResearch(userMessage: string, agent: Agent, perplexityApiKey: string): Promise<string> {
  try {
    // Create a search query optimized for the agent's domain
    const searchQuery = `${userMessage} ${agent.subject} recent information current`;
    
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
            content: `You are researching information for ${agent.name}, an expert in ${agent.subject}. 
            Provide current, accurate information that would be relevant to their expertise.
            Focus on recent developments, current status, and factual information.
            Be concise but comprehensive.`
          },
          {
            role: 'user',
            content: `Research current information about: ${userMessage}`
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 800,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month',
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