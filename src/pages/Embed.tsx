import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
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

  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const theme = params.get('theme');
    if (theme) {
      setThemeColor(`#${theme}`);
    }
  }, [location]);

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

  const addUserMessage = (message: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
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
      {/* Header */}
      <div 
        className="flex items-center p-3 border-b"
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  You
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
      </div>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
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
