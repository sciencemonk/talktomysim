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
      
      // Try pumpportal API first for trades
      const tradesUrl = `https://pumpportal.fun/api/trades/${tokenAddress}?limit=100`;
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

      // Then try to get token metadata
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
        
        if (tokenResponse.ok) {
          tokenData = await tokenResponse.json();
          console.log('Token data received:', tokenData);
        } else {
          const errorText = await tokenResponse.text();
          console.log('Token API error:', errorText);
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

      // We have both tokenData and trades
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
