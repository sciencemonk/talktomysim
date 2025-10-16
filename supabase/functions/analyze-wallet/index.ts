import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Connection, PublicKey } from "npm:@solana/web3.js@1.98.4";

interface TokenMetadata {
  name: string;
  symbol: string;
  mint: string;
  logoURI?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { walletAddress } = await req.json();
    
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    console.log('Analyzing wallet:', walletAddress);

    // Connect to Solana mainnet
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    const publicKey = new PublicKey(walletAddress);
    
    // Get SOL balance
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / 1e9; // Convert lamports to SOL
    
    // Get token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    });

    const rawTokens = tokenAccounts.value.map((account) => {
      const data = account.account.data.parsed.info;
      return {
        mint: data.mint,
        amount: data.tokenAmount.uiAmount,
        decimals: data.tokenAmount.decimals,
      };
    }).filter(token => token.amount > 0);

    // Fetch token metadata from Jupiter token list
    const tokenMetadata = await fetchTokenMetadata(rawTokens.map(t => t.mint));
    
    const tokens = rawTokens.map(token => {
      const metadata = tokenMetadata.get(token.mint);
      return {
        mint: token.mint,
        amount: token.amount,
        decimals: token.decimals,
        name: metadata?.name || 'Unknown Token',
        symbol: metadata?.symbol || 'Unknown',
        logoURI: metadata?.logoURI
      };
    });

    // Get recent transactions
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
    const recentTxCount = signatures.length;

    const analysis = {
      walletAddress,
      solBalance,
      solBalanceUSD: null, // Would need price API for this
      tokenCount: tokens.length,
      tokens: tokens.slice(0, 10), // Top 10 tokens
      recentTransactions: recentTxCount,
      lastActivity: signatures[0]?.blockTime ? new Date(signatures[0].blockTime * 1000).toISOString() : null,
      summary: generateSummary(solBalance, tokens, recentTxCount)
    };

    console.log('Wallet analysis complete:', analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error analyzing wallet:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function fetchTokenMetadata(mints: string[]): Promise<Map<string, TokenMetadata>> {
  const metadataMap = new Map<string, TokenMetadata>();
  
  if (mints.length === 0) return metadataMap;
  
  try {
    // Fetch from Jupiter's token list API
    const response = await fetch('https://token.jup.ag/all');
    
    if (!response.ok) {
      console.error('Failed to fetch token list from Jupiter');
      return metadataMap;
    }
    
    const allTokens: TokenMetadata[] = await response.json();
    
    // Create a map for quick lookup
    for (const token of allTokens) {
      if (mints.includes(token.mint)) {
        metadataMap.set(token.mint, token);
      }
    }
    
    console.log(`Found metadata for ${metadataMap.size} out of ${mints.length} tokens`);
  } catch (error) {
    console.error('Error fetching token metadata:', error);
  }
  
  return metadataMap;
}

function generateSummary(solBalance: number, tokens: any[], txCount: number): string {
  let summary = `This wallet holds ${solBalance.toFixed(4)} SOL`;
  
  if (tokens.length > 0) {
    const tokenList = tokens.slice(0, 5).map(t => 
      `${t.amount.toFixed(4)} ${t.symbol}`
    ).join(', ');
    summary += ` and ${tokens.length} different tokens including: ${tokenList}`;
    if (tokens.length > 5) {
      summary += ` and ${tokens.length - 5} more`;
    }
  }
  
  if (txCount > 0) {
    summary += `. Recent activity shows ${txCount} transactions in the last period`;
  } else {
    summary += ` with no recent activity`;
  }
  
  if (solBalance < 0.01 && tokens.length === 0) {
    summary += '. The wallet appears to be relatively inactive or new.';
  } else if (solBalance > 1 || tokens.length > 5) {
    summary += '. This appears to be an active wallet with diverse holdings.';
  }
  
  return summary;
}
