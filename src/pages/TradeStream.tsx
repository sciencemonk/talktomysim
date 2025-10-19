import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePumpFunStream } from "@/hooks/usePumpFunStream";
import TopNavigation from "@/components/TopNavigation";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdvisorData {
  id: string;
  name: string;
  prompt: string;
  avatar_url: string | null;
}

const TradeStream = () => {
  const [advisor, setAdvisor] = useState<AdvisorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentary, setCommentary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTokenName, setCurrentTokenName] = useState<string>("");
  const commentaryTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { latestToken, isConnected, newTokens } = usePumpFunStream(true);

  useEffect(() => {
    const fetchAdvisor = async () => {
      const { data } = await supabase
        .from("advisors")
        .select("*")
        .ilike("name", "%rick%sanchez%")
        .single();
      
      if (data) {
        setAdvisor(data);
      }
      setIsLoading(false);
    };

    fetchAdvisor();
  }, []);

  const generateCommentary = async (tokenName: string, tokenSymbol: string) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setCurrentTokenName(`${tokenName} (${tokenSymbol})`);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-rick-commentary', {
        body: { 
          context: `A new token just launched on pump.fun called "${tokenName}" with the symbol ${tokenSymbol}. Comment on how ridiculous, genius, or utterly moronic this token name is.`
        }
      });

      if (error) throw error;
      
      setCommentary(data.commentary);
      
      // Clear any existing timer
      if (commentaryTimerRef.current) {
        clearTimeout(commentaryTimerRef.current);
      }
      
      // Set new timer for 10 seconds
      commentaryTimerRef.current = setTimeout(() => {
        setCommentary("");
        setCurrentTokenName("");
      }, 10000);
      
    } catch (error) {
      console.error('Error generating commentary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (latestToken && !isGenerating && !commentary) {
      generateCommentary(latestToken.name, latestToken.symbol);
    }
  }, [latestToken]);

  useEffect(() => {
    return () => {
      if (commentaryTimerRef.current) {
        clearTimeout(commentaryTimerRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg p-8 shadow-lg border">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarImage src={advisor?.avatar_url || undefined} />
                <AvatarFallback>🧪</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">
                  {advisor?.name || "Rick Sanchez"}'s Token Commentary
                </h1>
                <p className="text-muted-foreground">
                  Commenting on new pump.fun tokens as they launch
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected to pump.fun stream' : 'Connecting...'}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                {newTokens.length} tokens detected
              </span>
            </div>

            <AnimatePresence mode="wait">
              {commentary ? (
                <motion.div
                  key={currentTokenName}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4"
                >
                  <div className="p-6 rounded-lg bg-primary/10 border-2 border-primary/20">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-primary mb-2">
                        New Token: {currentTokenName}
                      </h3>
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      <p className="text-lg leading-relaxed italic">
                        "{commentary}"
                      </p>
                    </div>

                    <div className="mt-4 text-right">
                      <span className="text-sm text-muted-foreground">
                        - {advisor?.name || "Rick Sanchez"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="mb-4">
                    <span className="text-4xl">🎤</span>
                  </div>
                  <p className="text-muted-foreground">
                    {isConnected 
                      ? 'Waiting for new tokens to launch...' 
                      : 'Connecting to pump.fun...'}
                  </p>
                  {isGenerating && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Generating commentary...
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeStream;
