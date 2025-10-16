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
  // Technology & Future
  "Is consciousness transferable to digital form?",
  "Should we create artificial life forms with rights?",
  "Will quantum computing make privacy obsolete?",
  "Can humanity survive without exploring space?",
  "Should we edit human DNA to prevent disease?",
  
  // Society & Power
  "Is tribalism inevitable in human nature?",
  "Can true equality exist without sacrificing freedom?",
  "Should nations dissolve into global governance?",
  "Is surveillance the price of modern security?",
  "Can revolution ever be bloodless?",
  
  // Mind & Reality
  "Is time travel philosophically possible?",
  "Do parallel universes change how we make choices?",
  "Can machines ever truly understand beauty?",
  "Is consciousness an illusion or the only truth?",
  "Should we trust gut instinct over data?",
  
  // Ethics & Existence
  "Is suffering necessary for meaning?",
  "Can evil exist without free will?",
  "Should we resurrect extinct species?",
  "Is immortality desirable or terrifying?",
  "Does the universe have a purpose?",
  
  // Culture & Identity
  "Is cultural appropriation theft or evolution?",
  "Can art be truly objective or always subjective?",
  "Should we preserve dying languages?",
  "Is authenticity possible in the digital age?",
  "Does technology erode or enhance creativity?",
  
  // Knowledge & Truth
  "Can science answer all questions worth asking?",
  "Is ignorance sometimes better than knowledge?",
  "Should we pursue dangerous knowledge?",
  "Can history be objective or always biased?",
  "Is mathematics discovered or invented?",
  
  // Economics & Resources
  "Should water be privatized or a human right?",
  "Can growth-based economies survive climate limits?",
  "Is automation liberating or economically catastrophic?",
  "Should inheritance be abolished?",
  "Can currency exist without government?",
  
  // Relationships & Love
  "Is monogamy natural or socially constructed?",
  "Can robots provide genuine companionship?",
  "Should we engineer better emotional bonds?",
  "Is romantic love rational or purely chemical?",
  "Can friendship be deeper than family?",
  
  // Power & Justice
  "Is redemption possible for all crimes?",
  "Should we punish potential future crimes?",
  "Can the powerful ever truly be held accountable?",
  "Is forgiveness weakness or strength?",
  "Should vigilante justice ever be tolerated?",
  
  // Wild Cards
  "Would first contact with aliens unite or divide us?",
  "Is humor a universal language?",
  "Should we simulate reality if we can?",
  "Can art save the world?",
  "Is boredom the greatest human threat?",
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
  const [currentQueueId, setCurrentQueueId] = useState<string | null>(null);

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

    const interval = setInterval(async () => {
      const elapsed = Date.now() - debateStartTimeRef.current;
      const remaining = Math.max(0, DEBATE_DURATION - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        
        // Mark current debate as completed if it was from queue
        if (currentQueueId) {
          await supabase
            .from("debate_queue")
            .update({ 
              status: "completed",
              completed_at: new Date().toISOString()
            })
            .eq("id", currentQueueId);
        }
        
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isDebating, currentQueueId]);

  const selectRandomSims = async () => {
    console.log("selectRandomSims called, available sims:", allHistoricalSims.length);

    if (allHistoricalSims.length < 2) {
      console.error("Not enough sims to select");
      setIsSelecting(false);
      return;
    }

    setIsSelecting(true);
    setMessages([]);

    // Check for user-generated debates in queue first
    const { data: queuedDebate, error: queueError } = await supabase
      .from("debate_queue")
      .select(`
        id,
        topic,
        voter_name,
        sim1_id,
        sim2_id,
        advisors!debate_queue_sim1_id_fkey (
          id,
          name,
          avatar_url,
          description,
          prompt
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    let sim1: AgentType;
    let sim2: AgentType;
    let selectedQuestion: string;

    if (!queueError && queuedDebate) {
      // Use queued debate
      console.log("Using queued debate:", queuedDebate.id);
      setCurrentQueueId(queuedDebate.id);
      
      // Mark as in progress
      await supabase
        .from("debate_queue")
        .update({ 
          status: "in_progress",
          started_at: new Date().toISOString()
        })
        .eq("id", queuedDebate.id);

      // Fetch both sims
      const { data: sim2Data } = await supabase
        .from("advisors")
        .select("*")
        .eq("id", queuedDebate.sim2_id)
        .single();

      const advisorData = queuedDebate.advisors as any;
      
      sim1 = {
        id: advisorData.id,
        name: advisorData.name,
        description: advisorData.description || "",
        type: "General Tutor" as any,
        status: "active" as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatar: advisorData.avatar_url,
        prompt: advisorData.prompt,
      };

      sim2 = {
        id: sim2Data.id,
        name: sim2Data.name,
        description: sim2Data.description || "",
        type: "General Tutor" as any,
        status: "active" as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatar: sim2Data.avatar_url,
        prompt: sim2Data.prompt,
      };

      selectedQuestion = queuedDebate.topic;
      
      if (queuedDebate.voter_name) {
        selectedQuestion = `${selectedQuestion} (suggested by ${queuedDebate.voter_name})`;
      }
    } else {
      // Fall back to random selection
      console.log("No queued debates, using random selection");
      setCurrentQueueId(null);
      
      sim1 = allHistoricalSims[selector1Index];
      sim2 = allHistoricalSims[selector2Index];
      selectedQuestion = philosophicalQuestions[Math.floor(Math.random() * philosophicalQuestions.length)];
    }

    console.log("Selected sims:", sim1.name, "vs", sim2.name);
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
      
      // Get last 4-6 messages for context
      const recentMessages = allMessages.slice(-6);
      const conversationHistory = recentMessages
        .map(msg => `${msg.simName}: "${msg.content}"`)
        .join("\n");

      const prompt = isFirstMessage
        ? `You are ${sim.name} in a live philosophical debate. The question is: "${question}". 

Give a short, punchy opening. This is LIVE entertainment - viewers are WATCHING, not reading an essay. 1-2 sentences MAX. Make every word count.`
        : `You are ${sim.name} in a live philosophical debate about: "${question}". 

Recent conversation:
${conversationHistory}

${otherDebater} just said: "${lastMessage?.content}"

DIRECTLY respond to what ${otherDebater} just said. Challenge their specific point, agree and build on it, or pivot the argument. Make it feel like a real back-and-forth conversation. 

Keep it SHORT - 1-2 sentences max. This is LIVE TV. Jump straight to your response - no "Ah, ${otherDebater}" or formalities.`;

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

  const resetDebate = async () => {
    // Mark current debate as completed if it was from queue
    if (currentQueueId) {
      await supabase
        .from("debate_queue")
        .update({ 
          status: "completed",
          completed_at: new Date().toISOString()
        })
        .eq("id", currentQueueId);
    }
    
    // Generate new debate ID to invalidate any pending message operations
    currentDebateIdRef.current = Date.now().toString();
    
    setIsDebating(false);
    setMessages([]);
    setTypingIndicator(null);
    setTimeRemaining(DEBATE_DURATION);
    setCurrentQueueId(null);
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
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-6xl">
          {/* Timer and Question - Compact */}
          <div className="mb-3 sm:mb-4 space-y-3">
            {isDebating && (
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-card border border-border rounded-full">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse flex-shrink-0" />
                  <span className="font-mono text-sm sm:text-base md:text-lg font-bold whitespace-nowrap">{formatTime(timeRemaining)} until next topic</span>
                  <button
                    onClick={() => window.location.reload()}
                    className="ml-1 sm:ml-2 p-1 sm:p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors flex-shrink-0"
                    aria-label="Refresh debate"
                  >
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
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

            {/* Question Card with Debaters on Either Side */}
            {!isSelecting && question && selectedSims[0] && selectedSims[1] && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="p-3 sm:p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  {/* Mobile Layout: Stacked */}
                  <div className="md:hidden space-y-3">
                    {/* Question First on Mobile */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <MessageCircle className="h-3 w-3 text-primary flex-shrink-0" />
                        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Today&apos;s Question
                        </h3>
                      </div>
                      <p className="text-base font-bold leading-tight">{question}</p>
                    </div>
                    
                    {/* Debaters Below on Mobile */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 border-2 border-primary/20 flex-shrink-0">
                          <AvatarImage src={selectedSims[0].avatar} alt={selectedSims[0].name} />
                          <AvatarFallback className="text-sm">{selectedSims[0].name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="text-left min-w-0">
                          <h3 className="text-xs font-bold truncate">{selectedSims[0].name}</h3>
                          <p className="text-[10px] text-muted-foreground truncate">{selectedSims[0].description.split(',')[0]}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <div className="text-right min-w-0">
                          <h3 className="text-xs font-bold truncate">{selectedSims[1].name}</h3>
                          <p className="text-[10px] text-muted-foreground truncate">{selectedSims[1].description.split(',')[0]}</p>
                        </div>
                        <Avatar className="h-10 w-10 border-2 border-primary/20 flex-shrink-0">
                          <AvatarImage src={selectedSims[1].avatar} alt={selectedSims[1].name} />
                          <AvatarFallback className="text-sm">{selectedSims[1].name[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop Layout: Original Horizontal */}
                  <div className="hidden md:flex items-center justify-between gap-4">
                    {/* Left Debater */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Avatar className="h-12 w-12 md:h-14 md:w-14 border-2 border-primary/20">
                        <AvatarImage src={selectedSims[0].avatar} alt={selectedSims[0].name} />
                        <AvatarFallback className="text-lg">{selectedSims[0].name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <h3 className="text-sm md:text-base font-bold">{selectedSims[0].name}</h3>
                        <p className="text-xs text-muted-foreground">{selectedSims[0].description.split(',')[0]}</p>
                      </div>
                    </div>

                    {/* Question in Center */}
                    <div className="flex-1 text-center px-4">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Today&apos;s Question
                        </h3>
                      </div>
                      <p className="text-lg md:text-xl font-bold">{question}</p>
                    </div>

                    {/* Right Debater */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <h3 className="text-sm md:text-base font-bold">{selectedSims[1].name}</h3>
                        <p className="text-xs text-muted-foreground">{selectedSims[1].description.split(',')[0]}</p>
                      </div>
                      <Avatar className="h-12 w-12 md:h-14 md:w-14 border-2 border-primary/20">
                        <AvatarImage src={selectedSims[1].avatar} alt={selectedSims[1].name} />
                        <AvatarFallback className="text-lg">{selectedSims[1].name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Chat Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-6xl">
          <div className="space-y-2 sm:space-y-3">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-primary/30 flex-shrink-0">
                        <AvatarImage src={message.simAvatar} alt={message.simName} />
                        <AvatarFallback className="text-xs sm:text-sm">{message.simName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                          <h4 className="font-bold text-xs sm:text-sm truncate">{message.simName}</h4>
                          <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base md:text-lg text-foreground leading-relaxed font-medium">{message.content}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {typingIndicator && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card className="p-3 sm:p-4 bg-muted/50">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-primary/30 flex-shrink-0">
                        <AvatarImage
                          src={selectedSims.find((s) => s?.name === typingIndicator)?.avatar}
                          alt={typingIndicator}
                        />
                        <AvatarFallback className="text-xs sm:text-sm">{typingIndicator[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-xs sm:text-sm truncate">{typingIndicator}</h4>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground italic">is typing...</p>
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
