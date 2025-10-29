import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TokenData {
  marketCap?: number;
  holderCount?: number;
  symbol?: string;
  name?: string;
}

export const usePumpFunTokenData = (contractAddress: string | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['pumpfun-token', contractAddress],
    queryFn: async () => {
      if (!contractAddress) return null;
      
      console.log('[usePumpFunTokenData] Fetching data for:', contractAddress);
      
      const { data, error } = await supabase.functions.invoke('analyze-pumpfun-token', {
        body: { tokenAddress: contractAddress },
      });

      if (error) {
        console.error('[usePumpFunTokenData] Error:', error);
        return null;
      }

      if (!data || data.error) {
        console.error('[usePumpFunTokenData] Failed:', data?.error);
        return null;
      }

      console.log('[usePumpFunTokenData] Token data:', data.tokenData);
      
      return {
        marketCap: data.tokenData?.marketCap,
        holderCount: data.tokenData?.holderCount,
        symbol: data.tokenData?.symbol,
        name: data.tokenData?.name,
      } as TokenData;
    },
    enabled: enabled && !!contractAddress,
    staleTime: 60000, // Consider data stale after 1 minute
    refetchInterval: 60000, // Refetch every minute
  });
};
