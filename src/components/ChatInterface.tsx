
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Send, ArrowLeft, Loader2, Bot, User } from "lucide-react";
import { AgentType } from "@/types/agent";
import { useEnhancedTextChat } from "@/hooks/useEnhancedTextChat";
import { useSimpleMessageAccumulator } from "@/hooks/useSimpleMessageAccumulator";
import { conversationService } from "@/services/conversationService";
import { useChatHistory } from "@/hooks/useChatHistory";

interface ChatInterfaceProps {
  agent: AgentType;
  onBack?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ agent, onBack }) => {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, addUserMessage, startAiMessage, addAiTextDelta, completeAiMessage, clearMessages } = useSimpleMessageAccumulator();
  const { messages: historyMessages, loadMessages } = useChatHistory(conversation?.id || null);

  // Initialize conversation only once
  useEffect(() => {
    let isMounted = true;
    
    const initConversation = async () => {
      if (!agent?.id || isInitializing || conversation) return;
      
      setIsInitializing(true);
      try {
        console.log('Initializing conversation for agent:', agent.id);
        const conv = await conversationService.getOrCreateConversation(agent.id);
        
        if (isMounted && conv) {
          console.log('Conversation initialized:', conv.id);
          setConversation(conv);
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initConversation();
    
    return () => {
      isMounted = false;
    };
  }, [agent?.id]);

  // Load messages when conversation is set
  useEffect(() => {
    if (conversation?.id) {
      loadMessages();
    }
  }, [conversation?.id, loadMessages]);

  // Show welcome message if no history messages and haven't shown it yet
  useEffect(() => {
    if (conversation && historyMessages.length === 0 && !hasShownWelcome && !isInitializing) {
      const welcomeMessage = agent.welcomeMessage || `Hello! I'm ${agent.name}. How can I help you today?`;
      startAiMessage();
      addAiTextDelta(welcomeMessage);
      completeAiMessage();
      setHasShownWelcome(true);
    }
  }, [conversation, historyMessages.length, hasShownWelcome, isInitializing, agent, startAiMessage, addAiTextDelta, completeAiMessage]);

  const { sendMessage, isProcessing } = useEnhancedTextChat({
    agent,
    onUserMessage: addUserMessage,
    onAiMessageStart: startAiMessage,
    onAiTextDelta: addAiTextDelta,
    onAiMessageComplete: (messageId: string) => {
      completeAiMessage();
      // Save messages to database if we have a conversation
      const currentMessage = messages.find(m => m.id === messageId);
      if (conversation?.id && currentMessage && currentMessage.content) {
        conversationService.addMessage(conversation.id, 'system', currentMessage.content);
      }
    }
  });

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText?.trim() || isProcessing) return;

    console.log('Sending message:', messageText);
    
    // Save user message to database if we have a conversation
    if (conversation?.id) {
      await conversationService.addMessage(conversation.id, 'user', messageText);
    }
    
    // Send message via chat hook
    await sendMessage(messageText);
    
    setInput('');
    inputRef.current?.focus();
  }, [conversation?.id, isProcessing, sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  // Combine history messages and current session messages
  const allMessages = [
    ...historyMessages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content || '',
      isComplete: true
    })),
    ...messages.filter(msg => msg.content && msg.content.trim().length > 0)
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [allMessages]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-card">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
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

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {allMessages.length === 0 && !isInitializing && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Start a conversation</h3>
                <p className="text-muted-foreground text-center">
                  Send a message to begin chatting with {agent.name}
                </p>
              </CardContent>
            </Card>
          )}
          
          {isInitializing && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <p className="text-muted-foreground">Initializing chat...</p>
            </div>
          )}
          
          {allMessages.map((message) => (
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
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">
                  {message.content || ''}
                  {!message.isComplete && (
                    <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
                  )}
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
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
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
