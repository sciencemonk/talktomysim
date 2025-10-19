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
    const GETIMG_API_KEY = Deno.env.get('GETIMG_API_KEY');
    if (!GETIMG_API_KEY) {
      throw new Error('GETIMG_API_KEY is not set');
    }

    const { prompt, model = "stable-diffusion-v1-5", width = 512, height = 512 } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Generating image with prompt:', prompt);

    const response = await fetch('https://api.getimg.ai/v1/stable-diffusion/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GETIMG_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        width,
        height,
        steps: 25,
        guidance: 7.5,
        output_format: "jpeg"
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('GetImg API error:', error);
      throw new Error(`GetImg API error: ${error}`);
    }

    const data = await response.json();
    console.log('Image generated successfully');

    return new Response(
      JSON.stringify({ 
        image: data.image,
        seed: data.seed 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
