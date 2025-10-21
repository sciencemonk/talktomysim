import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const apiKey = Deno.env.get('API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, advisorName, advisorPrompt } = await req.json();
    console.log('Generating commentary for:', advisorName || 'Unknown Sim', context);
    
    const systemPrompt = advisorPrompt || `You are ${advisorName || 'a commentator'}, providing commentary on cryptocurrency token names. Keep responses to ONE short sentence (max 15 words). Be in character and brutally honest.`;

    const response = await fetch('https://ai.gateway.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: context || 'Generate a unique comment about this crypto token.'
          }
        ],
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI Gateway error:', error);
      throw new Error(`AI Gateway returned ${response.status}: ${error}`);
    }

    const data = await response.json();
    const commentary = data.choices[0].message.content.trim();
    
    console.log('Generated commentary:', commentary);

    return new Response(
      JSON.stringify({ commentary }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in generate-rick-commentary:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        commentary: "Listen *burp* Morty, the AI is broken. Classic human engineering."
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
