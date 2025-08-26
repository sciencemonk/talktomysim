import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User } from 'lucide-react';
import { publicAgentService } from '@/services/publicAgentService';
import { AgentType } from '@/types/agent';
import { useEnhancedTextChat } from '@/hooks/useEnhancedTextChat';

interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  timestamp: number;
}

const Embed: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [agent, setAgent] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [themeColor, setThemeColor] = useState('#ffffff');
  
  // Scrolling state
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  
  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const theme = params.get('theme');
    if (theme) {
      setThemeColor(`#${theme}`);
    }
  }, [location]);
  
  // Check if user is near the bottom of the chat
  const checkIfNearBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    
    const container = messagesContainerRef.current;
    const threshold = 50; // Smaller threshold for more responsive scrolling
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    
    setIsUserNearBottom(isNearBottom);
    return isNearBottom;
  }, []);
  
  // Extreme force scroll to absolute bottom
  const scrollToBottom = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    // Always scroll to absolute bottom
    const container = messagesContainerRef.current;
    
    // Function to ensure we're at the very bottom
    const forceToBottom = () => {
      // Set scroll directly to maximum possible value with extra padding
      container.scrollTop = container.scrollHeight + 1000;
      
      // Also use scrollIntoView as a backup method
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: 'auto',
          block: 'end'
        });
      }
    };
    
    // Execute multiple times to ensure it works
    forceToBottom();
    
    // And again after a tiny delay
    setTimeout(forceToBottom, 5);
  }, []);
  
  // Handle scroll events
  const handleScroll = useCallback(() => {
    checkIfNearBottom();
    
    // Detect if user is actively scrolling
    setIsUserScrolling(true);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Reset scrolling state after user stops scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 150);
  }, [checkIfNearBottom]);

  // Load agent data
  useEffect(() => {
    const loadAgent = async () => {
      if (!id) {
        setError('No agent ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const data = await publicAgentService.fetchPublicAgentById(id);
        setAgent(data);

        // Add welcome message if available
        if (data.welcomeMessage) {
          setMessages([
            {
              id: 'welcome',
              role: 'system',
              content: data.welcomeMessage,
              timestamp: Date.now()
            }
          ]);
        }
      } catch (err: any) {
        console.error('Error loading agent:', err);
        setError(err.message || 'Failed to load agent');
      } finally {
        setIsLoading(false);
      }
    };

    loadAgent();
  }, [id]);

  // Extremely aggressive scroll to bottom on every message change
  useEffect(() => {
    // Multiple scroll attempts with increasing delays to ensure it works
    if (messages.length > 0) {
      // Immediate scroll attempt
      scrollToBottom();
      
      // Follow-up attempts with delays to ensure rendering is complete
      const delays = [10, 20, 50, 100, 200, 300, 500, 800];
      delays.forEach(delay => {
        setTimeout(() => scrollToBottom(), delay);
      });
    }
  }, [messages, scrollToBottom]);
  
  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const addUserMessage = (message: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    
    // Auto-scroll when user sends a message
    setShouldAutoScroll(true);
    setIsUserNearBottom(true);
    
    // Force multiple scroll attempts
    scrollToBottom();
    setTimeout(() => scrollToBottom(), 50);
    setTimeout(() => scrollToBottom(), 150);
  };

  const startAiMessage = () => {
    return `ai-${Date.now()}`;
  };

  const addAiTextDelta = (messageId: string, delta: string) => {
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
          id: messageId,
          role: 'system',
          content: delta,
          timestamp: Date.now()
        };
        return [...prev, aiMsg];
      }
    });
  };

  const completeAiMessage = async (finalContent: string) => {
    // This is just a placeholder since we're not saving messages in the embed
  };

  const { sendMessage, isProcessing } = agent ? useEnhancedTextChat({
    agent,
    onUserMessage: addUserMessage,
    onAiMessageStart: startAiMessage,
    onAiTextDelta: addAiTextDelta,
    onAiMessageComplete: completeAiMessage,
    isOwner: false
  }) : { sendMessage: () => {}, isProcessing: false };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="text-destructive mb-2">Error loading assistant</div>
        <div className="text-sm text-muted-foreground">{error || 'Agent not found'}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header - Fixed position */}
      <div 
        className="fixed top-0 left-0 right-0 z-10 flex items-center p-3 border-b bg-card"
        style={{ backgroundColor: themeColor !== '#ffffff' ? themeColor : undefined }}
      >
        <Avatar className="h-8 w-8 mr-3">
          <AvatarImage 
            src={agent.avatar_url || (agent.avatar ? `/lovable-uploads/${agent.avatar}` : undefined)} 
            alt={agent.name} 
          />
          <AvatarFallback className="bg-primary/10 text-primary">
            {agent.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-sm">{agent.name}</div>
          <div className="text-xs text-muted-foreground">{agent.title || 'AI Assistant'}</div>
        </div>
      </div>

      {/* Messages - With padding for fixed header and footer */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 pt-16 pb-32 space-y-4 mobile-chat-container"
      >
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-muted-foreground py-8">
            Start a conversation with {agent.name}
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
                <AvatarImage 
                  src={agent.avatar_url || (agent.avatar ? `/lovable-uploads/${agent.avatar}` : undefined)} 
                  alt={agent.name} 
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {agent.name.charAt(0)}
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
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
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

        {/* Typing indicator */}
        {isProcessing && (
          <div className="flex gap-3 justify-start">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage 
                src={agent.avatar_url || (agent.avatar ? `/lovable-uploads/${agent.avatar}` : undefined)} 
                alt={agent.name} 
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {agent.name.charAt(0)}
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
        
        {/* Invisible element to scroll to with extra padding */}
        <div ref={messagesEndRef} className="h-16" />
      </div>

      {/* Input - Fixed to bottom */}
      <div className="fixed bottom-0 z-10 border-t border-border bg-card left-0 right-0 p-3">
        <div className="flex gap-2 w-full max-w-full">
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
        <div className="text-xs text-center mt-2 text-muted-foreground">
          Powered by <a href="https://talktomysim.com" target="_blank" rel="noopener noreferrer" className="underline">Talk to My Sim</a>
        </div>
      </div>
    </div>
  );
};

export default Embed;
