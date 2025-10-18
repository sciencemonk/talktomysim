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

    // Fetch transaction history using Helius API
    const heliusUrl = `https://api.helius.xyz/v0/addresses/${tokenAddress}/transactions?api-key=${HELIUS_API_KEY}&limit=100`;
    
    console.log('Fetching transaction history from Helius...');
    const heliusResponse = await fetch(heliusUrl);
    
    if (!heliusResponse.ok) {
      throw new Error(`Helius API error: ${heliusResponse.status}`);
    }

    const transactions = await heliusResponse.json();
    console.log(`Received ${transactions.length} transactions for token ${tokenAddress}`);

    if (!transactions || transactions.length === 0) {
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

    // Analyze transactions
    let totalTransfers = 0;
    let totalSwaps = 0;
    let totalVolumeSol = 0;
    const uniqueSigners = new Set();
    const recentTransactions: any[] = [];

    for (const tx of transactions) {
      if (!tx || tx.type === 'UNKNOWN') continue;
      
      // Count different transaction types
      if (tx.type === 'TRANSFER' || tx.type === 'TOKEN_MINT') {
        totalTransfers++;
      } else if (tx.type === 'SWAP' || tx.type === 'TRADE') {
        totalSwaps++;
      }

      // Track unique signers
      if (tx.feePayer) {
        uniqueSigners.add(tx.feePayer);
      }

      // Calculate SOL volume from native transfers
      if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
        for (const transfer of tx.nativeTransfers) {
          const solAmount = (transfer.amount || 0) / 1e9; // Convert lamports to SOL
          totalVolumeSol += solAmount;
        }
      }

      // Store recent transaction details
      if (recentTransactions.length < 10) {
        recentTransactions.push({
          signature: tx.signature,
          type: tx.type,
          timestamp: tx.timestamp,
          feePayer: tx.feePayer
        });
      }
    }

    const totalTrades = totalTransfers + totalSwaps;

    // Determine momentum based on transaction frequency
    let momentum = 'neutral';
    const recentCount = transactions.slice(0, 20).length;
    const olderCount = transactions.slice(20, 50).length;
    
    if (recentCount > olderCount * 1.5) {
      momentum = 'bullish';
    } else if (olderCount > recentCount * 1.5) {
      momentum = 'bearish';
    }

    // Calculate risk score
    let riskScore = 'low';
    
    if (totalTrades < 10 || totalVolumeSol < 1 || uniqueSigners.size < 5) {
      riskScore = 'high';
    } else if (totalTrades < 50 || totalVolumeSol < 10 || uniqueSigners.size < 20) {
      riskScore = 'medium';
    }

    const analysis = {
      tokenAddress,
      tradingActivity: {
        totalTransactions: transactions.length,
        totalTransfers,
        totalSwaps,
        volumeSol: parseFloat(totalVolumeSol.toFixed(4)),
        uniqueTraders: uniqueSigners.size,
        recentActivity: recentTransactions
      },
      analysis: {
        momentum,
        riskScore,
        dataWindow: 'last 100 transactions',
        summary: `This token has ${transactions.length} transactions with ${totalSwaps} swaps and ${totalTransfers} transfers. Total volume: ${totalVolumeSol.toFixed(2)} SOL across ${uniqueSigners.size} unique traders. Momentum: ${momentum}. Risk: ${riskScore}.`
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
