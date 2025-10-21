import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { simIds } = await req.json();

    if (!simIds || !Array.isArray(simIds)) {
      return new Response(
        JSON.stringify({ error: "simIds array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const API_KEY = Deno.env.get("API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !API_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const results = [];

    for (const simId of simIds) {
      try {
        // Fetch the sim's prompt and description
        const { data: sim, error: fetchError } = await supabase
          .from('advisors')
          .select('id, name, prompt, description')
          .eq('id', simId)
          .single();

        if (fetchError || !sim) {
          results.push({ 
            simId, 
            success: false, 
            error: `Failed to fetch sim: ${fetchError?.message || 'Not found'}` 
          });
          continue;
        }

        // Generate new description
        const response = await fetch("https://ai.gateway.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant that creates concise, engaging descriptions. Generate a 1-2 sentence description that captures the essence of what this AI sim does. Keep it under 200 characters, clear, and appealing to users. Focus on what the sim does and who it helps."
              },
              {
                role: "user",
                content: `Based on this system prompt, generate a short 1-2 sentence display description for public viewing (max 200 characters):\n\n${sim.description || sim.prompt}`
              }
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("AI gateway error for sim", simId, response.status, errorText);
          results.push({ 
            simId, 
            simName: sim.name,
            success: false, 
            error: `AI gateway error: ${response.status}` 
          });
          continue;
        }

        const data = await response.json();
        const description = data.choices?.[0]?.message?.content?.trim() || "";

        if (!description) {
          results.push({ 
            simId, 
            simName: sim.name,
            success: false, 
            error: "Failed to generate description" 
          });
          continue;
        }

        // Update the sim with new auto_description (NOT description which is the system prompt)
        console.log(`Updating sim ${sim.name} (${simId}) with description:`, description);
        const { data: updateData, error: updateError } = await supabase
          .from('advisors')
          .update({ auto_description: description })
          .eq('id', simId)
          .select();

        if (updateError) {
          console.error(`Failed to update sim ${sim.name}:`, updateError);
          results.push({ 
            simId, 
            simName: sim.name,
            success: false, 
            error: `Failed to update: ${updateError.message}` 
          });
          continue;
        }

        console.log(`Successfully updated sim ${sim.name}, result:`, updateData);
        results.push({ 
          simId, 
          simName: sim.name,
          success: true, 
          newDescription: description 
        });

      } catch (error) {
        results.push({ 
          simId, 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in batch-regenerate-descriptions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
