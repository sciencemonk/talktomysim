
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useTextChat } from "@/hooks/useTextChat";
import { conversationService, Conversation } from "@/services/conversationService";
import { AgentType } from "@/types/agent";
import { Send, ArrowLeft, User, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  agent: AgentType;
  onBack?: () => void;
  onLoginClick?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  agent,
  onBack,
  onLoginClick
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasAddedWelcomeMessage, setHasAddedWelcomeMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages: dbMessages, loadMessages } = useChatHistory(conversation?.id || null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation when component mounts or agent changes
  useEffect(() => {
    const initializeConversation = async () => {
      if (!agent?.id) return;
      
      setIsInitializing(true);
      console.log('Initializing conversation for agent:', agent.id);
      
      try {
        const conv = await conversationService.getOrCreateConversation(agent.id);
        if (conv) {
          console.log('Got conversation:', conv.id);
          setConversation(conv);
        } else {
          console.error('Failed to get or create conversation');
          toast({
            title: "Error",
            description: "Failed to start conversation. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the chat service. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeConversation();
  }, [agent?.id, toast]);

  // Load messages when conversation is ready
  useEffect(() => {
    if (conversation && dbMessages.length > 0) {
      console.log('Loading messages from database:', dbMessages.length);
      const chatMessages: ChatMessage[] = dbMessages.map(msg => ({
        id: msg.id,
        role: msg.role === 'system' ? 'assistant' : msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));
      setMessages(chatMessages);
      setHasAddedWelcomeMessage(true); // Messages exist, so welcome was already added
    } else if (conversation && dbMessages.length === 0 && !hasAddedWelcomeMessage && !isInitializing) {
      // This is a new conversation with no messages - add welcome message
      console.log('Adding welcome message for new conversation');
      addWelcomeMessage();
    }
  }, [conversation, dbMessages, hasAddedWelcomeMessage, isInitializing]);

  const addWelcomeMessage = async () => {
    if (!conversation || hasAddedWelcomeMessage) return;
    
    const welcomeText = agent.welcomeMessage || 
      `Hello! I'm ${agent.name}. I'm here to help and answer questions. What can I do for you?`;
    
    console.log('Adding welcome message:', welcomeText);
    
    try {
      // Add to database
      const savedMessage = await conversationService.addMessage(conversation.id, 'system', welcomeText);
      
      if (savedMessage) {
        // Add to local state
        const welcomeMessage: ChatMessage = {
          id: savedMessage.id,
          role: 'assistant',
          content: welcomeText,
          timestamp: new Date()
        };
        
        setMessages([welcomeMessage]);
        setHasAddedWelcomeMessage(true);
        console.log('Welcome message added successfully');
      }
    } catch (error) {
      console.error('Error adding welcome message:', error);
      // Still show welcome message in UI even if database save fails
      const welcomeMessage: ChatMessage = {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: welcomeText,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
      setHasAddedWelcomeMessage(true);
    }
  };

  const handleUserMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Save to database
    if (conversation) {
      conversationService.addMessage(conversation.id, 'user', content).catch(console.error);
    }
  };

  const handleAiMessageStart = (): string => {
    const messageId = 'ai-' + Date.now();
    const aiMessage: ChatMessage = {
      id: messageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };
    
    setMessages(prev => [...prev, aiMessage]);
    return messageId;
  };

  const handleAiTextDelta = (messageId: string, delta: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: msg.content + delta }
        : msg
    ));
  };

  const handleAiMessageComplete = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isStreaming: false }
        : msg
    ));
    
    // Save to database
    if (conversation) {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        conversationService.addMessage(conversation.id, 'system', message.content).catch(console.error);
      }
    }
  };

  const { sendMessage, isProcessing } = useTextChat({
    agent,
    onUserMessage: handleUserMessage,
    onAiMessageStart: handleAiMessageStart,
    onAiTextDelta: handleAiTextDelta,
    onAiMessageComplete: handleAiMessageComplete
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing || !conversation) return;
    
    const message = inputMessage.trim();
    setInputMessage('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connecting to {agent.name}...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to start conversation</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={agent.avatar} alt={agent.name} />
          <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h2 className="font-semibold text-foreground">{agent.name}</h2>
          {agent.title && (
            <p className="text-sm text-muted-foreground">{agent.title}</p>
          )}
        </div>

        {!user && onLoginClick && (
          <Button variant="outline" size="sm" onClick={onLoginClick}>
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                {message.role === 'user' ? (
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                ) : (
                  <>
                    <AvatarImage src={agent.avatar} alt={agent.name} />
                    <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                  </>
                )}
              </Avatar>
              
              <Card className={`flex-1 max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <CardContent className="p-3">
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card p-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${agent.name}...`}
            disabled={isProcessing}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isProcessing}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
