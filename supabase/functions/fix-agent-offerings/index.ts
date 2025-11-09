import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find agent offerings with NULL or empty system prompts
    const { data: offerings, error: offeringsError } = await supabase
      .from('x_agent_offerings')
      .select('id, agent_id')
      .eq('offering_type', 'agent')
      .or('agent_system_prompt.is.null,agent_system_prompt.eq.');

    if (offeringsError) throw offeringsError;

    console.log(`Found ${offerings?.length || 0} offerings to fix`);

    const updates = [];
    for (const offering of offerings || []) {
      // Get the agent's prompt
      const { data: agent } = await supabase
        .from('advisors')
        .select('prompt')
        .eq('id', offering.agent_id)
        .single();

      if (agent?.prompt) {
        updates.push(
          supabase
            .from('x_agent_offerings')
            .update({ agent_system_prompt: agent.prompt })
            .eq('id', offering.id)
        );
      }
    }

    await Promise.all(updates);

    return new Response(
      JSON.stringify({ 
        success: true,
        fixed: updates.length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
