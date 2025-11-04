import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { offeringId, editCode, agentId, newType } = await req.json();

    if (!offeringId || !editCode || !agentId || !newType) {
      throw new Error('Missing required parameters');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify edit code
    const { data: agent, error: agentError } = await supabaseClient
      .from('advisors')
      .select('edit_code')
      .eq('id', agentId)
      .single();

    if (agentError || !agent || agent.edit_code !== editCode) {
      throw new Error('Invalid edit code');
    }

    // Update the offering type
    const { error: updateError } = await supabaseClient
      .from('x_agent_offerings')
      .update({ offering_type: newType })
      .eq('id', offeringId)
      .eq('agent_id', agentId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, message: 'Offering type updated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});