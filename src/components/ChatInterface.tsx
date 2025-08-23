
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Send, ArrowLeft, Loader2, Bot, User } from "lucide-react";
import { AgentType } from "@/types/agent";
import { useEnhancedTextChat } from "@/hooks/useEnhancedTextChat";
import { conversationService } from "@/services/conversationService";
import { useChatHistory } from "@/hooks/useChatHistory";

interface ChatInterfaceProps {
  agent: AgentType;
  onBack?: () => void;
}

interface DisplayMessage {
  id: string;
  role: 'user' | 'system';
  content: string;
  isComplete: boolean;
  timestamp: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ agent, onBack }) => {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [currentAiMessage, setCurrentAiMessage] = useState<DisplayMessage | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Update display messages when history changes
  useEffect(() => {
    const historyMsgs: DisplayMessage[] = historyMessages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'system',
      content: msg.content || '',
      isComplete: true,
      timestamp: new Date(msg.created_at || Date.now()).getTime()
    }));

    setDisplayMessages(historyMsgs);
    console.log('Updated display messages from history:', historyMsgs.length);
  }, [historyMessages]);

  // Show welcome message if no history messages and haven't shown it yet
  useEffect(() => {
    if (conversation && historyMessages.length === 0 && !hasShownWelcome && !isInitializing) {
      const welcomeMessage = agent.welcomeMessage || `Hello! I'm ${agent.name}. How can I help you today?`;
      console.log('Showing welcome message:', welcomeMessage);
      
      const welcomeMsg: DisplayMessage = {
        id: `welcome-${Date.now()}`,
        role: 'system',
        content: welcomeMessage,
        isComplete: true,
        timestamp: Date.now()
      };
      
      setDisplayMessages([welcomeMsg]);
      setHasShownWelcome(true);
      
      // Save welcome message to database
      if (conversation?.id) {
        conversationService.addMessage(conversation.id, 'system', welcomeMessage);
      }
    }
  }, [conversation, historyMessages.length, hasShownWelcome, isInitializing, agent]);

  const addUserMessage = useCallback((content: string) => {
    const userMsg: DisplayMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      isComplete: true,
      timestamp: Date.now()
    };
    
    setDisplayMessages(prev => [...prev, userMsg]);
  }, []);

  const startAiMessage = useCallback(() => {
    const aiMsg: DisplayMessage = {
      id: `ai-${Date.now()}`,
      role: 'system',
      content: '',
      isComplete: false,
      timestamp: Date.now()
    };
    
    setCurrentAiMessage(aiMsg);
    setDisplayMessages(prev => [...prev, aiMsg]);
    
    return aiMsg.id;
  }, []);

  const addAiTextDelta = useCallback((delta: string) => {
    if (!currentAiMessage) return;
    
    setDisplayMessages(prev => 
      prev.map(msg => 
        msg.id === currentAiMessage.id 
          ? { ...msg, content: msg.content + delta }
          : msg
      )
    );
    
    setCurrentAiMessage(prev => 
      prev ? { ...prev, content: prev.content + delta } : null
    );
  }, [currentAiMessage]);

  const completeAiMessage = useCallback(() => {
    if (!currentAiMessage) return;
    
    setDisplayMessages(prev => 
      prev.map(msg => 
        msg.id === currentAiMessage.id 
          ? { ...msg, isComplete: true }
          : msg
      )
    );
    
    setCurrentAiMessage(null);
  }, [currentAiMessage]);

  const { sendMessage, isProcessing } = useEnhancedTextChat({
    agent,
    onUserMessage: addUserMessage,
    onAiMessageStart: startAiMessage,
    onAiTextDelta: addAiTextDelta,
    onAiMessageComplete: (messageId: string) => {
      console.log('AI message completed:', messageId);
      completeAiMessage();
      // Save AI response to database if we have a conversation
      const currentMessage = displayMessages.find(m => m.id === messageId);
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
  }, [conversation?.id, isProcessing, sendMessage, displayMessages]);

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
  }, [displayMessages, isProcessing]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-card">
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
          {isInitializing && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <p className="text-muted-foreground">Initializing chat...</p>
            </div>
          )}
          
          {displayMessages.map((message) => (
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
                <div className="text-sm text-muted-foreground">
                  {agent.name} is typing...
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Fixed Input at bottom */}
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
