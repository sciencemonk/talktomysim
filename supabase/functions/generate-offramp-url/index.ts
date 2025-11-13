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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { walletAddress, redirectUrl } = await req.json();

    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Get store for this user to use as partnerUserId
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, x_username')
      .eq('user_id', user.id)
      .single();

    if (storeError || !store) {
      throw new Error('Store not found');
    }

    // In production, you should generate a secure session token
    // For now, we'll use a simple identifier
    const sessionToken = btoa(`${user.id}-${Date.now()}`);
    const partnerUserId = store.id;
    const finalRedirectUrl = redirectUrl || `https://uovhemqkztmkoozlmqxq.supabase.co/dashboard`;

    // Construct the Coinbase Offramp URL
    const offrampUrl = new URL('https://pay.coinbase.com/v3/sell/input');
    offrampUrl.searchParams.set('partnerUserId', partnerUserId);
    offrampUrl.searchParams.set('redirectUrl', finalRedirectUrl);
    offrampUrl.searchParams.set('addresses', JSON.stringify({ [walletAddress]: ['base'] }));
    offrampUrl.searchParams.set('sessionToken', sessionToken);

    console.log('Generated offramp URL for user:', user.id);

    return new Response(
      JSON.stringify({
        url: offrampUrl.toString(),
        sessionToken
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error generating offramp URL:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});