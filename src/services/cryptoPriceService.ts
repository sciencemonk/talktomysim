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

/**
 * Fetch real-time crypto prices from Free Crypto API
 * @param symbols - Array of crypto symbols (e.g., ['BTC', 'ETH', 'SOL'])
 * @param currency - Fiat currency for prices (default: 'USD')
 * @returns Promise with crypto data
 */
export const fetchCryptoPrices = async (
  symbols: string[],
  currency: string = 'USD'
): Promise<Record<string, CryptoData>> => {
  console.log('[cryptoPriceService] Fetching prices for:', symbols);

  const { data, error } = await supabase.functions.invoke('get-crypto-price', {
    body: { symbols, currency },
  });

  if (error) {
    console.error('[cryptoPriceService] Error:', error);
    throw error;
  }

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch crypto prices');
  }

  return data.data;
};

/**
 * Format price with appropriate decimal places
 */
export const formatCryptoPrice = (price: number, currency: string = 'USD'): string => {
  if (price >= 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } else {
    // For prices less than $1, show more decimals
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  }
};

/**
 * Format percentage change with sign and color indicator
 */
export const formatPercentageChange = (change: number): { 
  formatted: string; 
  isPositive: boolean;
} => {
  const isPositive = change >= 0;
  const formatted = `${isPositive ? '+' : ''}${change.toFixed(2)}%`;
  return { formatted, isPositive };
};
