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

    // Connect to PumpPortal WebSocket to get recent trades
    const ws = new WebSocket('wss://pumpportal.fun/api/data');
    
    const tradesPromise = new Promise((resolve, reject) => {
      const trades: any[] = [];
      let timeout: number;

      ws.onopen = () => {
        console.log('WebSocket connected');
        // Subscribe to this token's trades
        ws.send(JSON.stringify({
          method: 'subscribeTokenTrade',
          keys: [tokenAddress]
        }));

        // Collect trades for 3 seconds
        timeout = setTimeout(() => {
          ws.close();
          resolve(trades);
        }, 3000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && !data.error) {
            trades.push(data);
          }
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error('WebSocket error:', error);
        reject(new Error('Failed to connect to PumpPortal'));
      };

      ws.onclose = () => {
        clearTimeout(timeout);
        console.log('WebSocket closed');
      };
    });

    const trades = await tradesPromise as any[];
    console.log(`Received ${trades.length} trades for token ${tokenAddress}`);

    if (!trades || trades.length === 0) {
      return new Response(
        JSON.stringify({
          tokenAddress,
          error: 'No recent trading data',
          summary: 'This token has no recent trading activity on PumpFun. It might be inactive, new, or not a valid PumpFun token.',
          suggestion: 'Make sure you have the correct contract address (CA) from pump.fun'
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

    for (const trade of trades) {
      const isBuy = trade.txType === 'buy';
      const solAmount = trade.solAmount || 0;
      const trader = trade.traderPublicKey || trade.user;

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

    if (totalTrades < 5 || totalVolumeSol < 2) {
      riskScore = 'high';
    } else if (totalTrades < 15 || totalVolumeSol < 10 || totalUniqueTraders < 5) {
      riskScore = 'medium';
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
        dataWindow: 'last 3 seconds of real-time activity',
        summary: `This PumpFun token just had ${totalTrades} trades (${totalBuys} buys, ${totalSells} sells) with ${totalVolumeSol.toFixed(2)} SOL total volume in the last few seconds. ${uniqueBuyers.size + uniqueSellers.size} unique traders. Momentum: ${momentum}. Risk: ${riskScore}.`
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
