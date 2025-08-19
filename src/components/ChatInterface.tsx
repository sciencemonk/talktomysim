
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentType } from '@/types/agent';
import { AudioIndicator } from './AudioIndicator';

interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  timestamp: Date;
  isComplete: boolean;
}

interface ChatInterfaceProps {
  agent: AgentType;
  messages: Message[];
  isConnected: boolean;
  isSpeaking: boolean;
  connectionStatus: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  agent,
  messages,
  isConnected,
  isSpeaking,
  connectionStatus
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Getting ready to chat...';
      case 'connected':
        return isSpeaking ? `${agent.name} is speaking...` : `${agent.name} is listening...`;
      case 'error':
        return 'Connection error - please refresh';
      default:
        return 'Getting ready...';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'connected':
        return isSpeaking ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-bg via-bgMuted to-bg">
      {/* Header with connection status */}
      <div className="flex-shrink-0 bg-bg/80 backdrop-blur-xl border-b border-border/20 p-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-4 ring-brandBlue/20">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback className="bg-gradient-to-br from-brandBlue to-brandPurple text-white">
                  <Bot className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              {isConnected && (
                <div className={cn(
                  "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-bg transition-colors",
                  isSpeaking ? "bg-green-500 animate-pulse" : "bg-blue-500"
                )} />
              )}
            </div>
            <div>
              <h1 className="font-semibold text-fg text-xl">
                {agent.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <div className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  isConnected 
                    ? (isSpeaking ? "bg-green-500 animate-pulse" : "bg-blue-500") 
                    : "bg-gray-400"
                )} />
                <p className={cn("text-sm transition-colors font-medium", getConnectionStatusColor())}>
                  {getConnectionStatusText()}
                </p>
              </div>
            </div>
          </div>
          
          {/* Audio Indicator */}
          {isConnected && isSpeaking && (
            <AudioIndicator isActive={isSpeaking} />
          )}
          
          {/* Status Indicator */}
          {isConnected && (
            <div className="flex items-center gap-3 px-4 py-2 bg-bgMuted/50 backdrop-blur-sm rounded-full border border-border/50">
              {isSpeaking ? (
                <MicOff className="h-5 w-5 text-red-500" />
              ) : (
                <Mic className="h-5 w-5 text-green-500" />
              )}
              <span className="text-sm font-medium text-fg">
                {isSpeaking ? 'AI Speaking' : 'You can speak or type'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 && connectionStatus !== 'connected' ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-brandBlue/20 to-brandPurple/20 rounded-3xl flex items-center justify-center mb-6">
                <Bot className="h-12 w-12 text-brandBlue" />
              </div>
              <h2 className="text-2xl font-semibold text-fg mb-3">
                Ready to chat with {agent.name}
              </h2>
              <p className="text-fgMuted">
                {connectionStatus === 'connecting' 
                  ? 'Your conversation will begin shortly' 
                  : connectionStatus === 'error'
                  ? 'Please refresh the page to try again'
                  : 'Start by saying hello or typing a message'
                }
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={cn(
                    "flex gap-4 animate-fade-in",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "system" && (
                    <Avatar className="h-12 w-12 flex-shrink-0 mt-2">
                      <AvatarImage src={agent.avatar} alt={agent.name} />
                      <AvatarFallback className="bg-gradient-to-br from-brandBlue to-brandPurple text-white">
                        <Bot className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div 
                    className={cn(
                      "rounded-2xl py-4 px-6 shadow-sm max-w-[80%] backdrop-blur-sm",
                      message.role === "system" 
                        ? "bg-bg/80 text-fg border border-border/50" 
                        : "bg-gradient-to-r from-brandBlue to-brandPurple text-white",
                      !message.isComplete && message.role === "system" && "bg-bgMuted/60"
                    )}
                  >
                    <p className="text-lg leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    
                    {!message.isComplete && message.role === "system" && (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="h-2 w-2 bg-brandBlue rounded-full animate-bounce" />
                        <div className="h-2 w-2 bg-brandPurple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    )}
                  </div>
                  
                  {message.role === "user" && (
                    <Avatar className="h-12 w-12 flex-shrink-0 mt-2">
                      <AvatarFallback className="bg-gradient-to-r from-brandBlue to-brandPurple text-white">
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
