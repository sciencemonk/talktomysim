import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Send, X, Bot, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type LandingPageChatProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export const LandingPageChat = ({ isOpen, onToggle }: LandingPageChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm the SIM AI assistant. I can help you learn about our platform and how AI agents can help you. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSendMessage = async () => {
    if (!input.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are the SIM AI platform assistant. Your role is to help visitors understand the platform and encourage them to sign up.

Platform Information:
- SIM is a platform for creating personalized AI agents
- Unlike ChatGPT (one-size-fits-all), SIM creates AI that is uniquely yours
- Users can create personal assistants, financial advisors, or trusted friends
- Users can connect their crypto wallet for personalized financial advice
- The AI learns user preferences, context, and goals
- AI agents can be customized with specific personality, knowledge, and capabilities

Key Benefits:
- Personalized AI that truly understands you
- Crypto-connected for financial insights
- Customizable knowledge base and personality
- Not generic - learns your specific needs

Call to Action:
- Encourage visitors to "Get Started Free" 
- Emphasize how easy it is to create their first AI agent
- Highlight the free tier to get started

Keep responses friendly, concise, and helpful. Always encourage sign-up when appropriate.`
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: input.trim()
            }
          ]
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Toggle Button - Only visible when closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 group">
          <button
            onClick={onToggle}
            className="shadow-lg rounded-full h-14 w-14 p-0 overflow-hidden border-2 border-primary transition-transform duration-200 hover:scale-110 bg-primary"
          >
            <div className="h-full w-full bg-primary flex items-center justify-center text-primary-foreground">
              <Bot className="h-7 w-7" />
            </div>
          </button>
          
          {/* Badge - Only visible when closed */}
          <div className="absolute -top-10 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
            Chat with SIM AI
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-50 bg-background border-border transition-all duration-300 flex flex-col overflow-hidden
          lg:top-0 lg:right-0 lg:h-full lg:border-l
          max-lg:bottom-0 max-lg:left-0 max-lg:right-0 max-lg:border-t
          ${isOpen ? 'lg:w-96 max-lg:h-96' : 'w-0 h-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/lovable-uploads/55ccce33-98a1-45d2-9e9e-7b446a02a417.png" alt="SIM AI" />
            <AvatarFallback>
              <Bot className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">SIM AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Ask me anything about the platform</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src="/lovable-uploads/55ccce33-98a1-45d2-9e9e-7b446a02a417.png" alt="SIM AI" />
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src="/lovable-uploads/55ccce33-98a1-45d2-9e9e-7b446a02a417.png" alt="SIM AI" />
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-3 bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about the platform..."
              disabled={isSending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isSending}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
