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

    // Find Hitler advisor
    const { data: hitlerAdvisor, error: advisorError } = await supabase
      .from('advisors')
      .select('id, name, prompt')
      .ilike('name', '%hitler%')
      .eq('is_official', true)
      .single();

    if (advisorError || !hitlerAdvisor) {
      console.error('Error finding Hitler advisor:', advisorError);
      throw new Error('Could not find Hitler advisor');
    }

    console.log('Found advisor:', hitlerAdvisor.name);

    // Analyze transactions and generate reactions
    const reactions = [];
    
    for (const tx of transactions.slice(0, 5)) {
      // Determine if it's a buy or sell based on transaction type
      const isBuy = tx.type === 'SWAP' && tx.tokenTransfers?.some(
        (transfer: any) => transfer.mint === tokenAddress && transfer.toUserAccount
      );
      
      const isSell = tx.type === 'SWAP' && tx.tokenTransfers?.some(
        (transfer: any) => transfer.mint === tokenAddress && transfer.fromUserAccount
      );

      if (isBuy || isSell) {
        // Get amount from token transfers
        const tokenTransfer = tx.tokenTransfers?.find(
          (transfer: any) => transfer.mint === tokenAddress
        );
        
        const amount = tokenTransfer?.tokenAmount || 0;
        
        reactions.push({
          type: isBuy ? 'buy' : 'sell',
          amount,
          timestamp: tx.timestamp,
          signature: tx.signature,
        });
      }
    }

    console.log('Generated reactions:', reactions.length);

    return new Response(
      JSON.stringify({
        advisor: hitlerAdvisor,
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
