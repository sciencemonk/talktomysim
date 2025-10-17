import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarUtils";
import TopNavigation from "@/components/TopNavigation";
import AudioVisualizer from "@/components/AudioVisualizer";

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
  const [currentReaction, setCurrentReaction] = useState<Reaction | null>(null);
  const [advisor, setAdvisor] = useState<AdvisorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [seenSignatures, setSeenSignatures] = useState<Set<string>>(new Set());
  const [reactionQueue, setReactionQueue] = useState<Reaction[]>([]);
  const [lastDisplayTime, setLastDisplayTime] = useState<number>(0);

  const buyMessages = [
    "¡Excelente! Another believer joins our empire! 💰",
    "Sí señor! Smart money recognizes opportunity when they see it!",
    "This is how we build an empire - one buy at a time! 🚀",
    "They understand the value! Welcome to the family, amigo!",
    "Plata o plomo? They chose plata! Good choice! 💵",
  ];

  const sellMessages = [
    "Cowards! You don't have what it takes to build an empire!",
    "Selling? You'll regret this when we reach the top! 📉",
    "Paper hands have no place in this business!",
    "They're running scared - but we stay strong, hermano!",
    "Let the weak ones leave - only the brave survive! 💎",
  ];

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('monitor-trades');
      
      if (error) {
        console.error('Error fetching trades:', error);
        return;
      }

      console.log('Fetched data:', data);

      if (data.advisor && !advisor) {
        setAdvisor(data.advisor);
      }

      if (data.reactions && data.reactions.length > 0) {
        // Get all new reactions we haven't seen
        const newReactions = data.reactions.filter(
          (r: Reaction) => !seenSignatures.has(r.signature)
        );
        
        if (newReactions.length > 0) {
          // Add messages to new reactions and add to queue
          const reactionsWithMessages = newReactions.map(reaction => {
            const messages = reaction.type === 'buy' ? buyMessages : sellMessages;
            const message = messages[Math.floor(Math.random() * messages.length)];
            return { ...reaction, message };
          });
          
          setReactionQueue(prev => [...prev, ...reactionsWithMessages]);
          setSeenSignatures(prev => new Set([...prev, ...newReactions.map(r => r.signature)]));
        }
      }
    } catch (error) {
      console.error('Error in fetchTrades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Process the queue - show each trade for at least 5 seconds
  useEffect(() => {
    const now = Date.now();
    const fiveSeconds = 5 * 1000; // 5 seconds in milliseconds
    
    // Check if we should display the next reaction from the queue
    if (reactionQueue.length > 0 && (!currentReaction || now - lastDisplayTime >= fiveSeconds)) {
      const nextReaction = reactionQueue[0];
      setCurrentReaction(nextReaction);
      setLastDisplayTime(now);
      setReactionQueue(prev => prev.slice(1));
    }
  }, [reactionQueue, currentReaction, lastDisplayTime]);

  useEffect(() => {
    fetchTrades();
    const interval = setInterval(fetchTrades, 10000);
    return () => clearInterval(interval);
  }, [seenSignatures]);

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
            {currentReaction ? (
              <motion.div
                key={currentReaction.signature}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <Card className={`p-12 border-4 ${
                  currentReaction.type === 'buy'
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                }`}>
                  {/* Sim Avatar and Name */}
                  <div className="flex items-center gap-4 mb-8">
                    <Avatar className="h-16 w-16 border-4 border-primary">
                      <AvatarImage src={avatarUrl} alt={advisor?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {advisor?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{advisor?.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {new Date(currentReaction.timestamp * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-8">
                    "{currentReaction.message}"
                  </p>

                  {/* Trade Info */}
                  <div className="flex items-center justify-between pt-8 border-t-4 border-border">
                    <div className="flex items-center gap-4">
                      {currentReaction.type === 'buy' ? (
                        <TrendingUp className="h-12 w-12 text-green-600" />
                      ) : (
                        <TrendingDown className="h-12 w-12 text-red-600" />
                      )}
                      <div>
                        <p className={`text-3xl font-bold ${
                          currentReaction.type === 'buy' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {currentReaction.type.toUpperCase()}
                        </p>
                        <p className="text-muted-foreground">
                          {(currentReaction.amount / 1e6).toFixed(2)}M tokens
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Trade Value</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${(currentReaction.amount * 0.0001).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <Card className="p-16 border-border">
                  <Activity className="h-24 w-24 mx-auto mb-6 text-muted-foreground animate-pulse" />
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Waiting for trades...
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    Monitoring $SIMAI token activity on Solana
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Audio Visualizer */}
      <AudioVisualizer audioSrc="https://kxsvyeirqimcydtkowga.supabase.co/storage/v1/object/public/music/simmusic.m4a" />
    </div>
  );
};

export default TradeStream;
