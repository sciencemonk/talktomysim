
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, Bot, User } from "lucide-react";
import { AgentType } from "@/types/agent";
import { useEnhancedTextChat } from "@/hooks/useEnhancedTextChat";

interface ChatInterfaceProps {
  agent: AgentType;
  onBack?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  timestamp: number;
}

const TypingIndicator = () => (
  <div className="flex space-x-1 justify-center items-center py-2">
    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
  </div>
);

const ChatInterface: React.FC<ChatInterfaceProps> = ({ agent, onBack }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show welcome message once
  useEffect(() => {
    if (!hasShownWelcome && agent) {
      const welcomeMessage = agent.welcomeMessage || `Hello! I'm ${agent.name}. How can I help you today?`;
      
      const welcomeMsg: Message = {
        id: `welcome-${Date.now()}`,
        role: 'system',
        content: welcomeMessage,
        timestamp: Date.now()
      };
      
      setMessages([welcomeMsg]);
      setHasShownWelcome(true);
    }
  }, [agent, hasShownWelcome]);

  const addUserMessage = useCallback((content: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
  }, []);

  const startAiMessage = useCallback(() => {
    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      role: 'system',
      content: '',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, aiMsg]);
    return aiMsg.id;
  }, []);

  const addAiTextDelta = useCallback((delta: string) => {
    setMessages(prev => 
      prev.map((msg, index) => 
        index === prev.length - 1 && msg.role === 'system'
          ? { ...msg, content: msg.content + delta }
          : msg
      )
    );
  }, []);

  const completeAiMessage = useCallback(() => {
    // Message is already complete, nothing to do
  }, []);

  const { sendMessage, isProcessing } = useEnhancedTextChat({
    agent,
    onUserMessage: addUserMessage,
    onAiMessageStart: startAiMessage,
    onAiTextDelta: addAiTextDelta,
    onAiMessageComplete: completeAiMessage
  });

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText?.trim() || isProcessing) return;

    await sendMessage(messageText);
    setInput('');
    inputRef.current?.focus();
  }, [isProcessing, sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isProcessing]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-border bg-card">
        <Avatar className="h-10 w-10">
          <AvatarImage src={agent.avatar} alt={agent.name} />
          <AvatarFallback>
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground truncate">{agent.name || 'Chat'}</h2>
          <p className="text-sm text-muted-foreground truncate">
            {agent.description || 'AI Assistant'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-4 space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'system' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={agent.avatar} alt={agent.name} />
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[85%] md:max-w-[70%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isProcessing && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted text-foreground rounded-lg px-4 py-3">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-card">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${agent.name}...`}
            disabled={isProcessing}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" disabled={!input.trim() || isProcessing}>
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
