import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Use public RPC endpoint - you can replace with your own Helius/QuickNode key for better rate limits
const SOLANA_RPC_URL = 'https://solana-mainnet.rpc.extrnode.com';

export const fetchSolanaBalance = async (walletAddress: string): Promise<number | null> => {
  try {
    if (!walletAddress || !walletAddress.trim()) {
      return null;
    }

    // Validate wallet address format
    try {
      new PublicKey(walletAddress);
    } catch (error) {
      console.error('Invalid Solana wallet address:', walletAddress);
      return null;
    }

    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const publicKey = new PublicKey(walletAddress);
    
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    
    return solBalance;
  } catch (error) {
    console.error('Error fetching Solana balance:', error);
    return null;
  }
};

export const formatSolBalance = (balance: number | null): string => {
  if (balance === null) return 'N/A';
  if (balance === 0) return '0 SOL';
  if (balance < 0.001) return '< 0.001 SOL';
  return `${balance.toFixed(3)} SOL`;
};
