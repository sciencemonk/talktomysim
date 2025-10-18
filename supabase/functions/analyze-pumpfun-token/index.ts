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
    
    if (!tokenAddress || tokenAddress.length < 32) {
      throw new Error('Invalid token address');
    }

    console.log('Analyzing PumpFun token:', tokenAddress);

    // Fetch recent trades from PumpPortal
    const response = await fetch(
      `https://pumpportal.fun/api/data?mint=${tokenAddress}&limit=50`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      console.error(`PumpPortal API error: ${response.status}`);
      throw new Error(`PumpPortal API error: ${response.status}`);
    }

    const trades = await response.json();
    console.log(`Fetched ${trades.length} trades for token ${tokenAddress}`);

    if (!trades || trades.length === 0) {
      return new Response(
        JSON.stringify({
          tokenAddress,
          error: 'No trading data found',
          summary: 'This token has no recent trading activity on PumpFun. It might be inactive, not a PumpFun token, or very new.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Analyze trades
    let totalBuys = 0;
    let totalSells = 0;
    let buyVolumeSol = 0;
    let sellVolumeSol = 0;
    let largestBuySol = 0;
    let largestSellSol = 0;
    const uniqueBuyers = new Set();
    const uniqueSellers = new Set();

    // Get timestamp 24h ago
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);

    for (const trade of trades) {
      const isBuy = trade.txType === 'buy';
      const solAmount = trade.solAmount || 0;
      const tradeTime = trade.timestamp || 0;
      const trader = trade.traderPublicKey || trade.user;

      // Count all trades for momentum
      if (isBuy) {
        totalBuys++;
        buyVolumeSol += solAmount;
        if (solAmount > largestBuySol) largestBuySol = solAmount;
        if (trader) uniqueBuyers.add(trader);
      } else {
        totalSells++;
        sellVolumeSol += solAmount;
        if (solAmount > largestSellSol) largestSellSol = solAmount;
        if (trader) uniqueSellers.add(trader);
      }
    }

    const totalVolumeSol = buyVolumeSol + sellVolumeSol;
    const buyToSellRatio = totalSells > 0 ? totalBuys / totalSells : totalBuys;

    // Determine momentum
    let momentum = 'neutral';
    if (buyVolumeSol > sellVolumeSol * 1.3) {
      momentum = 'bullish';
    } else if (sellVolumeSol > buyVolumeSol * 1.3) {
      momentum = 'bearish';
    }

    // Calculate risk score
    let riskScore = 'low';
    const totalTrades = totalBuys + totalSells;
    const totalUniqueTraders = uniqueBuyers.size + uniqueSellers.size;

    if (totalTrades < 10 || totalVolumeSol < 5) {
      riskScore = 'high';
    } else if (totalTrades < 30 || totalVolumeSol < 20 || totalUniqueTraders < 10) {
      riskScore = 'medium';
    }

    // Volume trend analysis
    const recentTrades = trades.slice(0, Math.min(10, trades.length));
    const recentVolume = recentTrades.reduce((sum: number, t: any) => 
      sum + (t.solAmount || 0), 0
    );
    const avgRecentVolume = recentVolume / recentTrades.length;
    const avgTotalVolume = totalVolumeSol / trades.length;

    let volumeTrend = 'stable';
    if (avgRecentVolume > avgTotalVolume * 1.2) {
      volumeTrend = 'increasing';
    } else if (avgRecentVolume < avgTotalVolume * 0.8) {
      volumeTrend = 'decreasing';
    }

    const analysis = {
      tokenAddress,
      tradingActivity: {
        totalTrades,
        buys: totalBuys,
        sells: totalSells,
        volumeSol: parseFloat(totalVolumeSol.toFixed(4)),
        buyVolumeSol: parseFloat(buyVolumeSol.toFixed(4)),
        sellVolumeSol: parseFloat(sellVolumeSol.toFixed(4)),
        uniqueBuyers: uniqueBuyers.size,
        uniqueSellers: uniqueSellers.size,
        largestBuySol: parseFloat(largestBuySol.toFixed(4)),
        largestSellSol: parseFloat(largestSellSol.toFixed(4)),
        buyToSellRatio: parseFloat(buyToSellRatio.toFixed(2))
      },
      analysis: {
        momentum,
        riskScore,
        volumeTrend,
        summary: `This PumpFun token has seen ${totalTrades} trades (${totalBuys} buys, ${totalSells} sells) with ${totalVolumeSol.toFixed(2)} SOL total volume. ${uniqueBuyers.size + uniqueSellers.size} unique traders. Momentum: ${momentum}. Risk: ${riskScore}. Volume trend: ${volumeTrend}.`
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
        details: 'Failed to analyze PumpFun token. The token address might be invalid or the PumpPortal API is unavailable.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
