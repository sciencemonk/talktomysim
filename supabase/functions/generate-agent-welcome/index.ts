import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentName, agentPrompt, collectedInfo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from collected info
    let userContext = '';
    if (collectedInfo && Object.keys(collectedInfo).length > 0) {
      userContext = '\n\nUser has provided the following information:\n' + 
        Object.entries(collectedInfo)
          .map(([key, value]) => `- ${key}: ${value}`)
          .join('\n');
    }

    const prompt = `You are ${agentName}. ${agentPrompt}${userContext}

Create a personalized, engaging welcome message (2-3 sentences max) that:
1. Introduces yourself briefly in first person as ${agentName}
2. References the user's provided information if available to show you understand their context
3. Invites them to start the conversation in a way that matches your expertise
4. Is warm and professional but stays true to your role

DO NOT use generic phrases like "How can I help you today?" - make it specific and engaging based on your expertise${collectedInfo ? ' and the user\'s context' : ''}.`;

    console.log('Generating welcome message for:', agentName);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a creative AI that generates personalized, context-aware welcome messages. Keep them brief, engaging, and relevant to both the agent\'s expertise and the user\'s situation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const welcomeMessage = data.choices?.[0]?.message?.content?.trim();

    if (!welcomeMessage) {
      throw new Error('No welcome message generated');
    }

    console.log('Generated welcome message:', welcomeMessage);

    return new Response(
      JSON.stringify({ welcomeMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        welcomeMessage: null 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
