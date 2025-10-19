import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePumpFunStream } from "@/hooks/usePumpFunStream";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import pumpLogo from "@/assets/pump-logo.png";

interface AdvisorData {
  id: string;
  name: string;
  prompt: string;
  avatar_url: string | null;
}

const SIM_ROTATION = ['Rick Sanchez', 'Adolf Hitler', 'Pablo Escobar', 'Jesus Christ', 'Alon'];
const TOKENS_PER_SIM = 10;

const TradeStream = () => {
  const [advisors, setAdvisors] = useState<AdvisorData[]>([]);
  const [currentSimIndex, setCurrentSimIndex] = useState(0);
  const [nextSimIndex, setNextSimIndex] = useState(1);
  const [tokensProcessedBySim, setTokensProcessedBySim] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [commentary, setCommentary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTokenName, setCurrentTokenName] = useState<string>("");
  const [lastProcessedMint, setLastProcessedMint] = useState<string>("");
  const commentaryTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { latestToken, isConnected, newTokens } = usePumpFunStream(true);

  const currentAdvisor = advisors[currentSimIndex];
  const nextAdvisor = advisors[nextSimIndex];

  useEffect(() => {
    const fetchAdvisors = async () => {
      const advisorPromises = SIM_ROTATION.map(async (simName) => {
        const { data } = await supabase
          .from("advisors")
          .select("*")
          .ilike("name", `%${simName}%`)
          .single();
        return data;
      });
      
      const fetchedAdvisors = await Promise.all(advisorPromises);
      const validAdvisors = fetchedAdvisors.filter(Boolean) as AdvisorData[];
      
      if (validAdvisors.length > 0) {
        setAdvisors(validAdvisors);
        setNextSimIndex(validAdvisors.length > 1 ? 1 : 0);
      }
      setIsLoading(false);
    };

    fetchAdvisors();
  }, []);

  const generateCommentary = async (tokenName: string, tokenSymbol: string) => {
    if (isGenerating || !currentAdvisor) {
      console.log('[TradeStream] Skipping generation:', { isGenerating, hasAdvisor: !!currentAdvisor });
      return;
    }
    
    console.log('[TradeStream] Starting commentary generation for:', tokenName, tokenSymbol, 'with advisor:', currentAdvisor.name);
    
    // Clear previous commentary when starting new generation
    setCommentary("");
    setCurrentTokenName("");
    setIsGenerating(true);
    setCurrentTokenName(`${tokenName} (${tokenSymbol})`);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-rick-commentary', {
        body: { 
          advisorName: currentAdvisor.name,
          advisorPrompt: currentAdvisor.prompt,
          context: `A new token just launched on pump.fun called "${tokenName}" with the symbol ${tokenSymbol}. Give a SHORT one-sentence sarcastic comment (max 15 words) in the style of ${currentAdvisor.name}.`
        }
      });

      if (error) {
        console.error('[TradeStream] Error from edge function:', error);
        throw error;
      }
      
      console.log('[TradeStream] Commentary received:', data.commentary);
      setCommentary(data.commentary);
      
      // Clear any existing timer
      if (commentaryTimerRef.current) {
        clearTimeout(commentaryTimerRef.current);
      }
      
      // Set new timer for 10 seconds to handle Sim rotation
      commentaryTimerRef.current = setTimeout(() => {
        console.log('[TradeStream] Timer expired, checking for Sim rotation and next token');
        
        // Check if we need to switch Sims
        const newCount = tokensProcessedBySim + 1;
        setTokensProcessedBySim(newCount);
        
        if (newCount >= TOKENS_PER_SIM && advisors.length > 1) {
          console.log('[TradeStream] Switching to next Sim');
          const newSimIndex = (currentSimIndex + 1) % advisors.length;
          const newNextIndex = (newSimIndex + 1) % advisors.length;
          setCurrentSimIndex(newSimIndex);
          setNextSimIndex(newNextIndex);
          setTokensProcessedBySim(0);
        }
        
        // Mark as ready for next token by clearing isGenerating state
        // This will trigger the useEffect to process the next token
        setIsGenerating(false);
      }, 10000);
      
    } catch (error) {
      console.error('[TradeStream] Error generating commentary:', error);
      // On error, set timer to retry
      commentaryTimerRef.current = setTimeout(() => {
        console.log('[TradeStream] Error recovery, allowing next token');
        setIsGenerating(false);
      }, 2000);
    }
  };

  // Process new tokens as they arrive
  useEffect(() => {
    const nextToken = newTokens[0];
    
    console.log('[TradeStream] Token processing check:', {
      hasNewToken: !!nextToken,
      nextTokenMint: nextToken?.mint,
      lastProcessedMint,
      isGenerating,
      isDifferentToken: nextToken?.mint !== lastProcessedMint,
      canProcess: nextToken && nextToken.mint !== lastProcessedMint && !isGenerating && currentAdvisor
    });
    
    // Process if we have a new token that's different from the last one we processed
    if (nextToken && nextToken.mint !== lastProcessedMint && !isGenerating && currentAdvisor) {
      console.log('[TradeStream] Processing new token:', nextToken.name, nextToken.symbol);
      setLastProcessedMint(nextToken.mint);
      generateCommentary(nextToken.name, nextToken.symbol);
    }
  }, [newTokens, lastProcessedMint, isGenerating, currentAdvisor]);

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
      {/* Compact Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img src="/sim-logo.png" alt="Sim" className="h-8 w-8" />
                <span className="text-lg font-bold">+</span>
                <img src={pumpLogo} alt="Pump.fun" className="h-8 w-8" />
              </div>
            </div>
            <Badge variant="destructive" className="text-xs font-bold flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-white rounded-full"
              />
              LIVE
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg p-8 shadow-lg border">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarImage src={currentAdvisor?.avatar_url || undefined} />
                <AvatarFallback>🎭</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold mb-1">Sim {currentAdvisor?.name || "Loading..."}</h2>
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
                      <h3 className="text-3xl font-bold text-primary mb-2">
                        {currentTokenName}
                      </h3>
                    </div>
                    
                    <div className="flex gap-6 items-start">
                      {latestToken?.image_uri && (
                        <div className="flex-shrink-0">
                          <img 
                            src={latestToken.image_uri} 
                            alt={latestToken.name}
                            className="w-32 h-32 rounded-lg object-cover border-2 border-primary/30"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="prose prose-sm max-w-none">
                          <p className="text-3xl leading-relaxed italic font-medium">
                            {commentary}
                          </p>
                        </div>

                        <div className="mt-4 text-right">
                          <span className="text-sm text-muted-foreground">
                            - {currentAdvisor?.name}
                          </span>
                          <div className="text-xs text-muted-foreground mt-1">
                            {tokensProcessedBySim + 1} of {TOKENS_PER_SIM} tokens
                          </div>
                        </div>
                      </div>
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
            
            {/* Next Sim Preview */}
            {advisors.length > 1 && nextAdvisor && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Next Sim commentator:</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={nextAdvisor.avatar_url || undefined} />
                      <AvatarFallback>🎭</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">Sim {nextAdvisor.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground ml-auto">
                    in {TOKENS_PER_SIM - tokensProcessedBySim} tokens
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeStream;
