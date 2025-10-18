import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarUtils";
import TopNavigation from "@/components/TopNavigation";
import { usePumpFunStream } from "@/hooks/usePumpFunStream";

interface Reaction {
  type: 'buy' | 'sell';
  amount: number;
  solAmount: number;
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
  const tokenAddress = 'FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump';
  const { latestTrade, isConnected } = usePumpFunStream(tokenAddress);
  
  const [currentReaction, setCurrentReaction] = useState<Reaction | null>(null);
  const [advisor, setAdvisor] = useState<AdvisorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [seenSignatures, setSeenSignatures] = useState<Set<string>>(new Set());
  const [reactionQueue, setReactionQueue] = useState<Reaction[]>([]);
  const [lastDisplayTime, setLastDisplayTime] = useState<number>(0);

  const buyMessages = [
    "Now THIS is what I'm talking about! *burp* Smart money recognizes genius when they see it!",
    "Finally, someone with an actual brain! This is how you invest, Morty!",
    "Look at this Chad right here! *burp* Buying while the paper hands are crying!",
    "Hell yeah! *burp* This is the kind of big brain energy I can respect!",
    "Now THAT'S what I call conviction! *burp* Welcome to the winner's circle, baby!",
  ];

  const sellMessages = [
    "What a pathetic *burp* excuse for a trader! Selling at the worst possible time like a complete moron!",
    "Wow, just wow. *burp* This is literally the dumbest thing I've seen all day, and I've seen a LOT of dumb things!",
    "Paper hands alert! *burp* This coward is gonna regret this for the rest of their miserable life!",
    "Are you KIDDING me?! *burp* Selling now is like... it's like choosing to be poor on purpose, Morty!",
    "What an absolute smooth-brain move! *burp* This person's gonna be crying into their Ramen noodles tonight!",
  ];

  const [currentRickStatement, setCurrentRickStatement] = useState<string>(
    "Listen *burp* Morty, these crypto degenerates think they're gonna get rich. It's adorable."
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNewRickStatement = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-rick-commentary', {
        body: {}
      });

      if (error) {
        console.error('Error generating Rick statement:', error);
        throw error;
      }

      if (data?.commentary) {
        setCurrentRickStatement(data.commentary);
        console.log('Generated new Rick statement:', data.commentary);
      }
    } catch (error) {
      console.error('Error generating Rick statement:', error);
      // Keep current statement on error
    } finally {
      setIsGenerating(false);
    }
  };

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

  // Generate new Rick statement every 60 seconds when no trades are showing
  useEffect(() => {
    if (!currentReaction) {
      // Generate immediately on first load
      generateNewRickStatement();
      
      const interval = setInterval(() => {
        generateNewRickStatement();
      }, 60000); // 60 seconds

      return () => clearInterval(interval);
    }
  }, [currentReaction]);

  // Handle new trades from WebSocket
  useEffect(() => {
    if (!latestTrade || seenSignatures.has(latestTrade.signature)) return;

    console.log('New trade from WebSocket:', latestTrade);

    const messages = latestTrade.is_buy ? buyMessages : sellMessages;
    const message = messages[Math.floor(Math.random() * messages.length)];

    const reactionWithMessage = {
      type: latestTrade.is_buy ? 'buy' as const : 'sell' as const,
      amount: latestTrade.token_amount,
      solAmount: latestTrade.sol_amount,
      timestamp: latestTrade.timestamp,
      signature: latestTrade.signature,
      message,
    };

    setReactionQueue(prev => [...prev, reactionWithMessage]);
    setSeenSignatures(prev => new Set([...prev, latestTrade.signature]));
  }, [latestTrade]);

  // Process the queue - show each trade for at least 5 seconds
  useEffect(() => {
    const checkQueue = () => {
      const now = Date.now();
      const fiveSeconds = 5 * 1000; // 5 seconds in milliseconds
      
      // Check if we should display the next reaction from the queue
      if (reactionQueue.length > 0 && (!currentReaction || now - lastDisplayTime >= fiveSeconds)) {
        const nextReaction = reactionQueue[0];
        console.log('Displaying trade:', nextReaction);
        setCurrentReaction(nextReaction);
        setLastDisplayTime(now);
        setReactionQueue(prev => prev.slice(1));
      }
    };

    // Check immediately
    checkQueue();

    // Set up interval to check every 500ms
    const intervalId = setInterval(checkQueue, 500);

    return () => clearInterval(intervalId);
  }, [reactionQueue, currentReaction, lastDisplayTime]);

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
                        {currentReaction.solAmount.toFixed(3)} SOL
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key={currentRickStatement}
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
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Rick's Statement */}
                  <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-8">
                    "{currentRickStatement}"
                  </p>

                  {/* Status Info */}
                  <div className="flex items-center gap-3 pt-8 border-t-4 border-border">
                    <Activity className="h-12 w-12 text-primary animate-pulse" />
                    <p className="text-xl text-muted-foreground">
                      Monitoring $SIMAI token activity
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
