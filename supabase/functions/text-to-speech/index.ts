
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set');
    return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { text, voice = 'alloy' } = await req.json();
    
    if (!text) {
      throw new Error('No text provided');
    }

    console.log('Generating speech for text length:', text.length);
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        speed: 1.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TTS API error:', errorText);
      throw new Error(`Speech generation failed: ${response.status}`);
    }

    // Return the audio directly as binary data, not as JSON
    const audioBuffer = await response.arrayBuffer();
    console.log('Speech generation successful');
    
    return new Response(audioBuffer, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'audio/mpeg' 
      },
    });
    
  } catch (error) {
    console.error("Error in text-to-speech function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
