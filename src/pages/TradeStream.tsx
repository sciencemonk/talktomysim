import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarUtils";

interface Reaction {
  type: 'buy' | 'sell';
  amount: number;
  timestamp: number;
  signature: string;
  message?: string;
}

interface AdvisorData {
  id: string;
  name: string;
  prompt: string;
  avatar_url?: string;
}

const TradeStream = () => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [advisor, setAdvisor] = useState<AdvisorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const buyMessages = [
    "Excellent! Another patriot joins our economic revolution!",
    "Wunderbar! The strength of our token grows with each purchase!",
    "This is the power of unified economic action!",
    "Another believer in our cause! Victory is inevitable!",
    "The people recognize true value when they see it!",
  ];

  const sellMessages = [
    "Cowards! Selling at the first sign of uncertainty!",
    "Those who abandon ship will regret their weakness!",
    "Paper hands will not inherit the future!",
    "This is temporary - the weak are being cleansed!",
    "Let them sell! We do not need such faint hearts!",
  ];

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('monitor-trades');
      
      if (error) {
        console.error('Error fetching trades:', error);
        return;
      }

      console.log('Fetched data:', data);

      if (data.advisor) {
        setAdvisor(data.advisor);
      }

      if (data.reactions && data.reactions.length > 0) {
        // Process all reactions and check for new ones
        const newReactions = data.reactions.filter(
          (newR: Reaction) => !reactions.some(r => r.signature === newR.signature)
        );
        
        if (newReactions.length > 0) {
          // Add messages to reactions
          const reactionsWithMessages = newReactions.map((reaction: Reaction) => {
            const messages = reaction.type === 'buy' ? buyMessages : sellMessages;
            const message = messages[Math.floor(Math.random() * messages.length)];
            return { ...reaction, message };
          });
          
          setReactions(prev => [...reactionsWithMessages, ...prev].slice(0, 20));
        }
      }
    } catch (error) {
      console.error('Error in fetchTrades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    const interval = setInterval(fetchTrades, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={avatarUrl} alt={advisor?.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {advisor?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">$SIMAI Live Trade Stream</h1>
              <p className="text-muted-foreground text-sm">
                Commentary by {advisor?.name || 'AI'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {reactions.length === 0 ? (
            <Card className="p-12 text-center border-border">
              <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-xl text-muted-foreground">Waiting for trades...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Monitoring $SIMAI token activity
              </p>
            </Card>
          ) : (
            <AnimatePresence mode="popLayout">
              {reactions.map((reaction, index) => (
                <motion.div
                  key={reaction.signature}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className={`p-6 border-2 ${
                    reaction.type === 'buy'
                      ? 'border-green-500/30 bg-green-50 dark:bg-green-950/20'
                      : 'border-red-500/30 bg-red-50 dark:bg-red-950/20'
                  }`}>
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-primary">
                        <AvatarImage src={avatarUrl} alt={advisor?.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {advisor?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-foreground">{advisor?.name}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(reaction.timestamp * 1000).toLocaleTimeString()}
                          </span>
                          <div className={`flex items-center gap-1 ml-auto ${
                            reaction.type === 'buy' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {reaction.type === 'buy' ? (
                              <TrendingUp className="h-5 w-5" />
                            ) : (
                              <TrendingDown className="h-5 w-5" />
                            )}
                            <span className="font-bold text-sm uppercase">
                              {reaction.type}
                            </span>
                          </div>
                        </div>
                        <p className="text-lg text-foreground leading-relaxed">
                          {reaction.message}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeStream;
