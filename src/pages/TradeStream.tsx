import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown, Activity, Users, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarUtils";
import TopNavigation from "@/components/TopNavigation";

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
  const [viewerCount] = useState(Math.floor(Math.random() * 50) + 20);
  const [lastTrade, setLastTrade] = useState<Reaction | null>(null);

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
          setLastTrade(reactionsWithMessages[0]);
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
  const isConnected = reactions.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Activity className="h-8 w-8 text-primary animate-pulse" />
                $SIMAI Live Trade Stream
              </h1>
              <p className="text-muted-foreground mt-1">
                Watch {advisor?.name || 'AI'} react to live trading activity
              </p>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"} className="text-lg px-4 py-2">
              <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </Badge>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Viewers</span>
              </div>
              <p className="text-2xl font-bold">{viewerCount}</p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Activity className="h-4 w-4" />
                <span className="text-sm">Trades Today</span>
              </div>
              <p className="text-2xl font-bold">{reactions.length}</p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Last Trade Type</span>
              </div>
              <p className={`text-2xl font-bold ${lastTrade?.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                {lastTrade ? lastTrade.type.toUpperCase() : '--'}
              </p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Last Amount</span>
              </div>
              <p className="text-2xl font-bold">
                {lastTrade ? `${(lastTrade.amount / 1e9).toFixed(2)}M` : '--'}
              </p>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Trade Feed with Sim Reactions */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-8 w-8 border-2 border-primary">
                <AvatarImage src={avatarUrl} alt={advisor?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {advisor?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">
                {advisor?.name}'s Live Commentary
              </h2>
            </div>
            
            <ScrollArea className="h-[600px] pr-4">
              {reactions.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
                  <p className="text-xl text-muted-foreground">Waiting for trades...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Monitoring $SIMAI token activity on Solana
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {reactions.map((reaction, index) => (
                    <motion.div
                      key={reaction.signature}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mb-4"
                    >
                      <Card className={`p-4 border-l-4 ${
                        reaction.type === 'buy'
                          ? 'border-l-green-500 bg-green-50 dark:bg-green-950/20'
                          : 'border-l-red-500 bg-red-50 dark:bg-red-950/20'
                      }`}>
                        <div className="flex gap-3 mb-3">
                          <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-primary">
                            <AvatarImage src={avatarUrl} alt={advisor?.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {advisor?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground">{advisor?.name}</p>
                              <span className="text-xs text-muted-foreground">
                                {new Date(reaction.timestamp * 1000).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-base text-foreground leading-relaxed">
                              {reaction.message}
                            </p>
                          </div>
                        </div>
                        
                        {/* Trade Details */}
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div className="flex items-center gap-2">
                            {reaction.type === 'buy' ? (
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            )}
                            <span className={`font-bold text-sm uppercase ${
                              reaction.type === 'buy' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {reaction.type}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {(reaction.amount / 1e9).toFixed(2)}M tokens
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ${((reaction.amount / 1e9) * 0.000001).toFixed(4)}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </ScrollArea>
          </Card>

          {/* Recent Activity Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </h2>
            
            <ScrollArea className="h-[600px] pr-4">
              {reactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No recent trades</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reactions.slice(0, 10).map((reaction) => (
                    <Card 
                      key={reaction.signature}
                      className={`p-3 border-l-2 ${
                        reaction.type === 'buy' ? 'border-l-green-500' : 'border-l-red-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {reaction.type === 'buy' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`font-bold text-sm ${
                            reaction.type === 'buy' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {reaction.type.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(reaction.timestamp * 1000).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        {(reaction.amount / 1e9).toFixed(2)}M tokens
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ${((reaction.amount / 1e9) * 0.000001).toFixed(4)}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TradeStream;
