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

    // $SimAI token address on Solana
    const SIMAI_TOKEN_ADDRESS = 'FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump';
    const SOL_TOKEN_ADDRESS = 'So11111111111111111111111111111111111111112';

    console.log('Fetching price for', parseFloat(amount), '$SIMAI tokens');

    // Use Jupiter's price API to get accurate pricing
    const response = await fetch(
      `https://price.jup.ag/v6/price?ids=${SIMAI_TOKEN_ADDRESS},${SOL_TOKEN_ADDRESS}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Jupiter price data:', JSON.stringify(data));
    
    // Get prices in USD
    const simaiPriceUSD = data.data?.[SIMAI_TOKEN_ADDRESS]?.price || 0;
    const solPriceUSD = data.data?.[SOL_TOKEN_ADDRESS]?.price || 0;
    
    console.log('$SIMAI price in USD:', simaiPriceUSD);
    console.log('SOL price in USD:', solPriceUSD);
    
    // Calculate SOL equivalent
    let solEquivalent = 0;
    if (solPriceUSD > 0 && simaiPriceUSD > 0) {
      const simaiValueUSD = parseFloat(amount) * simaiPriceUSD;
      solEquivalent = simaiValueUSD / solPriceUSD;
    }
    
    console.log('Calculated SOL equivalent:', solEquivalent);

    return new Response(
      JSON.stringify({ 
        solEquivalent: solEquivalent.toFixed(6),
        simaiPriceUSD,
        solPriceUSD
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
