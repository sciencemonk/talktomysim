import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Reaction {
  type: 'buy' | 'sell';
  amount: number;
  timestamp: number;
  signature: string;
}

interface AdvisorData {
  id: string;
  name: string;
  prompt: string;
}

const TradeStream = () => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [advisor, setAdvisor] = useState<AdvisorData | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>("");
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
        const newReaction = data.reactions[0];
        
        // Check if this is a new reaction
        if (!reactions.some(r => r.signature === newReaction.signature)) {
          setReactions(prev => [newReaction, ...prev.slice(0, 9)]);
          
          // Generate message
          const messages = newReaction.type === 'buy' ? buyMessages : sellMessages;
          const message = messages[Math.floor(Math.random() * messages.length)];
          setCurrentMessage(message);
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20">
          <div className="flex items-center gap-4">
            <Activity className="h-8 w-8 animate-spin text-primary" />
            <p className="text-white text-xl">Connecting to trade stream...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/20 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">$SIMAI Trade Stream</h1>
              <p className="text-white/60">Live commentary by {advisor?.name || 'AI'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Large Message Display */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-gradient-to-br from-red-900/20 to-black border-red-500/30 min-h-[400px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {currentMessage ? (
                  <motion.div
                    key={currentMessage}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <p className="text-4xl md:text-5xl font-bold leading-tight text-white">
                      "{currentMessage}"
                    </p>
                    <p className="text-xl text-white/60 mt-6">- {advisor?.name || 'AI Advisor'}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-white/40"
                  >
                    <Activity className="h-16 w-16 mx-auto mb-4 animate-pulse" />
                    <p className="text-2xl">Waiting for trades...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="p-6 bg-white/5 border-white/10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                {reactions.length === 0 ? (
                  <p className="text-white/40 text-center py-8">No recent trades</p>
                ) : (
                  reactions.map((reaction, index) => (
                    <motion.div
                      key={reaction.signature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        reaction.type === 'buy'
                          ? 'bg-green-900/20 border-green-500/30'
                          : 'bg-red-900/20 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {reaction.type === 'buy' ? (
                          <TrendingUp className="h-6 w-6 text-green-400" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-400" />
                        )}
                        <div className="flex-1">
                          <p className="font-bold">
                            {reaction.type === 'buy' ? 'BUY' : 'SELL'}
                          </p>
                          <p className="text-sm text-white/60">
                            {new Date(reaction.timestamp * 1000).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeStream;
