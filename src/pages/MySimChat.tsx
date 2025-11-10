import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { Send, Loader2, Search, MessageSquare, Mic, Image as ImageIcon, Folder, Clock } from "lucide-react";
import { Sim } from "@/types/sim";

type Message = { role: "user" | "assistant"; content: string };

export default function MySimChat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sim, setSim] = useState<Sim | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserSim();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadUserSim = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      // Try to get from sims table first
      let { data: simData } = await supabase
        .from('sims')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If not found, try advisors table
      if (!simData) {
        const { data: advisorData } = await supabase
          .from('advisors')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (advisorData) {
          // Convert advisor to sim format with proper type casting
          simData = {
            id: advisorData.id,
            user_id: advisorData.user_id,
            name: advisorData.name,
            description: advisorData.auto_description || advisorData.description,
            prompt: advisorData.prompt,
            welcome_message: advisorData.welcome_message,
            x_username: (advisorData.social_links as any)?.x_username || 'unknown',
            x_display_name: (advisorData.social_links as any)?.x_display_name || advisorData.name,
            twitter_url: advisorData.twitter_url || '',
            avatar_url: advisorData.avatar_url,
            crypto_wallet: advisorData.crypto_wallet || '',
            is_verified: advisorData.is_verified || false,
            verification_status: advisorData.verification_status || false,
            verified_at: advisorData.verified_at,
            edit_code: '',
            custom_url: advisorData.custom_url,
            is_active: true,
            is_public: true,
            integrations: Array.isArray(advisorData.integrations) ? advisorData.integrations as string[] : [],
            social_links: advisorData.social_links as Sim['social_links'],
            training_completed: false,
            training_post_count: 0,
            created_at: advisorData.created_at,
            updated_at: advisorData.updated_at,
          };
        }
      }

      if (!simData) {
        toast({
          title: "No SIM found",
          description: "Please create a SIM first",
          variant: "destructive"
        });
        navigate('/agents');
        return;
      }

      // Ensure proper types before setting state
      const typedSim: Sim = {
        ...simData,
        integrations: Array.isArray(simData.integrations) ? simData.integrations as string[] : [],
        social_links: simData.social_links as Sim['social_links']
      };

      setSim(typedSim);

      // Load or create conversation
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('tutor_id', simData.id)
        .eq('is_creator_conversation', true)
        .single();

      if (existingConv) {
        setConversationId(existingConv.id);
        await loadConversationMessages(existingConv.id);
      } else {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            tutor_id: simData.id,
            is_creator_conversation: true,
            title: `Chat with ${simData.name}`
          })
          .select()
          .single();

        if (error) throw error;
        setConversationId(newConv.id);
        
        // Add welcome message
        if (simData.welcome_message) {
          setMessages([{ role: "assistant", content: simData.welcome_message }]);
        }
      }
    } catch (error) {
      console.error('Error loading SIM:', error);
      toast({
        title: "Error",
        description: "Failed to load your SIM",
        variant: "destructive"
      });
    }
  };

  const loadConversationMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    const formattedMessages = data.map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content
    }));
    setMessages(formattedMessages);
  };

  const sendMessage = async () => {
    if (!input.trim() || !sim || !conversationId) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Save user message
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: userMessage.content
    });

    let assistantContent = "";
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sim-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          simId: sim.id,
          userId: user?.id
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to start stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save assistant message
      if (assistantContent) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: assistantContent
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!sim) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-[#0A0A0A] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 bg-[#0A0A0A] flex flex-col p-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <Avatar className="h-10 w-10 border border-white/20">
            <AvatarImage src={getAvatarUrl(sim.avatar_url)} alt={sim.name} />
            <AvatarFallback className="bg-white/5 text-white">{sim.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">{sim.name}</h2>
            <p className="text-xs text-white/50 truncate">Your AI Agent</p>
          </div>
        </div>

        <nav className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors">
            <Search className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">Search</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 text-white transition-colors">
            <MessageSquare className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">Chat</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors">
            <Mic className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">Voice</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors">
            <ImageIcon className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">Imagine</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors">
            <Folder className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">Projects</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors">
            <Clock className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">History</span>
          </button>
        </nav>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Avatar className="h-20 w-20 border-2 border-white/20 mb-4">
                  <AvatarImage src={getAvatarUrl(sim.avatar_url)} alt={sim.name} />
                  <AvatarFallback className="bg-white/5 text-white text-2xl">{sim.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold text-white mb-2">Chat with {sim.name}</h2>
                <p className="text-white/60 max-w-md">Start a conversation with your AI agent. Ask anything!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className="h-8 w-8 flex-shrink-0 border border-white/10">
                    {msg.role === "assistant" ? (
                      <>
                        <AvatarImage src={getAvatarUrl(sim.avatar_url)} alt={sim.name} />
                        <AvatarFallback className="bg-white/5 text-white">{sim.name.charAt(0)}</AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback className="bg-white/10 text-white">U</AvatarFallback>
                    )}
                  </Avatar>
                  <div className={`flex-1 max-w-[80%] ${msg.role === "user" ? "flex justify-end" : ""}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user" 
                        ? "bg-white/10 text-white" 
                        : "bg-transparent text-white"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-4">
                <Avatar className="h-8 w-8 flex-shrink-0 border border-white/10">
                  <AvatarImage src={getAvatarUrl(sim.avatar_url)} alt={sim.name} />
                  <AvatarFallback className="bg-white/5 text-white">{sim.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="rounded-2xl px-4 py-3 bg-transparent">
                    <Loader2 className="h-4 w-4 animate-spin text-white/60" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-white/5 rounded-3xl border border-white/10 p-2 focus-within:border-white/20 transition-colors">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={`How can ${sim.name} help?`}
                className="resize-none bg-transparent border-0 text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[44px] max-h-[200px]"
                rows={1}
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-full bg-white text-black hover:bg-white/90 h-10 w-10 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
