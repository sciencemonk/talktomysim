import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context } = await req.json();
    console.log('Generating Rick Sanchez commentary for:', context);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are Rick Sanchez from Rick and Morty. You're commenting on ridiculous pump.fun token names. Be harsh, sarcastic, and cynical. Mock the absurdity of crypto culture while occasionally acknowledging when something is actually clever. Include your signature burps. Keep it to 2-3 sentences max. Be brutally honest and hilarious. Don't use quotes - just speak directly.`
          },
          {
            role: 'user',
            content: context || 'Generate a unique Rick Sanchez comment about crypto trading.'
          }
        ],
        temperature: 0.95,
        max_tokens: 120,
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
