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
  const [typingIndicator, setTypingIndicator] = useState<string | null>(null);
  const debateStartTimeRef = useRef<number>(0);
  const conversationIndexRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch verified historical sims for debate
  useEffect(() => {
    const fetchSims = async () => {
      console.log('Fetching verified historical sims for live chat...');
      
      const { data: historicalSims, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('is_verified', true)
        .eq('sim_type', 'historical')
        .order('created_at', { ascending: false });

      console.log('Verified historical sims:', historicalSims?.length || 0);
      
      if (error) {
        console.error('Error fetching historical sims:', error);
        setIsSelecting(false);
        return;
      }

      if (historicalSims && historicalSims.length >= 2) {
        const transformedSims = historicalSims.map((advisor: any) => ({
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
        console.log('Loaded historical sims for debate:', transformedSims.map(s => s.name).join(', '));
      } else {
        console.error('Not enough historical sims for debate. Need at least 2, found:', historicalSims?.length || 0);
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

    const debateMessages: Message[] = [];

    // Initial opening statements
    console.log('Generating first response...');
    setTypingIndicator(sim1.name);
    const firstResponse = await generateResponse(sim1, question, [], debateMessages);
    setTypingIndicator(null);
    if (!firstResponse) return;
    debateMessages.push(firstResponse);
    
    await new Promise(resolve => setTimeout(resolve, 9000)); // Give time to read
    
    console.log('Generating second response...');
    setTypingIndicator(sim2.name);
    const secondResponse = await generateResponse(sim2, question, debateMessages, debateMessages);
    setTypingIndicator(null);
    if (!secondResponse) return;
    debateMessages.push(secondResponse);

    // Continue conversation
    continueDebate(sim1, sim2, question, debateMessages);
  };

  const continueDebate = async (sim1: AgentType, sim2: AgentType, question: string, debateMessages: Message[]) => {
    const maxExchanges = 10;
    
    for (let i = 0; i < maxExchanges; i++) {
      if (Date.now() - debateStartTimeRef.current >= DEBATE_DURATION) break;
      
      const currentSim = i % 2 === 0 ? sim1 : sim2;
      
      await new Promise(resolve => setTimeout(resolve, 9000)); // Wait for reading time
      
      setTypingIndicator(currentSim.name);
      const newResponse = await generateResponse(currentSim, question, debateMessages, debateMessages);
      setTypingIndicator(null);
      
      if (newResponse) {
        debateMessages.push(newResponse);
      }
    }
  };

  const generateResponse = async (sim: AgentType, question: string, previousMessages: Message[], allMessages: Message[]): Promise<Message | null> => {
    try {
      const isFirstMessage = previousMessages.length === 0;
      const lastMessage = previousMessages[previousMessages.length - 1];
      const otherDebater = lastMessage ? lastMessage.simName : '';
      
      const prompt = isFirstMessage
        ? `You are ${sim.name} in a live philosophical debate. The question is: "${question}". 

Provide a compelling opening statement that represents your unique perspective and philosophy. Stay true to your historical character and beliefs. Be thoughtful, direct, and engaging. 2-3 sentences.`
        : `You are ${sim.name} in a live philosophical debate about: "${question}". 

${otherDebater} just argued:
"${lastMessage?.content}"

Respond DIRECTLY to ${otherDebater}'s specific point. You must:
- Address what they just said explicitly
- Either challenge their reasoning or build upon it from your perspective
- Bring in your own philosophical framework or historical experience
- Make it a real back-and-forth conversation

Stay in character. Be conversational and engaging. 2-3 sentences maximum.`;

      console.log('Sending debate prompt for', sim.name);

      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: [{ role: 'user', content: prompt }],
          agent: { 
            prompt: sim.prompt || '', 
            name: sim.name 
          }
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        return null;
      }

      console.log('Received response for', sim.name, ':', data?.content?.substring(0, 100));

      const newMessage: Message = {
        id: `${sim.id}-${Date.now()}`,
        simName: sim.name,
        simAvatar: sim.avatar,
        content: data?.content || '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      conversationIndexRef.current++;
      
      return newMessage;
    } catch (error) {
      console.error('Error generating response:', error);
      return null;
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
                  className="flex flex-col items-center justify-center py-12"
                >
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <h2 className="text-xl font-semibold mb-1">Selecting Debaters...</h2>
                  <p className="text-sm text-muted-foreground">Finding the perfect minds for today&apos;s debate</p>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-4"
            >
              {selectedSims.map((sim) => sim && (
                <Card key={sim.id} className="p-4 text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-primary/20">
                    <AvatarImage src={sim.avatar} alt={sim.name} />
                    <AvatarFallback className="text-lg">{sim.name[0]}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-bold mb-1">{sim.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{sim.description}</p>
                </Card>
              ))}
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
                        <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {typingIndicator && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="p-4 bg-muted/50">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/30 flex-shrink-0">
                        <AvatarImage 
                          src={selectedSims.find(s => s?.name === typingIndicator)?.avatar} 
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
