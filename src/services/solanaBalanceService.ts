import { supabase } from '@/integrations/supabase/client';

export const fetchSolanaBalance = async (walletAddress: string): Promise<number | null> => {
  try {
    if (!walletAddress || !walletAddress.trim()) {
      return null;
    }

    console.log('[fetchSolanaBalance] Fetching balance for:', walletAddress);

    const { data, error } = await supabase.functions.invoke('get-solana-balance', {
      body: { walletAddress }
    });

    if (error) {
      console.error('[fetchSolanaBalance] Error:', error);
      return null;
    }

    if (!data.success) {
      console.error('[fetchSolanaBalance] Failed:', data.error);
      return null;
    }

    console.log('[fetchSolanaBalance] Balance:', data.balance);
    return data.balance;
  } catch (error) {
    console.error('[fetchSolanaBalance] Error:', error);
    return null;
  }
};

export const formatSolBalance = (balance: number | null): string => {
  if (balance === null) return 'N/A';
  if (balance === 0) return '0 SOL';
  if (balance < 0.001) return '< 0.001 SOL';
  return `${balance.toFixed(3)} SOL`;
};
