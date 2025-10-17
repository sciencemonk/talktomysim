import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { conversationService } from '@/services/conversationService';
import { useToast } from '@/hooks/use-toast';
import { getAvatarUrl } from '@/lib/avatarUtils';

interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  created_at: string;
}

export const FloatingChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [advisor, setAdvisor] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadUserAdvisor();
    }
  }, [user]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const loadUserAdvisor = async () => {
    try {
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error) throw error;
      setAdvisor(data);
    } catch (error) {
      console.error('Error loading advisor:', error);
    }
  };

  const loadConversation = async () => {
    if (!advisor) return;

    try {
      const conversation = await conversationService.getOrCreateConversation(advisor.id);
      if (conversation) {
        setConversationId(conversation.id);
        const msgs = await conversationService.getMessages(conversation.id);
        setMessages(msgs);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  useEffect(() => {
    if (isOpen && advisor && !conversationId) {
      loadConversation();
    }
  }, [isOpen, advisor]);

  const sendMessage = async () => {
    if (!input.trim() || !conversationId || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const newMessage = await conversationService.addMessage(conversationId, 'user', userMessage);
      if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
      }

      const { data, error } = await supabase.functions.invoke('enhanced-chat', {
        body: {
          messages: messages.map(m => ({ role: m.role, content: m.content })).concat([{ role: 'user', content: userMessage }]),
          agent: {
            id: advisor.id,
            name: advisor.name,
            description: advisor.description || '',
            type: advisor.category || 'advisor',
            subject: advisor.title || '',
            prompt: advisor.prompt
          },
          userId: user?.id
        }
      });

      if (error) throw error;

      if (data.content) {
        const assistantMessage = await conversationService.addMessage(conversationId, 'system', data.content);
        if (assistantMessage) {
          setMessages(prev => [...prev, assistantMessage]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !advisor) return null;

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 p-0 overflow-hidden"
          size="icon"
        >
          {advisor?.avatar_url ? (
            <img 
              src={advisor.avatar_url} 
              alt={advisor.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-background border rounded-lg shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
               <Avatar className="h-10 w-10">
                <AvatarImage src={getAvatarUrl(advisor.avatar_url)} />
                <AvatarFallback>{advisor.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">{advisor.name}</h3>
                <p className="text-xs text-muted-foreground">Your AI Assistant</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Start a conversation with {advisor.name}
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
