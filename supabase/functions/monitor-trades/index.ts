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
    
    const tokenAddress = 'ArfuojkvAUXauU9wPTpRzGwyYjq6YeUtRNwUXT6PjnQ6';
    
    // Get recent trades from PumpPortal
    const response = await fetch(
      `https://pumpportal.fun/api/data?mint=${tokenAddress}&limit=10`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PumpPortal API error:', errorText);
      throw new Error(`PumpPortal API error: ${response.status}`);
    }

    const trades = await response.json();
    console.log('Fetched trades:', trades.length);

    // Find Pablo Escobar advisor
    const { data: escobarAdvisor, error: advisorError } = await supabase
      .from('advisors')
      .select('id, name, prompt, avatar_url')
      .ilike('name', '%pablo%escobar%')
      .eq('is_official', true)
      .single();

    if (advisorError || !escobarAdvisor) {
      console.error('Error finding Pablo Escobar advisor:', advisorError);
      throw new Error('Could not find Pablo Escobar advisor');
    }

    console.log('Found advisor:', escobarAdvisor.name);

    // Process trades and generate reactions
    const reactions = [];
    
    console.log('Processing', trades.length, 'trades');
    
    for (const trade of trades) {
      console.log('Trade detected:', trade.txType?.toUpperCase() || (trade.is_buy ? 'BUY' : 'SELL'), 'amount:', trade.token_amount || trade.tokenAmount);
      
      reactions.push({
        type: trade.is_buy || trade.isBuy ? 'buy' : 'sell',
        amount: trade.token_amount || trade.tokenAmount || 0,
        timestamp: trade.timestamp,
        signature: trade.signature,
        user: trade.user,
      });
    }

    console.log('Generated reactions:', reactions.length);

    return new Response(
      JSON.stringify({
        advisor: escobarAdvisor,
        reactions,
        totalTrades: trades.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in monitor-trades:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
