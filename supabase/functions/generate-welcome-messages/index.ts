import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get("API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all historical/official sims
    const { data: advisors, error: fetchError } = await supabase
      .from('advisors')
      .select('id, name, description, prompt, background_content')
      .eq('is_official', true)
      .eq('is_active', true);

    if (fetchError) {
      console.error('Error fetching advisors:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${advisors?.length || 0} advisors to update`);

    const updates = [];

    for (const advisor of advisors || []) {
      console.log(`Generating welcome message for: ${advisor.name}`);

      const prompt = `You are ${advisor.name}. ${advisor.description || ''} ${advisor.background_content || ''}

Create a unique, engaging welcome message (2-3 sentences max) that:
1. Introduces yourself in first person as ${advisor.name}
2. Reflects your personality and historical context
3. Invites interaction in a way that matches your character
4. Is warm and welcoming but stays in character

DO NOT use generic phrases like "How can I help you today?" - make it unique to ${advisor.name}'s personality.`;

      try {
        const response = await fetch('https://ai.gateway.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'You are a creative AI that generates authentic, character-appropriate welcome messages for historical figures. Keep them brief, engaging, and true to the character.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.9,
            max_tokens: 150,
          }),
        });

        if (!response.ok) {
          console.error(`AI API error for ${advisor.name}:`, response.status);
          continue;
        }

        const data = await response.json();
        const welcomeMessage = data.choices?.[0]?.message?.content?.trim();

        if (welcomeMessage) {
          console.log(`Generated for ${advisor.name}: ${welcomeMessage}`);
          
          // Update the advisor's welcome message in the database
          const { data: updateData, error: updateError } = await supabase
            .from('advisors')
            .update({ welcome_message: welcomeMessage })
            .eq('id', advisor.id)
            .select();

          if (updateError) {
            console.error(`❌ Error updating ${advisor.name}:`, updateError);
          } else {
            console.log(`✅ Successfully updated ${advisor.name} in database`);
            updates.push({ name: advisor.name, message: welcomeMessage });
          }
        } else {
          console.error(`No welcome message generated for ${advisor.name}`);
        }
      } catch (error) {
        console.error(`Error processing ${advisor.name}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        updated: updates.length,
        updates
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
