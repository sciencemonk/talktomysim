import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Mic, MicOff, User } from 'lucide-react';
import { AgentType } from '@/types/agent';
import { useEnhancedTextChat } from '@/hooks/useEnhancedTextChat';
import { conversationService, Conversation } from '@/services/conversationService';
import { useChatHistory } from '@/hooks/useChatHistory';

interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  timestamp: number;
}

interface ChatInterfaceProps {
  agent: AgentType;
  onToggleAudio?: () => void;
  isAudioEnabled?: boolean;
  onBack?: () => void;
  onLoginClick?: () => void;
  isUserOwnSim?: boolean;
}

export const ChatInterface = ({ 
  agent, 
  onToggleAudio, 
  isAudioEnabled = false, 
  onBack, 
  onLoginClick, 
  isUserOwnSim = false 
}: ChatInterfaceProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [currentAiMessage, setCurrentAiMessage] = useState<string>('');
  const [hasLoadedInitialMessages, setHasLoadedInitialMessages] = useState(false);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Check if user is near bottom of chat
  const checkIfNearBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    
    const container = messagesContainerRef.current;
    const threshold = 150; // pixels from bottom
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    
    setIsUserNearBottom(isNearBottom);
    return isNearBottom;
  }, []);

  // Smart scroll to bottom - only if user is near bottom
  const scrollToBottom = useCallback((force = false) => {
    if (messagesEndRef.current && (force || isUserNearBottom)) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isUserNearBottom]);

  // Handle scroll events to track user position
  const handleScroll = useCallback(() => {
    checkIfNearBottom();
  }, [checkIfNearBottom]);

  // Scroll to bottom when messages update (only if user is near bottom)
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Force scroll to bottom when new message starts (user sends message)
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        setIsUserNearBottom(true);
        scrollToBottom(true);
      }
    }
  }, [messages.length, scrollToBottom]);

  // Initialize conversation on component mount
  useEffect(() => {
    const initConversation = async () => {
      if (agent?.id) {
        const conv = await conversationService.getOrCreateConversation(agent.id);
        setConversation(conv);
      }
    };
    
    initConversation();
  }, [agent?.id]);

  const { messages: historyMessages, isLoading, loadMessages } = useChatHistory(conversation?.id || null);

  // Update local messages when history loads and show welcome message if needed
  useEffect(() => {
    if (historyMessages && conversation?.id && !hasLoadedInitialMessages) {
      if (historyMessages.length > 0) {
        const formattedMessages: Message[] = historyMessages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at).getTime()
        }));
        setMessages(formattedMessages);
      } else if (agent?.welcomeMessage) {
        // Show welcome message if no existing messages and agent has a welcome message
        const welcomeMsg: Message = {
          id: 'welcome-message',
          role: 'system',
          content: agent.welcomeMessage,
          timestamp: Date.now()
        };
        setMessages([welcomeMsg]);
      }
      setHasLoadedInitialMessages(true);
      // Force scroll to bottom on initial load
      setTimeout(() => {
        setIsUserNearBottom(true);
        scrollToBottom(true);
      }, 100);
    }
  }, [historyMessages, conversation?.id, agent?.welcomeMessage, hasLoadedInitialMessages, scrollToBottom]);

  const addUserMessage = useCallback(async (message: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);

    if (conversation?.id) {
      await conversationService.addMessage(conversation.id, 'user', message);
    }
  }, [conversation?.id]);

  const startAiMessage = useCallback(() => {
    setCurrentAiMessage('');
    const aiMessageId = `ai-${Date.now()}`;
    return aiMessageId;
  }, []);

  const addAiTextDelta = useCallback((delta: string) => {
    setCurrentAiMessage(prev => prev + delta);
    
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.role === 'system' && lastMessage.id.startsWith('ai-')) {
        return prev.map((msg, index) => 
          index === prev.length - 1 && msg.role === 'system' && msg.id.startsWith('ai-')
            ? { ...msg, content: msg.content + delta }
            : msg
        );
      } else {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: 'system',
          content: delta,
          timestamp: Date.now()
        };
        return [...prev, aiMsg];
      }
    });
  }, []);

  const completeAiMessage = useCallback(async (finalContent: string) => {
    if (conversation?.id && finalContent && finalContent.trim()) {
      console.log('Saving AI message to database:', finalContent);
      await conversationService.addMessage(conversation.id, 'system', finalContent);
      
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'system' && lastMessage.id.startsWith('ai-')) {
          return prev.map((msg, index) => 
            index === prev.length - 1 && msg.role === 'system' && msg.id.startsWith('ai-')
              ? { ...msg, content: finalContent, id: `saved-${Date.now()}` }
              : msg
          );
        }
        return prev;
      });
    }
    setCurrentAiMessage('');
  }, [conversation?.id]);

  const { sendMessage, isProcessing } = useEnhancedTextChat({
    agent,
    onUserMessage: addUserMessage,
    onAiMessageStart: startAiMessage,
    onAiTextDelta: addAiTextDelta,
    onAiMessageComplete: completeAiMessage
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;
    
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    
    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading && !hasLoadedInitialMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse">Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background relative w-full max-w-full overflow-hidden">
      {/* Header - Only show for non-user sims */}
      {!isUserOwnSim && (
        <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={agent?.avatar} alt={agent?.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {agent?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">{agent?.name}</h2>
              <p className="text-sm text-muted-foreground">{agent?.title}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onToggleAudio && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleAudio}
                className="flex items-center gap-2"
              >
                {isAudioEnabled ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Audio Off
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Audio On
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoginClick}
              className="p-2"
            >
              <img 
                src="/lovable-uploads/bd1798e5-2033-45c5-a39b-4e8192a4b046.png" 
                alt="Login" 
                className="h-6 w-6 object-contain"
              />
            </Button>
          </div>
        </div>
      )}

      {/* Messages - Improved scrolling behavior */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto p-4 space-y-4 w-full ${
          isUserOwnSim ? 'pt-4 pb-24' : 'pt-24 pb-24'
        }`}
      >
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p>Start a conversation with {agent?.name}</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'system' && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={agent?.avatar} alt={agent?.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {agent?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
            
            {message.role === 'user' && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Typing indicator - only show when processing */}
        {isProcessing && (
          <div className="flex gap-3 justify-start">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={agent?.avatar} alt={agent?.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {agent?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-lg px-4 py-2 flex items-center">
              <div className="flex space-x-1 items-center">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Always fixed to bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-10 p-4 border-t border-border bg-card">
        <div className="flex gap-2 w-full max-w-full">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${agent?.name}...`}
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
