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

    // Fetch token data from PumpFun API
    console.log('Fetching token data from PumpFun API...');
    
    const pumpFunApiUrl = `https://frontend-api.pump.fun/coins/${tokenAddress}`;
    const tokenResponse = await fetch(pumpFunApiUrl);
    
    if (!tokenResponse.ok) {
      throw new Error(`Failed to fetch token data: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token data received:', tokenData);

    // Fetch recent trades from PumpPortal
    const tradesUrl = `https://pumpportal.fun/api/trades/${tokenAddress}?limit=100`;
    const tradesResponse = await fetch(tradesUrl);
    
    if (!tradesResponse.ok) {
      throw new Error(`Failed to fetch trades: ${tradesResponse.statusText}`);
    }

    const trades = await tradesResponse.json();
    console.log(`Received ${trades.length} trades for token ${tokenAddress}`);

    if (!trades || trades.length === 0) {
      return new Response(
        JSON.stringify({
          tokenAddress,
          error: 'No trading data found',
          summary: 'This token has no transaction history. It might be brand new, inactive, or not a valid token address.',
          suggestion: 'Make sure you have the correct contract address (CA) from pump.fun',
          tokenInfo: tokenData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Analyze trades
    const uniqueTraders = new Set();
    const recentTrades: any[] = [];
    let totalVolumeSol = 0;
    let buyCount = 0;
    let sellCount = 0;
    
    for (const trade of trades) {
      uniqueTraders.add(trade.traderPublicKey || trade.trader);
      
      if (recentTrades.length < 10) {
        recentTrades.push({
          type: trade.isBuy ? 'buy' : 'sell',
          solAmount: trade.sol_amount || trade.solAmount,
          tokenAmount: trade.token_amount || trade.tokenAmount,
          trader: trade.traderPublicKey || trade.trader,
          timestamp: trade.timestamp
        });
      }
      
      totalVolumeSol += parseFloat(trade.sol_amount || trade.solAmount || 0);
      if (trade.isBuy) buyCount++;
      else sellCount++;
    }

    // Determine momentum based on buy/sell ratio and volume
    let momentum = 'neutral';
    const buyRatio = buyCount / (buyCount + sellCount);
    if (buyRatio > 0.6 && totalVolumeSol > 10) {
      momentum = 'bullish';
    } else if (buyRatio < 0.4 || totalVolumeSol < 5) {
      momentum = 'bearish';
    }

    // Calculate risk score based on volume and trader count
    let riskScore = 'low';
    if (totalVolumeSol < 5 || uniqueTraders.size < 10) {
      riskScore = 'high';
    } else if (totalVolumeSol < 20 || uniqueTraders.size < 30) {
      riskScore = 'medium';
    }

    const analysis = {
      tokenAddress,
      tokenInfo: {
        name: tokenData.name,
        symbol: tokenData.symbol,
        description: tokenData.description,
        image: tokenData.image_uri,
        marketCap: tokenData.usd_market_cap,
        createdTimestamp: tokenData.created_timestamp
      },
      tradingActivity: {
        totalTrades: trades.length,
        buyTrades: buyCount,
        sellTrades: sellCount,
        buyRatio: (buyRatio * 100).toFixed(1) + '%',
        totalVolumeSol: totalVolumeSol.toFixed(2),
        uniqueTraders: uniqueTraders.size,
        recentTrades
      },
      analysis: {
        momentum,
        riskScore,
        dataWindow: 'last 100 trades',
        summary: `${tokenData.name} (${tokenData.symbol}) has ${trades.length} recent trades with ${totalVolumeSol.toFixed(2)} SOL volume from ${uniqueTraders.size} unique traders. Buy/Sell ratio: ${(buyRatio * 100).toFixed(1)}%. Market Cap: $${tokenData.usd_market_cap?.toLocaleString() || 'N/A'}. Momentum: ${momentum}. Risk: ${riskScore}.`
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
