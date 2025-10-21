import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  circulatingSupply: number;
  totalSupply: number;
  lastUpdated: string;
}

interface UseCryptoPriceOptions {
  symbols: string[];
  currency?: string;
  enabled?: boolean;
  refetchInterval?: number;
}

export const useCryptoPrice = ({
  symbols,
  currency = 'USD',
  enabled = true,
  refetchInterval = 60000, // Default: refresh every 60 seconds
}: UseCryptoPriceOptions) => {
  return useQuery({
    queryKey: ['crypto-price', symbols, currency],
    queryFn: async () => {
      console.log('[useCryptoPrice] Fetching prices for:', symbols);
      
      const { data, error } = await supabase.functions.invoke('get-crypto-price', {
        body: { symbols, currency },
      });

      if (error) {
        console.error('[useCryptoPrice] Error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch crypto prices');
      }

      console.log('[useCryptoPrice] Successfully fetched prices:', data.data);
      return data.data as Record<string, CryptoData>;
    },
    enabled: enabled && symbols.length > 0,
    refetchInterval,
    staleTime: 30000, // Consider data stale after 30 seconds
  });
};
