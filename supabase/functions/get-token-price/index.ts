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
    const { amount } = await req.json();
    
    if (!amount || parseFloat(amount) <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const heliusApiKey = Deno.env.get('HELIUS_API_KEY');
    if (!heliusApiKey) {
      throw new Error('HELIUS_API_KEY not configured');
    }

    // $SimAI token address on Solana (you'll need to update this with the actual token address)
    const SIMAI_TOKEN_ADDRESS = '35t5DPbwJtB1tpGiSnqedLwQomi94BRKVDPyTRLdbonk';

    // Fetch token price from Helius
    const response = await fetch(
      `https://api.helius.xyz/v0/token-metadata?api-key=${heliusApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mintAccounts: [SIMAI_TOKEN_ADDRESS],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Calculate SOL equivalent
    // Note: This is a simplified calculation. You may need to adjust based on actual market data
    // You might want to use Jupiter or another DEX aggregator for accurate pricing
    const tokenPrice = data[0]?.price || 0;
    const solEquivalent = parseFloat(amount) * tokenPrice;

    return new Response(
      JSON.stringify({ 
        solEquivalent: solEquivalent.toFixed(4),
        tokenPrice 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching token price:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
