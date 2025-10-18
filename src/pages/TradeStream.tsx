import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarUtils";
import TopNavigation from "@/components/TopNavigation";
import { usePumpFunStream } from "@/hooks/usePumpFunStream";

interface AdvisorData {
  id: string;
  name: string;
  prompt: string;
  avatar_url?: string;
}

const TradeStream = () => {
  const tokenAddress = 'FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump';
  const { trades, isConnected } = usePumpFunStream(tokenAddress);
  
  const [advisor, setAdvisor] = useState<AdvisorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdvisor = async () => {
    try {
      const { data, error } = await supabase
        .from('advisors')
        .select('id, name, prompt, avatar_url')
        .ilike('name', '%rick%sanchez%')
        .single();

      if (error) {
        console.error('Error fetching advisor:', error);
        return;
      }

      if (data) {
        console.log('Fetched Rick Sanchez advisor:', data);
        setAdvisor(data);
      }
    } catch (error) {
      console.error('Error in fetchAdvisor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch advisor on mount
  useEffect(() => {
    fetchAdvisor();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 border-border">
          <div className="flex items-center gap-4">
            <Activity className="h-8 w-8 animate-spin text-primary" />
            <p className="text-foreground text-xl">Connecting to trade stream...</p>
          </div>
        </Card>
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(advisor?.avatar_url);
  
  // Get most recent 10 trades
  const recentTrades = trades.slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation showLiveIndicator />
      
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 border-4 border-primary">
              <AvatarImage src={avatarUrl} alt={advisor?.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {advisor?.name?.charAt(0) || 'RS'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{advisor?.name || 'Rick Sanchez'} Trade Monitor</h1>
              <p className="text-muted-foreground">
                Live $SIMAI trades - {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </p>
            </div>
          </div>
        </div>

        {/* Trades List */}
        <div className="space-y-4">
          {recentTrades.length === 0 ? (
            <Card className="p-12 border-4 border-primary bg-primary/10">
              <div className="flex items-center justify-center gap-4">
                <Activity className="h-12 w-12 text-primary animate-pulse" />
                <p className="text-xl text-muted-foreground">
                  Waiting for trades...
                </p>
              </div>
            </Card>
          ) : (
            recentTrades.map((trade, index) => (
              <motion.div
                key={trade.signature}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className={`p-6 border-2 ${
                  trade.is_buy
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {trade.is_buy ? (
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      ) : (
                        <TrendingDown className="h-8 w-8 text-red-600" />
                      )}
                      <div>
                        <p className={`text-2xl font-bold ${
                          trade.is_buy ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trade.is_buy ? 'BUY' : 'SELL'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(trade.timestamp * 1000).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-8">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Tokens</p>
                        <p className="text-lg font-bold text-foreground">
                          {(trade.token_amount / 1e6).toFixed(2)}M
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">SOL Amount</p>
                        <p className="text-lg font-bold text-foreground">
                          {trade.sol_amount.toFixed(3)} SOL
                        </p>
                      </div>
                      {trade.market_cap_sol > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
                          <p className="text-lg font-bold text-foreground">
                            {trade.market_cap_sol.toFixed(1)} SOL
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {trade.signature}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeStream;
