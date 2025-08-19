import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentType } from '@/types/agent';

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
        return 'Connecting to your tutor...';
      case 'connected':
        return isSpeaking ? 'AI is speaking...' : 'Listening...';
      case 'error':
        return 'Connection error';
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
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  console.log('ChatInterface rendering with messages:', messages);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-gray-200 dark:border-gray-700">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white text-lg">
                {agent.name}
              </h1>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  isConnected 
                    ? (isSpeaking ? "bg-green-500 animate-pulse" : "bg-blue-500") 
                    : "bg-gray-400"
                )} />
                <p className={cn("text-sm transition-colors", getConnectionStatusColor())}>
                  {getConnectionStatusText()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isConnected && (
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                {isSpeaking ? (
                  <Mic className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <MicOff className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {isSpeaking ? 'Speaking' : 'Listening'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-5xl mx-auto">
          {messages.length === 0 && connectionStatus !== 'connected' ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Bot className="h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                Getting ready to chat with {agent.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Your conversation will begin automatically
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                console.log('Rendering message:', message);
                return (
                  <div 
                    key={message.id} 
                    className={cn(
                      "flex gap-4 animate-fade-in",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "system" && (
                      <Avatar className="h-12 w-12 flex-shrink-0 mt-1">
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                          <Bot className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div 
                      className={cn(
                        "rounded-2xl py-4 px-6 shadow-sm max-w-[80%] min-w-[200px]",
                        message.role === "system" 
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                          : "bg-blue-600 dark:bg-blue-700 text-white",
                        !message.isComplete && "opacity-90"
                      )}
                    >
                      <p className="text-lg leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      {!message.isComplete && (
                        <div className="flex items-center gap-1 mt-3">
                          <div className="h-2 w-2 bg-current rounded-full animate-pulse" />
                          <div className="h-2 w-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="h-2 w-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                      )}
                    </div>
                    
                    {message.role === "user" && (
                      <Avatar className="h-12 w-12 flex-shrink-0 mt-1">
                        <AvatarFallback className="bg-blue-600 dark:bg-blue-700 text-white">
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
