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
    const { simId } = await req.json();

    if (!simId) {
      return new Response(
        JSON.stringify({ error: "simId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the sim
    const { data: sim, error: fetchError } = await supabase
      .from('advisors')
      .select('id, name, prompt, description')
      .eq('id', simId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch sim: ${fetchError.message}`);
    }

    if (!sim) {
      return new Response(
        JSON.stringify({ error: "Sim not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fixing description for sim: ${sim.name}`);
    console.log(`Current description length: ${sim.description?.length || 0} characters`);

    // Generate new description
    const API_KEY = Deno.env.get("API_KEY");
    if (!API_KEY) {
      throw new Error("API_KEY is not configured");
    }

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
            content: "You are a helpful assistant that creates concise, engaging descriptions. Generate a SHORT 1-2 sentence description that captures the essence of what this AI sim does. MAXIMUM 200 characters. Be clear, engaging, and user-friendly. Focus ONLY on what the sim does, not technical implementation details."
          },
          {
            role: "user",
            content: `Based on this system prompt, create a SHORT display description (max 200 characters). Focus on what the sim does and who it helps, not how it works:\n\n${sim.description || sim.prompt}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate description");
    }

    const data = await response.json();
    const newDescription = data.choices?.[0]?.message?.content?.trim() || "";

    console.log(`Generated new description: ${newDescription}`);
    console.log(`New description length: ${newDescription.length} characters`);

    // Update the sim with auto_description (NOT description which is the system prompt)
    const { error: updateError } = await supabase
      .from('advisors')
      .update({ auto_description: newDescription })
      .eq('id', simId);

    if (updateError) {
      throw new Error(`Failed to update sim: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        simName: sim.name,
        oldDescriptionLength: sim.description?.length || 0,
        newDescription: newDescription,
        newDescriptionLength: newDescription.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fixing sim description:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
