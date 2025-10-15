import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import TopNavigation from "@/components/TopNavigation";
import SimpleFooter from "@/components/SimpleFooter";
import { AgentType } from "@/types/agent";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Sparkles, MessageCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import debateIcon from "@/assets/debate-icon.png";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  simName: string;
  simAvatar?: string;
  content: string;
  timestamp: Date;
}

const DEBATE_DURATION = 5 * 60 * 1000; // 5 minutes

const philosophicalQuestions = [
  "Is democracy actually the best form of government?",
  "Do we have too much or too little freedom of speech?",
  "Is meritocracy real or a myth?",
  "Should borders exist?",
  "Is consumerism destroying civilization?",
  "Can men and women truly be equal?",
  "Is tradition holding us back or keeping us grounded?",
  "Should we let weak companies fail or bail them out?",
  "Is ambition a virtue or a vice?",
  "Does hard work actually lead to success?",
  "Is the nuclear family essential or outdated?",
  "Should we prioritize individual freedom or collective good?",
  "Is inequality natural and necessary?",
  "Can truth exist without power?",
  "Is comfort making us weak?",
  "Should elites rule or should power be distributed?",
  "Is violence ever justified?",
];

const LiveChat = () => {
  const navigate = useNavigate();
  const [selectedSims, setSelectedSims] = useState<[AgentType | null, AgentType | null]>([null, null]);
  const [question, setQuestion] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSelecting, setIsSelecting] = useState(true);
  const [isDebating, setIsDebating] = useState(false);
  const [allHistoricalSims, setAllHistoricalSims] = useState<AgentType[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(DEBATE_DURATION);
  const [typingIndicator, setTypingIndicator] = useState<string | null>(null);
  const [selector1Index, setSelector1Index] = useState<number>(0);
  const [selector2Index, setSelector2Index] = useState<number>(1);
  const debateStartTimeRef = useRef<number>(0);
  const conversationIndexRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentDebateIdRef = useRef<string>(Date.now().toString());

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch verified historical sims for debate
  useEffect(() => {
    const fetchSims = async () => {
      console.log("Fetching verified historical sims for live chat...");

      const { data: historicalSims, error } = await supabase
        .from("advisors")
        .select("*")
        .eq("is_verified", true)
        .eq("sim_type", "historical")
        .order("created_at", { ascending: false });

      console.log("Verified historical sims:", historicalSims?.length || 0);

      if (error) {
        console.error("Error fetching historical sims:", error);
        setIsSelecting(false);
        return;
      }

      if (historicalSims && historicalSims.length >= 2) {
        const transformedSims = historicalSims.map(
          (advisor: any) =>
            ({
              id: advisor.id,
              name: advisor.name,
              description: advisor.description || advisor.title || "",
              type: "General Tutor" as any,
              status: "active" as any,
              createdAt: advisor.created_at,
              updatedAt: advisor.updated_at,
              avatar: advisor.avatar_url,
              prompt: advisor.prompt,
            }) as AgentType,
        );

        setAllHistoricalSims(transformedSims);
        
        // Animate selectors moving around grid - 4 seconds total
        let moveCount = 0;
        const maxMoves = 16; // 4 seconds at 250ms intervals
        
        // Initialize with truly random positions
        const initialIndex1 = Math.floor(Math.random() * transformedSims.length);
        let initialIndex2 = Math.floor(Math.random() * transformedSims.length);
        while (initialIndex2 === initialIndex1) {
          initialIndex2 = Math.floor(Math.random() * transformedSims.length);
        }
        setSelector1Index(initialIndex1);
        setSelector2Index(initialIndex2);
        
        const selectorInterval = setInterval(() => {
          let newIndex1 = Math.floor(Math.random() * transformedSims.length);
          let newIndex2 = Math.floor(Math.random() * transformedSims.length);
          // Ensure they're different
          while (newIndex2 === newIndex1) {
            newIndex2 = Math.floor(Math.random() * transformedSims.length);
          }
          setSelector1Index(newIndex1);
          setSelector2Index(newIndex2);
          moveCount++;
          
          if (moveCount >= maxMoves) {
            clearInterval(selectorInterval);
          }
        }, 250);

        console.log("Loaded historical sims for debate:", transformedSims.map((s) => s.name).join(", "));
      } else {
        console.error("Not enough historical sims for debate. Need at least 2, found:", historicalSims?.length || 0);
        setIsSelecting(false);
      }
    };

    fetchSims();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isDebating) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - debateStartTimeRef.current;
      const remaining = Math.max(0, DEBATE_DURATION - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isDebating]);

  const selectRandomSims = () => {
    console.log("selectRandomSims called, available sims:", allHistoricalSims.length);

    if (allHistoricalSims.length < 2) {
      console.error("Not enough sims to select");
      setIsSelecting(false);
      return;
    }

    setIsSelecting(true);
    setMessages([]);

    // Truly random selection for each visitor - use final selector positions
    const sim1 = allHistoricalSims[selector1Index];
    const sim2 = allHistoricalSims[selector2Index];

    console.log("Selected sims:", sim1.name, "vs", sim2.name);

    // Random question selection
    const selectedQuestion = philosophicalQuestions[Math.floor(Math.random() * philosophicalQuestions.length)];

    console.log("Selected question:", selectedQuestion);

    // Finish selection after 4 seconds
    setTimeout(() => {
      setSelectedSims([sim1, sim2]);
      setQuestion(selectedQuestion);
      setIsSelecting(false);
      startDebate(sim1, sim2, selectedQuestion);
    }, 4000);
  };

  const startDebate = async (sim1: AgentType, sim2: AgentType, question: string) => {
    console.log("Starting debate between", sim1.name, "and", sim2.name);
    
    // Generate new debate ID and clear all messages
    const debateId = Date.now().toString();
    currentDebateIdRef.current = debateId;
    setMessages([]);
    
    setIsDebating(true);
    debateStartTimeRef.current = Date.now();
    conversationIndexRef.current = 0;

    const debateMessages: Message[] = [];

    // Initial opening statements
    console.log("Generating first response...");
    setTypingIndicator(sim1.name);
    const firstResponse = await generateResponse(sim1, question, [], debateMessages, debateId);
    setTypingIndicator(null);
    if (!firstResponse) return;
    debateMessages.push(firstResponse);

    await new Promise((resolve) => setTimeout(resolve, 9000)); // Give time to read

    console.log("Generating second response...");
    setTypingIndicator(sim2.name);
    const secondResponse = await generateResponse(sim2, question, debateMessages, debateMessages, debateId);
    setTypingIndicator(null);
    if (!secondResponse) return;
    debateMessages.push(secondResponse);

    // Continue conversation
    continueDebate(sim1, sim2, question, debateMessages, debateId);
  };

  const continueDebate = async (sim1: AgentType, sim2: AgentType, question: string, debateMessages: Message[], debateId: string) => {
    let exchangeCount = 0;

    while (Date.now() - debateStartTimeRef.current < DEBATE_DURATION) {
      // Check if this debate session is still active
      if (currentDebateIdRef.current !== debateId) {
        console.log("Debate session ended, stopping message generation");
        break;
      }

      const currentSim = exchangeCount % 2 === 0 ? sim1 : sim2;

      await new Promise((resolve) => setTimeout(resolve, 9000)); // Wait for reading time

      // Check again after waiting to avoid generating after time is up or debate changed
      if (Date.now() - debateStartTimeRef.current >= DEBATE_DURATION) break;
      if (currentDebateIdRef.current !== debateId) break;

      setTypingIndicator(currentSim.name);
      const newResponse = await generateResponse(currentSim, question, debateMessages, debateMessages, debateId);
      setTypingIndicator(null);

      if (newResponse) {
        debateMessages.push(newResponse);
        exchangeCount++;
      }
    }
  };

  const generateResponse = async (
    sim: AgentType,
    question: string,
    previousMessages: Message[],
    allMessages: Message[],
    debateId: string
  ): Promise<Message | null> => {
    try {
      const isFirstMessage = previousMessages.length === 0;
      const lastMessage = previousMessages[previousMessages.length - 1];
      const otherDebater = lastMessage ? lastMessage.simName : "";

      const prompt = isFirstMessage
        ? `You are ${sim.name} in a live philosophical debate. The question is: "${question}". 

Give a punchy opening statement. Stay true to your character. Be conversational and direct - like you're talking to someone, not lecturing. MAX 2 sentences. Make them count.`
        : `You are ${sim.name} in a live philosophical debate about: "${question}". 

${otherDebater} just said:
"${lastMessage?.content}"

Respond conversationally. NO lengthy speeches. Think fast-paced debate, not philosophy lecture. Jump into your point - don't start with "Ah, [name]" or other formalities. MAX 2-3 short sentences. Be sharp and direct.`;

      console.log("Sending debate prompt for", sim.name);

      const { data, error } = await supabase.functions.invoke("chat-completion", {
        body: {
          messages: [{ role: "user", content: prompt }],
          agent: {
            prompt: sim.prompt || "",
            name: sim.name,
          },
          isDebate: true,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        return null;
      }

      console.log("Received response for", sim.name, ":", data?.content?.substring(0, 100));

      const newMessage: Message = {
        id: `${sim.id}-${Date.now()}`,
        simName: sim.name,
        simAvatar: sim.avatar,
        content: data?.content || "",
        timestamp: new Date(),
      };

      // Only add message if this debate session is still active
      if (currentDebateIdRef.current === debateId) {
        setMessages((prev) => [...prev, newMessage]);
        conversationIndexRef.current++;
      } else {
        console.log("Debate session changed, discarding message from old debate");
        return null;
      }

      return newMessage;
    } catch (error) {
      console.error("Error generating response:", error);
      return null;
    }
  };

  const resetDebate = () => {
    // Generate new debate ID to invalidate any pending message operations
    currentDebateIdRef.current = Date.now().toString();
    
    setIsDebating(false);
    setMessages([]);
    setTypingIndicator(null);
    setTimeRemaining(DEBATE_DURATION);
    selectRandomSims();
  };

  // Initial selection on mount
  useEffect(() => {
    if (allHistoricalSims.length >= 2 && !selectedSims[0]) {
      selectRandomSims();
    }
  }, [allHistoricalSims]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavigation />

      {/* Fixed Header Section */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          {/* Timer and Question - Compact */}
          <div className="mb-4 space-y-3">
            {isDebating && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="font-mono text-lg font-bold">{formatTime(timeRemaining)} until next topic</span>
                  <button
                    onClick={() => window.location.reload()}
                    className="ml-2 p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                    aria-label="Refresh debate"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Selection Animation - Full Page Grid */}
            <AnimatePresence mode="wait">
              {isSelecting && allHistoricalSims.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8"
                >
                  <div className="w-full max-w-6xl h-full flex flex-col space-y-3 md:space-y-4 py-4">
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-center space-y-2 md:space-y-3 flex-shrink-0"
                    >
                      <motion.img 
                        src={debateIcon} 
                        alt="Debate" 
                        className="h-10 w-10 md:h-14 lg:h-16 md:w-14 lg:w-16 mx-auto"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground px-4">
                        Selecting Sims for debate
                      </h2>
                    </motion.div>

                    {/* Avatar Grid with Moving Selectors - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-2 md:px-4">
                      <div className="relative grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-2.5 md:gap-3 py-2">
                        {allHistoricalSims.map((sim, index) => {
                          const isSelected = selector1Index === index || selector2Index === index;
                          return (
                            <motion.div
                              key={sim.id}
                              initial={{ scale: 0, opacity: 0, rotateY: -180 }}
                              animate={{ 
                                scale: 1, 
                                opacity: 1,
                                rotateY: 0
                              }}
                              transition={{ 
                                delay: index * 0.01,
                                type: "spring",
                                stiffness: 200
                              }}
                              className="relative group"
                            >
                            <motion.div
                              animate={isSelected ? {
                                scale: [1, 1.15, 1],
                                y: [0, -8, 0]
                              } : {}}
                              transition={{ duration: 0.4 }}
                            >
                              <Avatar 
                                className={`h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20 mx-auto border-2 transition-all duration-300 ${
                                  isSelected
                                    ? 'border-primary shadow-xl shadow-primary/50 ring-2 sm:ring-4 ring-primary/40 brightness-110'
                                    : 'border-border/20 group-hover:border-primary/30'
                                }`}
                              >
                                <AvatarImage src={sim.avatar} alt={sim.name} />
                                <AvatarFallback className="text-xs sm:text-sm md:text-base lg:text-lg font-bold">{sim.name[0]}</AvatarFallback>
                              </Avatar>
                            </motion.div>
                            
                            <div className="text-center mt-1 px-0.5">
                              <p className={`text-[9px] sm:text-[10px] md:text-xs font-medium truncate transition-all leading-tight ${
                                isSelected ? 'text-primary font-bold' : 'text-muted-foreground'
                              }`}>
                                {sim.name.split(" ").slice(0, 2).join(" ")}
                              </p>
                            </div>
                            
                            {/* Animated glow effect for selected */}
                            {isSelected && (
                              <motion.div
                                className="absolute inset-0 rounded-full bg-primary/20 blur-xl -z-10"
                                animate={{ 
                                  scale: [1, 1.5, 1],
                                  opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                            )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    <motion.div
                      className="text-center space-y-1 px-4 flex-shrink-0 pb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.div 
                        className="flex items-center justify-center gap-1.5 md:gap-2"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <MessageCircle className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs md:text-sm font-medium text-primary">
                          Preparing an epic philosophical showdown
                        </span>
                        <MessageCircle className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question Card - Compact */}
            {!isSelecting && question && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Today&apos;s Question
                    </h3>
                  </div>
                  <p className="text-xl font-bold text-center">{question}</p>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Debaters - Compact Side by Side */}
          {!isSelecting && selectedSims[0] && selectedSims[1] && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4">
              {selectedSims.map(
                (sim) =>
                  sim && (
                    <Card key={sim.id} className="p-4 text-center">
                      <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-primary/20">
                        <AvatarImage src={sim.avatar} alt={sim.name} />
                        <AvatarFallback className="text-lg">{sim.name[0]}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-lg font-bold mb-1">{sim.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{sim.description}</p>
                    </Card>
                  ),
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Scrollable Chat Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="space-y-3">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/30 flex-shrink-0">
                        <AvatarImage src={message.simAvatar} alt={message.simName} />
                        <AvatarFallback>{message.simName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm">{message.simName}</h4>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-base md:text-lg text-foreground leading-relaxed font-medium">{message.content}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {typingIndicator && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card className="p-4 bg-muted/50">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/30 flex-shrink-0">
                        <AvatarImage
                          src={selectedSims.find((s) => s?.name === typingIndicator)?.avatar}
                          alt={typingIndicator}
                        />
                        <AvatarFallback>{typingIndicator[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm">{typingIndicator}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground italic">is typing...</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <SimpleFooter />
    </div>
  );
};

export default LiveChat;
