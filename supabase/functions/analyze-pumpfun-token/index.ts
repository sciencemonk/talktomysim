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

    const isPumpFunToken = tokenAddress.toLowerCase().endsWith('pump');
    console.log(`Analyzing ${isPumpFunToken ? 'PumpFun token' : 'Solana wallet'}:`, tokenAddress);

    if (isPumpFunToken) {
      // PumpFun token analysis
      console.log('Fetching token data from PumpFun API...');
      
      const pumpFunApiUrl = `https://frontend-api.pump.fun/coins/${tokenAddress}`;
      console.log('API URL:', pumpFunApiUrl);
      
      let tokenData;
      try {
        const tokenResponse = await fetch(pumpFunApiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          }
        });
        
        console.log('Response status:', tokenResponse.status);
        
        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.log('Error response:', errorText);
          
          // If token not found, return a helpful message
          if (tokenResponse.status === 404) {
            return new Response(
              JSON.stringify({
                tokenAddress,
                error: 'Token not found',
                summary: 'This token address was not found on pump.fun. It may be invalid, not a pump.fun token, or not yet created. Please verify the contract address.',
                suggestion: 'Make sure you copied the full contract address from pump.fun'
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
          
          throw new Error(`Failed to fetch token data (${tokenResponse.status}): ${errorText}`);
        }

        tokenData = await tokenResponse.json();
      } catch (error) {
        console.error('Failed to fetch token data:', error);
        return new Response(
          JSON.stringify({
            tokenAddress,
            error: 'Unable to fetch token data',
            summary: 'Could not connect to pump.fun API. The service might be temporarily unavailable or the token address is invalid.',
            suggestion: 'Please try again in a moment or verify the token address is correct',
            details: error.message
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('Token data received:', tokenData);

      // Fetch recent trades from PumpPortal
      const tradesUrl = `https://pumpportal.fun/api/trades/${tokenAddress}?limit=100`;
      const tradesResponse = await fetch(tradesUrl);
      
      if (!tradesResponse.ok) {
        console.log('Trades fetch failed:', tradesResponse.status);
        // Return token info without trades if trades fetch fails
        return new Response(
          JSON.stringify({
            tokenAddress,
            tokenInfo: {
              name: tokenData.name,
              symbol: tokenData.symbol,
              description: tokenData.description,
              image: tokenData.image_uri,
              marketCap: tokenData.usd_market_cap,
              createdTimestamp: tokenData.created_timestamp
            },
            analysis: {
              summary: `${tokenData.name} (${tokenData.symbol}). Market Cap: $${tokenData.usd_market_cap?.toLocaleString() || 'N/A'}. Trading data temporarily unavailable.`
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const trades = await tradesResponse.json();
      console.log(`Received ${trades.length} trades for token ${tokenAddress}`);

      if (!trades || trades.length === 0) {
        return new Response(
          JSON.stringify({
            tokenAddress,
            tokenInfo: {
              name: tokenData.name,
              symbol: tokenData.symbol,
              description: tokenData.description,
              image: tokenData.image_uri,
              marketCap: tokenData.usd_market_cap,
              createdTimestamp: tokenData.created_timestamp
            },
            analysis: {
              summary: `${tokenData.name} (${tokenData.symbol}). Market Cap: $${tokenData.usd_market_cap?.toLocaleString() || 'N/A'}. This token has no recent trading activity.`
            }
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
    } else {
      // Wallet analysis using Helius
      const HELIUS_API_KEY = Deno.env.get('HELIUS_API_KEY');
      if (!HELIUS_API_KEY) {
        throw new Error('HELIUS_API_KEY not configured');
      }

      console.log('Fetching wallet data from Helius...');
      const heliusUrl = `https://api.helius.xyz/v0/addresses/${tokenAddress}/balances?api-key=${HELIUS_API_KEY}`;
      
      const balanceResponse = await fetch(heliusUrl);
      if (!balanceResponse.ok) {
        throw new Error(`Failed to fetch wallet data: ${balanceResponse.statusText}`);
      }

      const balanceData = await balanceResponse.json();
      console.log('Wallet data received:', balanceData);

      // Get transaction history
      const txUrl = `https://api.helius.xyz/v0/addresses/${tokenAddress}/transactions?api-key=${HELIUS_API_KEY}&limit=100`;
      const txResponse = await fetch(txUrl);
      const transactions = txResponse.ok ? await txResponse.json() : [];

      const analysis = {
        walletAddress: tokenAddress,
        balances: {
          sol: balanceData.nativeBalance ? (balanceData.nativeBalance / 1000000000).toFixed(4) : '0',
          tokens: balanceData.tokens?.length || 0,
          nfts: balanceData.nfts?.length || 0
        },
        activity: {
          totalTransactions: transactions.length,
          recentActivity: transactions.slice(0, 10).map((tx: any) => ({
            signature: tx.signature,
            timestamp: tx.timestamp,
            type: tx.type
          }))
        },
        analysis: {
          summary: `Wallet has ${(balanceData.nativeBalance / 1000000000).toFixed(4)} SOL, ${balanceData.tokens?.length || 0} tokens, and ${balanceData.nfts?.length || 0} NFTs. ${transactions.length} recent transactions found.`
        }
      };

      console.log('Wallet analysis complete:', analysis);

      return new Response(
        JSON.stringify(analysis),
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
