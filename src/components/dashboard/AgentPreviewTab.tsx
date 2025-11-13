import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type AgentPreviewTabProps = {
  store: any;
};

type Message = {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
};

export const AgentPreviewTab = ({ store }: AgentPreviewTabProps) => {
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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: "Thanks for your message! This is a demo preview of how your AI agent will interact with customers. Configure your agent's personality and knowledge in the Agent settings.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMessage]);
      setIsLoading(false);
    }, 1000);
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
                className="h-16 w-16 rounded-full border-2 border-primary object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                <Bot className="h-8 w-8 text-primary" />
              </div>
            )}
            <div className="flex-1">
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
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Live Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
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
            <p className="text-xs text-muted-foreground mt-2">
              This is a demo preview. Real conversations will use your configured AI settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
