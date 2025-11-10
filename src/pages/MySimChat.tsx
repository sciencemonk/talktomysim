import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { Send, Loader2, Search, MessageSquare, Mic, Image as ImageIcon, Folder, Clock, Plus, Trash2 } from "lucide-react";
import { Sim } from "@/types/sim";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = { role: "user" | "assistant"; content: string };

type Conversation = {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export default function MySimChat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sim, setSim] = useState<Sim | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
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

      // Load all conversations for history
      await loadConversations(user.id, simData.id);
    } catch (error) {
      console.error('Error loading SIM:', error);
      toast({
        title: "Error",
        description: "Failed to load your SIM",
        variant: "destructive"
      });
    }
  };

  const loadConversations = async (userId: string, simId: string) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .eq('tutor_id', simId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    setConversations(data || []);
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

  const createNewConversation = async () => {
    if (!sim) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        tutor_id: sim.id,
        is_creator_conversation: true,
        title: `New Chat - ${new Date().toLocaleDateString()}`
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return;
    }

    setConversationId(newConv.id);
    setMessages(sim.welcome_message ? [{ role: "assistant", content: sim.welcome_message }] : []);
    await loadConversations(user.id, sim.id);
  };

  const switchConversation = async (convId: string) => {
    setConversationId(convId);
    await loadConversationMessages(convId);
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', convId);

    if (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
      return;
    }

    // If we deleted the current conversation, create a new one
    if (convId === conversationId) {
      await createNewConversation();
    } else {
      // Just refresh the list
      const { data: { user } } = await supabase.auth.getUser();
      if (user && sim) {
        await loadConversations(user.id, sim.id);
      }
    }
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
    <div className="h-screen w-full flex bg-[#0D0D0D] overflow-hidden">
      {/* Sidebar */}
      <div className="w-[260px] border-r border-white/[0.08] bg-[#171717] flex flex-col p-3 flex-shrink-0">
        {/* Logo/Brand */}
        <div className="px-3 py-4 mb-2">
          <img 
            src="/sim-logo-white.png" 
            alt="SIM" 
            className="h-7 w-auto"
          />
        </div>

        {/* Agent Info */}
        <div className="flex items-center gap-3 px-3 py-3 mb-6 rounded-lg bg-white/[0.03] border border-white/[0.05]">
          <Avatar className="h-9 w-9 border border-white/10">
            <AvatarImage src={getAvatarUrl(sim.avatar_url)} alt={sim.name} />
            <AvatarFallback className="bg-white/5 text-white text-xs">{sim.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium text-white/90 truncate">{sim.name}</h2>
            <p className="text-xs text-white/40 truncate">AI Agent</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-0.5 mb-4">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-white/50 hover:bg-white/[0.06] hover:text-white/90 transition-all duration-150">
            <Search className="h-[18px] w-[18px] flex-shrink-0" />
            <span className="text-[13px] font-medium">Search</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md bg-white/[0.08] text-white/90 transition-all duration-150">
            <MessageSquare className="h-[18px] w-[18px] flex-shrink-0" />
            <span className="text-[13px] font-medium">Chat</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-white/50 hover:bg-white/[0.06] hover:text-white/90 transition-all duration-150">
            <Mic className="h-[18px] w-[18px] flex-shrink-0" />
            <span className="text-[13px] font-medium">MCP Servers</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-white/50 hover:bg-white/[0.06] hover:text-white/90 transition-all duration-150">
            <ImageIcon className="h-[18px] w-[18px] flex-shrink-0" />
            <span className="text-[13px] font-medium">Imagine</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-white/50 hover:bg-white/[0.06] hover:text-white/90 transition-all duration-150">
            <Folder className="h-[18px] w-[18px] flex-shrink-0" />
            <span className="text-[13px] font-medium">Projects</span>
          </button>
        </nav>

        {/* Chat History */}
        <div className="flex-1 flex flex-col min-h-0 border-t border-white/[0.08] pt-3">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">History</span>
            <Button
              onClick={createNewConversation}
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-white/50 hover:text-white/90 hover:bg-white/[0.06]"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="space-y-0.5 px-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group relative flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-all duration-150 ${
                    conv.id === conversationId
                      ? "bg-white/[0.08] text-white/90"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
                  onClick={() => switchConversation(conv.id)}
                >
                  <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="text-[12px] truncate flex-1">
                    {conv.title || `Chat ${new Date(conv.created_at).toLocaleDateString()}`}
                  </span>
                  <Button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 hover:bg-white/[0.06] transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0D0D0D]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-6 min-h-0">
          <div className="max-w-[42rem] mx-auto space-y-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-24">
                <Avatar className="h-16 w-16 border border-white/10 mb-5 shadow-lg">
                  <AvatarImage src={getAvatarUrl(sim.avatar_url)} alt={sim.name} />
                  <AvatarFallback className="bg-white/5 text-white text-xl">{sim.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-[26px] font-semibold text-white/95 mb-2.5 tracking-tight">Chat with {sim.name}</h2>
                <p className="text-[15px] text-white/45 max-w-md leading-relaxed">Start a conversation with your AI agent. Ask anything!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="group">
                  <div className="flex gap-4">
                    <Avatar className="h-8 w-8 flex-shrink-0 border border-white/[0.08] shadow-sm">
                      {msg.role === "assistant" ? (
                        <>
                          <AvatarImage src={getAvatarUrl(sim.avatar_url)} alt={sim.name} />
                          <AvatarFallback className="bg-white/5 text-white text-xs">{sim.name.charAt(0)}</AvatarFallback>
                        </>
                      ) : (
                        <AvatarFallback className="bg-white/[0.08] text-white/90 text-xs font-medium">U</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 max-w-[85%]">
                      <div className={`rounded-2xl px-4 py-3 ${
                        msg.role === "user" 
                          ? "bg-white/[0.09] text-white/95 border border-white/[0.08]" 
                          : "bg-transparent text-white/90"
                      }`}>
                        <p className="text-[14.5px] leading-[1.65] whitespace-pre-wrap font-normal">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-4">
                <Avatar className="h-8 w-8 flex-shrink-0 border border-white/[0.08]">
                  <AvatarImage src={getAvatarUrl(sim.avatar_url)} alt={sim.name} />
                  <AvatarFallback className="bg-white/5 text-white text-xs">{sim.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="rounded-2xl px-4 py-3 bg-transparent">
                    <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="px-6 pb-6 pt-3 flex-shrink-0 border-t border-white/[0.06]">
          <div className="max-w-[42rem] mx-auto">
            <div className="relative flex items-end gap-2 bg-[#2A2A2A] rounded-[24px] border border-white/[0.12] p-1.5 shadow-lg hover:border-white/[0.18] focus-within:border-white/[0.25] transition-all duration-200">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={`Message ${sim.name}`}
                className="resize-none bg-transparent border-0 text-white/95 placeholder:text-white/35 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[48px] max-h-[200px] px-4 py-3.5 text-[14.5px] leading-relaxed"
                rows={1}
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-full bg-white text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 h-9 w-9 flex-shrink-0 transition-all duration-200 shadow-sm"
              >
                <Send className="h-[17px] w-[17px]" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
