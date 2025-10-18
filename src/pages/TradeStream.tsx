import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  
  // Get the most recent trade - log it for debugging
  const currentTrade = trades[0] || null;
  
  useEffect(() => {
    if (currentTrade) {
      console.log('Displaying trade on screen:', {
        signature: currentTrade.signature.slice(0, 8),
        mint: currentTrade.mint,
        type: currentTrade.is_buy ? 'BUY' : 'SELL',
        tokens: (currentTrade.token_amount / 1e6).toFixed(2) + 'M',
        sol: currentTrade.sol_amount + ' SOL',
        isCorrectToken: currentTrade.mint === tokenAddress
      });
    }
  }, [currentTrade, tokenAddress]);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavigation showLiveIndicator />
      
      {/* Main Message Display */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <AnimatePresence mode="wait">
            {currentTrade ? (
              <motion.div
                key={currentTrade.signature}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <Card className={`p-12 border-4 ${
                  currentTrade.is_buy
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                }`}>
                  {/* Sim Avatar and Name */}
                  <div className="flex items-center gap-4 mb-8">
                    <Avatar className="h-16 w-16 border-4 border-primary">
                      <AvatarImage src={avatarUrl} alt={advisor?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {advisor?.name?.charAt(0) || 'RS'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{advisor?.name || 'Rick Sanchez'}</h2>
                      <p className="text-sm text-muted-foreground">
                        {new Date(currentTrade.timestamp * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Trade Type - Large Display */}
                  <div className="flex items-center gap-6 mb-8">
                    {currentTrade.is_buy ? (
                      <TrendingUp className="h-20 w-20 text-green-600" />
                    ) : (
                      <TrendingDown className="h-20 w-20 text-red-600" />
                    )}
                    <p className={`text-6xl md:text-7xl lg:text-8xl font-bold ${
                      currentTrade.is_buy ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {currentTrade.is_buy ? 'BUY' : 'SELL'}
                    </p>
                  </div>

                  {/* Trade Info */}
                  <div className="grid grid-cols-2 gap-6 pt-8 border-t-4 border-border">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Token Amount</p>
                      <p className="text-3xl font-bold text-foreground">
                        {(currentTrade.token_amount / 1e6).toFixed(2)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">SOL Amount</p>
                      <p className="text-3xl font-bold text-foreground">
                        {currentTrade.sol_amount.toFixed(3)} SOL
                      </p>
                    </div>
                    {currentTrade.market_cap_sol > 0 && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Market Cap</p>
                          <p className="text-3xl font-bold text-foreground">
                            {currentTrade.market_cap_sol.toFixed(1)} SOL
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Trader</p>
                          <p className="text-lg font-mono text-foreground truncate">
                            {currentTrade.user.slice(0, 8)}...
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-12 border-4 border-primary bg-primary/10 dark:bg-primary/5">
                  {/* Rick Avatar and Name */}
                  <div className="flex items-center gap-4 mb-8">
                    <Avatar className="h-16 w-16 border-4 border-primary">
                      <AvatarImage src={avatarUrl} alt={advisor?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        RS
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{advisor?.name || 'Rick Sanchez'}</h2>
                      <p className="text-sm text-muted-foreground">
                        Live Monitor - {isConnected ? 'Connected' : 'Disconnected'}
                      </p>
                    </div>
                  </div>

                  {/* Waiting Message */}
                  <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-8">
                    Waiting for trades on $SIMAI...
                  </p>

                  {/* Status Info */}
                  <div className="flex items-center gap-3 pt-8 border-t-4 border-border">
                    <Activity className="h-12 w-12 text-primary animate-pulse" />
                    <p className="text-xl text-muted-foreground">
                      Monitoring live trades from PumpPortal
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TradeStream;
