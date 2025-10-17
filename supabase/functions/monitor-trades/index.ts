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
    const heliusApiKey = Deno.env.get('HELIUS_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!heliusApiKey) {
      throw new Error('HELIUS_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const tokenAddress = 'FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump';
    
    // Get recent transactions for the token
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${tokenAddress}/transactions?api-key=${heliusApiKey}&limit=10`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Helius API error:', errorText);
      throw new Error(`Helius API error: ${response.status}`);
    }

    const transactions = await response.json();
    console.log('Fetched transactions:', transactions.length);

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

    // Analyze transactions and generate reactions
    const reactions = [];
    
    console.log('Processing', transactions.length, 'transactions');
    
    for (const tx of transactions) {
      if (!tx.tokenTransfers || tx.tokenTransfers.length === 0) continue;
      
      // Find token transfers for our specific token
      const relevantTransfers = tx.tokenTransfers.filter(
        (transfer: any) => transfer.mint === tokenAddress
      );
      
      if (relevantTransfers.length === 0) continue;
      
      console.log('Found relevant transfers for tx:', tx.signature.substring(0, 8));
      
      for (const transfer of relevantTransfers) {
        // A buy is when tokens are transferred TO a user (they receive tokens)
        // A sell is when tokens are transferred FROM a user (they send tokens away)
        const isBuy = transfer.toUserAccount && transfer.tokenAmount > 0;
        const isSell = transfer.fromUserAccount && transfer.tokenAmount > 0;
        
        if (isBuy || isSell) {
          console.log('Trade detected:', isBuy ? 'BUY' : 'SELL', 'amount:', transfer.tokenAmount);
          reactions.push({
            type: isBuy ? 'buy' : 'sell',
            amount: transfer.tokenAmount || 0,
            timestamp: tx.timestamp,
            signature: tx.signature,
            user: isBuy ? transfer.toUserAccount : transfer.fromUserAccount,
          });
        }
      }
    }

    console.log('Generated reactions:', reactions.length);

    return new Response(
      JSON.stringify({
        advisor: escobarAdvisor,
        reactions,
        totalTransactions: transactions.length,
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
