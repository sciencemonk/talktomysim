import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import TopNavigation from "@/components/TopNavigation";
import SimpleFooter from "@/components/SimpleFooter";
import { AgentType } from "@/types/agent";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Sparkles, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  simName: string;
  simAvatar?: string;
  content: string;
  timestamp: Date;
}

const DEBATE_DURATION = 5 * 60 * 1000; // 5 minutes

const philosophicalQuestions = [
  "Is free will real or an illusion?",
  "What is the nature of consciousness?",
  "Does objective morality exist?",
  "What is the meaning of life?",
  "Is knowledge more valuable than wisdom?",
  "Can we ever truly know reality?",
  "What is the relationship between mind and body?",
  "Is happiness the ultimate goal of human life?",
  "Do we have moral obligations to future generations?",
  "What is the nature of time?",
  "Is truth absolute or relative?",
  "What makes an action right or wrong?",
  "Can artificial intelligence truly think?",
  "What is the self?",
  "Is death necessary for life to have meaning?"
];

const LiveChat = () => {
  const [selectedSims, setSelectedSims] = useState<[AgentType | null, AgentType | null]>([null, null]);
  const [question, setQuestion] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSelecting, setIsSelecting] = useState(true);
  const [isDebating, setIsDebating] = useState(false);
  const [allHistoricalSims, setAllHistoricalSims] = useState<AgentType[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(DEBATE_DURATION);
  const debateStartTimeRef = useRef<number>(0);
  const conversationIndexRef = useRef(0);

  // Fetch historical sims on mount
  useEffect(() => {
    const fetchSims = async () => {
      console.log('Fetching sims for live chat...');
      
      // First try to get historical sims
      const { data: historicalData, error: historicalError } = await supabase
        .from('advisors')
        .select('*')
        .eq('is_public', true)
        .eq('sim_type', 'historical')
        .order('created_at', { ascending: false });

      console.log('Historical sims query result:', historicalData?.length || 0);

      // If we don't have enough historical sims, fall back to all public advisors
      let finalData = historicalData;
      if (!historicalData || historicalData.length < 2) {
        console.log('Not enough historical sims, fetching all public advisors...');
        const { data: allData, error: allError } = await supabase
          .from('advisors')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(10);
        
        finalData = allData;
        console.log('All public advisors:', allData?.length || 0);
      }

      if (finalData && finalData.length >= 2) {
        const transformedSims = finalData.map((advisor: any) => ({
          id: advisor.id,
          name: advisor.name,
          description: advisor.description || advisor.title || '',
          type: 'General Tutor' as any,
          status: 'active' as any,
          createdAt: advisor.created_at,
          updatedAt: advisor.updated_at,
          avatar: advisor.avatar_url,
          prompt: advisor.prompt,
        } as AgentType));
        
        setAllHistoricalSims(transformedSims);
        console.log('Loaded sims for debate:', transformedSims.length);
      } else {
        console.error('Not enough sims available for debate');
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

      if (remaining === 0) {
        resetDebate();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isDebating]);

  const selectRandomSims = () => {
    console.log('selectRandomSims called, available sims:', allHistoricalSims.length);
    
    if (allHistoricalSims.length < 2) {
      console.error('Not enough sims to select');
      setIsSelecting(false);
      return;
    }

    setIsSelecting(true);
    setMessages([]);
    
    // Use deterministic selection based on current time (5-minute intervals)
    // This ensures all viewers see the same debate at the same time
    const intervalStart = Math.floor(Date.now() / DEBATE_DURATION) * DEBATE_DURATION;
    const seed = intervalStart;
    
    // Deterministic pseudo-random selection using time-based seed
    const index1 = seed % allHistoricalSims.length;
    const index2 = (seed + 1) % allHistoricalSims.length;
    
    const sim1 = allHistoricalSims[index1];
    const sim2 = allHistoricalSims[index2 === index1 ? (index2 + 1) % allHistoricalSims.length : index2];
    
    console.log('Selected sims:', sim1.name, 'vs', sim2.name);
    
    // Deterministic question selection
    const questionIndex = Math.floor(seed / DEBATE_DURATION) % philosophicalQuestions.length;
    const selectedQuestion = philosophicalQuestions[questionIndex];
    
    console.log('Selected question:', selectedQuestion);
    
    // Animate selection
    setTimeout(() => {
      setSelectedSims([sim1, sim2]);
      setQuestion(selectedQuestion);
      setIsSelecting(false);
      startDebate(sim1, sim2, selectedQuestion);
    }, 3000);
  };

  const startDebate = async (sim1: AgentType, sim2: AgentType, question: string) => {
    console.log('Starting debate between', sim1.name, 'and', sim2.name);
    setIsDebating(true);
    debateStartTimeRef.current = Date.now();
    conversationIndexRef.current = 0;

    // Initial opening statements
    console.log('Generating first response...');
    await generateResponse(sim1, question, [], true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Generating second response...');
    await generateResponse(sim2, question, [], false);

    // Continue conversation
    continueDebate(sim1, sim2, question);
  };

  const continueDebate = async (sim1: AgentType, sim2: AgentType, question: string) => {
    const maxExchanges = 12; // 6 exchanges each over 5 minutes
    
    for (let i = 0; i < maxExchanges; i++) {
      if (Date.now() - debateStartTimeRef.current >= DEBATE_DURATION) break;
      
      const currentSim = i % 2 === 0 ? sim1 : sim2;
      const isFirstSim = i % 2 === 0;
      
      await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds between responses
      
      await generateResponse(currentSim, question, [], isFirstSim);
    }
  };

  const generateResponse = async (sim: AgentType, question: string, previousMessages: Message[], isFirstSim: boolean) => {
    try {
      const context = previousMessages.slice(-4).map(m => `${m.simName}: ${m.content}`).join('\n');
      
      const prompt = conversationIndexRef.current === 0 
        ? `You are ${sim.name}. The question is: "${question}". Provide your initial perspective in 2-3 sentences. Be thoughtful and true to your historical character.`
        : `You are ${sim.name}. The debate topic is: "${question}". 
        
Previous discussion:
${context}

Respond to the latest point made. Build on the conversation, agree or disagree, and add new insights. Keep it to 2-3 sentences. Be engaging and philosophical.`;

      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: [{ role: 'user', content: prompt }],
          agent: { prompt: sim.prompt || '' }
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Received response:', data);

      const newMessage: Message = {
        id: `${sim.id}-${Date.now()}`,
        simName: sim.name,
        simAvatar: sim.avatar,
        content: data?.content || '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      conversationIndexRef.current++;
    } catch (error) {
      console.error('Error generating response:', error);
    }
  };

  const resetDebate = () => {
    setIsDebating(false);
    setMessages([]);
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
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavigation />
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Live Philosophical Debate
          </h1>
          <p className="text-muted-foreground">Watch historical figures discuss life's biggest questions</p>
        </div>

        {/* Timer */}
        {isDebating && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-full">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="font-mono text-2xl font-bold">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        )}

        {/* Selection Animation */}
        <AnimatePresence mode="wait">
          {isSelecting && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
              <h2 className="text-2xl font-semibold mb-2">Selecting Debaters...</h2>
              <p className="text-muted-foreground">Finding the perfect minds for today's debate</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Debaters and Question */}
        {!isSelecting && selectedSims[0] && selectedSims[1] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Today's Question
                </h3>
              </div>
              <p className="text-2xl font-bold text-center">{question}</p>
            </Card>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {selectedSims.map((sim, idx) => sim && (
                <motion.div
                  key={sim.id}
                  initial={{ opacity: 0, x: idx === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/20">
                      <AvatarImage src={sim.avatar} alt={sim.name} />
                      <AvatarFallback className="text-2xl">{sim.name[0]}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold mb-2">{sim.name}</h3>
                    <p className="text-sm text-muted-foreground">{sim.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Debate Messages */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          <AnimatePresence>
            {messages.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/30">
                      <AvatarImage src={message.simAvatar} alt={message.simName} />
                      <AvatarFallback>{message.simName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold">{message.simName}</h4>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-foreground leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <SimpleFooter />
    </div>
  );
};

export default LiveChat;
