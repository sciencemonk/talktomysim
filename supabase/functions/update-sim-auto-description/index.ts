import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

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
      throw new Error("Sim ID is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the sim's system prompt
    const { data: sim, error: fetchError } = await supabase
      .from("advisors")
      .select("id, name, prompt")
      .eq("id", simId)
      .single();

    if (fetchError) throw fetchError;
    if (!sim) throw new Error("Sim not found");

    console.log(`Generating auto description for sim: ${sim.name}`);

    // Generate short description
    const { data: descData, error: descError } = await supabase.functions.invoke(
      "generate-short-description",
      {
        body: { systemPrompt: sim.prompt }
      }
    );

    if (descError) throw descError;
    if (!descData?.shortDescription) throw new Error("Failed to generate description");

    console.log(`Generated description: ${descData.shortDescription}`);

    // Update the sim with auto_description
    const { error: updateError } = await supabase
      .from("advisors")
      .update({ auto_description: descData.shortDescription })
      .eq("id", simId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        autoDescription: descData.shortDescription,
        simName: sim.name
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating sim auto description:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
