import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Sparkles, Edit } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentEditModal } from "./AgentEditModal";
import { toast } from "sonner";

type AgentPreviewTabProps = {
  store: any;
  onUpdate: () => void;
};

type Message = {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
};

export const AgentPreviewTab = ({ store, onUpdate }: AgentPreviewTabProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'agent',
      content: store?.greeting_message || 'Hello! How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !store?.id) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare conversation history for AI
      const chatMessages = [...messages, userMessage].map(msg => ({
        role: msg.role === 'agent' ? 'assistant' : msg.role,
        content: msg.content
      }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/store-agent-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: chatMessages,
            storeId: store.id
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Create placeholder for streaming message
      const agentMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: agentMessageId,
        role: 'agent',
        content: '',
        timestamp: new Date()
      }]);

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                fullContent += content;
                setMessages(prev => prev.map(msg => 
                  msg.id === agentMessageId 
                    ? { ...msg, content: fullContent }
                    : msg
                ));
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setIsLoading(false);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          AI Agent Preview
        </h2>
        <p className="text-muted-foreground">
          Test and preview how your AI agent interacts with customers
        </p>
      </div>

      {/* Agent Info Card */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {store?.avatar_url ? (
              <img
                src={store.avatar_url}
                alt="Agent Avatar"
                className="h-16 w-16 rounded-full border-2 border-primary object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary flex-shrink-0">
                <Bot className="h-8 w-8 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1">{store?.store_name || 'My Store'} AI</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {store?.store_description || 'Your AI sales assistant'}
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="text-xs px-2 py-1 rounded-full bg-background/50 border border-border">
                  <span className="text-muted-foreground">Style:</span> {store?.interaction_style || 'Friendly'}
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-background/50 border border-border">
                  <span className="text-muted-foreground">Tone:</span> {store?.response_tone || 'Professional'}
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-background/50 border border-border">
                  <span className="text-muted-foreground">Focus:</span> {store?.primary_focus || 'Customer satisfaction'}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              className="flex-shrink-0"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <AgentEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        store={store}
        onUpdate={onUpdate}
      />

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Live Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4 min-h-0" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:0.2s]" />
                      <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message to test your agent..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
              >
              <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
