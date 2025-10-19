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
      throw new Error('Address is required');
    }

    console.log(`Analyzing PumpFun token:`, tokenAddress);

    // Try pumpportal API first for trades
    const tradesUrl = `https://pumpportal.fun/api/trades/${tokenAddress}?limit=100`;
    console.log('Fetching trades from:', tradesUrl);
      console.log('Fetching trades from:', tradesUrl);
      
      let trades = [];
      try {
        const tradesResponse = await fetch(tradesUrl);
        if (tradesResponse.ok) {
          trades = await tradesResponse.json();
          console.log(`Received ${trades.length} trades for token ${tokenAddress}`);
        }
      } catch (error) {
        console.log('Trades fetch error:', error.message);
      }

    // Use the v3 API (v1 and v2 are deprecated and down)
    const pumpFunApiUrl = `https://frontend-api-v3.pump.fun/coins/${tokenAddress}`;
    console.log('Fetching token metadata from:', pumpFunApiUrl);
      console.log('API URL:', pumpFunApiUrl);
      
    
    let tokenData;
    try {
      const tokenResponse = await fetch(pumpFunApiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      });
      
      console.log('Token API response status:', tokenResponse.status);
      
      if (tokenResponse.ok) {
        tokenData = await tokenResponse.json();
        console.log('Token data received:', tokenData);
      } else {
        const errorText = await tokenResponse.text();
        console.log('Token API error response:', errorText);
      }
    } catch (error) {
      console.error('Failed to fetch token metadata:', error);
    }

    // If we have no data at all, return error
    if (!trades.length && !tokenData) {
      return new Response(
        JSON.stringify({
          tokenAddress,
            error: 'Token not found',
            summary: 'This token was not found on pump.fun. It may not exist, may have been deleted, or the address might be incorrect. Please verify the contract address from pump.fun',
            suggestion: 'Copy the full contract address directly from the pump.fun website'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

    // If we only have trades but no metadata
    if (trades.length > 0 && !tokenData) {
      // Analyze trades only
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

      const buyRatio = buyCount / (buyCount + sellCount);
      let momentum = 'neutral';
      if (buyRatio > 0.6 && totalVolumeSol > 10) momentum = 'bullish';
      else if (buyRatio < 0.4 || totalVolumeSol < 5) momentum = 'bearish';

      let riskScore = 'low';
      if (totalVolumeSol < 5 || uniqueTraders.size < 10) riskScore = 'high';
      else if (totalVolumeSol < 20 || uniqueTraders.size < 30) riskScore = 'medium';

      return new Response(
        JSON.stringify({
          tokenAddress,
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
              summary: `Token has ${trades.length} recent trades with ${totalVolumeSol.toFixed(2)} SOL volume from ${uniqueTraders.size} unique traders. Buy/Sell ratio: ${(buyRatio * 100).toFixed(1)}%. Momentum: ${momentum}. Risk: ${riskScore}.`
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

    // We have both tokenData and trades - perform full analysis
    if (tokenData && trades.length > 0) {
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

      const buyRatio = buyCount / (buyCount + sellCount);
      let momentum = 'neutral';
      if (buyRatio > 0.6 && totalVolumeSol > 10) momentum = 'bullish';
      else if (buyRatio < 0.4 || totalVolumeSol < 5) momentum = 'bearish';

      let riskScore = 'low';
      if (totalVolumeSol < 5 || uniqueTraders.size < 10) riskScore = 'high';
      else if (totalVolumeSol < 20 || uniqueTraders.size < 30) riskScore = 'medium';

      return new Response(
        JSON.stringify({
          tokenAddress,
            tokenData: {
              name: tokenData.name,
              symbol: tokenData.symbol,
              description: tokenData.description,
              image: tokenData.image_uri,
              marketCap: tokenData.usd_market_cap,
              creator: tokenData.creator
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
              summary: `${tokenData.name} (${tokenData.symbol}) has ${trades.length} recent trades with ${totalVolumeSol.toFixed(2)} SOL volume from ${uniqueTraders.size} unique traders. Buy/Sell ratio: ${(buyRatio * 100).toFixed(1)}%. Market cap: $${tokenData.usd_market_cap ? tokenData.usd_market_cap.toFixed(2) : 'N/A'}. Momentum: ${momentum}. Risk: ${riskScore}.`
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

    // If we only have token data but no trades
    if (tokenData) {
      return new Response(
        JSON.stringify({
          tokenAddress,
            tokenData: {
              name: tokenData.name,
              symbol: tokenData.symbol,
              description: tokenData.description,
              image: tokenData.image_uri,
              marketCap: tokenData.usd_market_cap,
              creator: tokenData.creator
            },
            analysis: {
              summary: `${tokenData.name} (${tokenData.symbol}) - Market cap: $${tokenData.usd_market_cap ? tokenData.usd_market_cap.toFixed(2) : 'N/A'}. No recent trading activity found.`
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    

  } catch (error) {
    console.error('Error analyzing address:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to analyze address. The address might be invalid or the service is unavailable.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
