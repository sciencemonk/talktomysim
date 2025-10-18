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
    const { tokenAddress } = await req.json();
    
    if (!tokenAddress) {
      throw new Error('Token address is required');
    }

    console.log('Analyzing PumpFun token:', tokenAddress);

    const HELIUS_API_KEY = Deno.env.get('HELIUS_API_KEY');
    if (!HELIUS_API_KEY) {
      throw new Error('HELIUS_API_KEY not configured');
    }

    // Use DAS API to get token holders and activity
    console.log('Fetching token data from Helius DAS API...');
    const dasUrl = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    
    // Get token supply to understand the token
    const supplyResponse = await fetch(dasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'supply-check',
        method: 'getTokenSupply',
        params: [tokenAddress]
      })
    });

    const supplyData = await supplyResponse.json();
    
    if (supplyData.error) {
      console.log('Token supply error:', supplyData.error);
    }

    // Get token largest accounts (holders)
    const holdersResponse = await fetch(dasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'holders-check',
        method: 'getTokenLargestAccounts',
        params: [tokenAddress]
      })
    });

    const holdersData = await holdersResponse.json();
    console.log(`Token holders response:`, holdersData);

    // Get recent signatures for the token (using getProgramAccounts alternative)
    const signaturesResponse = await fetch(dasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'sigs-check',
        method: 'getSignaturesForAddress',
        params: [tokenAddress, { limit: 100 }]
      })
    });

    const signaturesData = await signaturesResponse.json();
    const signatures = signaturesData.result || [];
    
    console.log(`Received ${signatures.length} signatures for token ${tokenAddress}`);

    if (!signatures || signatures.length === 0) {
      return new Response(
        JSON.stringify({
          tokenAddress,
          error: 'No trading data found',
          summary: 'This token has no transaction history. It might be brand new, inactive, or not a valid token address.',
          suggestion: 'Make sure you have the correct contract address (CA) from pump.fun'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse transaction signatures and get basic stats
    const uniqueSigners = new Set();
    const recentTransactions: any[] = [];
    
    for (const sig of signatures.slice(0, 10)) {
      if (sig.signature) {
        recentTransactions.push({
          signature: sig.signature,
          slot: sig.slot,
          blockTime: sig.blockTime,
          err: sig.err
        });
      }
    }

    // Get holder count
    const holderCount = holdersData.result?.value?.length || 0;
    
    // Analyze based on available data
    const totalTransactions = signatures.length;
    const successfulTxs = signatures.filter((s: any) => !s.err).length;
    
    // Determine momentum based on signature frequency
    let momentum = 'neutral';
    if (totalTransactions > 50) {
      momentum = 'bullish';
    } else if (totalTransactions < 10) {
      momentum = 'bearish';
    }

    // Calculate risk score
    let riskScore = 'low';
    
    if (totalTransactions < 10 || holderCount < 5) {
      riskScore = 'high';
    } else if (totalTransactions < 50 || holderCount < 20) {
      riskScore = 'medium';
    }

    const analysis = {
      tokenAddress,
      tradingActivity: {
        totalTransactions,
        successfulTransactions: successfulTxs,
        failedTransactions: totalTransactions - successfulTxs,
        holders: holderCount,
        recentActivity: recentTransactions
      },
      analysis: {
        momentum,
        riskScore,
        dataWindow: 'recent transaction signatures',
        summary: `This token has ${totalTransactions} total transactions (${successfulTxs} successful) with ${holderCount} token holders. Momentum: ${momentum}. Risk: ${riskScore}.`
      }
    };

    console.log('Token analysis complete:', analysis);

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error analyzing token:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to analyze PumpFun token. The token address might be invalid or the PumpPortal service is unavailable.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
