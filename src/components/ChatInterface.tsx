
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

const WordHighlighter: React.FC<{ text: string; isComplete: boolean }> = ({ text, isComplete }) => {
  const words = text.split(' ');
  
  return (
    <span className="text-3xl leading-relaxed font-medium">
      {words.map((word, index) => {
        // Only highlight the last few words when streaming, with slower timing
        const shouldHighlight = !isComplete && index >= Math.max(0, words.length - 3);
        
        return (
          <span
            key={index}
            className={cn(
              "inline-block mr-2 mb-1 transition-all duration-700 ease-in-out",
              shouldHighlight
                ? "bg-yellow-200 dark:bg-yellow-600 px-1 rounded animate-pulse" 
                : ""
            )}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};

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
        return 'Something went wrong';
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
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header - now simpler since top nav is fixed */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b-4 border-blue-200 dark:border-blue-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-blue-200 dark:border-blue-700">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                <Bot className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-2xl">
                {agent.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className={cn(
                  "h-3 w-3 rounded-full transition-colors",
                  isConnected 
                    ? (isSpeaking ? "bg-green-500 animate-pulse" : "bg-blue-500") 
                    : "bg-gray-400"
                )} />
                <p className={cn("text-lg transition-colors font-medium", getConnectionStatusColor())}>
                  {getConnectionStatusText()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isConnected && (
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                {isSpeaking ? (
                  <Mic className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <MicOff className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                )}
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  {isSpeaking ? 'Speaking' : 'Listening'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-8">
        <div className="space-y-8 max-w-6xl mx-auto">
          {messages.length === 0 && connectionStatus !== 'connected' ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Bot className="h-24 w-24 mb-6 text-blue-400 dark:text-blue-600" />
              <p className="text-3xl text-gray-600 dark:text-gray-400 mb-4 font-bold">
                Getting ready to chat with {agent.name}!
              </p>
              <p className="text-xl text-gray-500 dark:text-gray-500">
                Your fun conversation will begin soon
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
                      "flex gap-6 animate-fade-in",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "system" && (
                      <Avatar className="h-16 w-16 flex-shrink-0 mt-2">
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                          <Bot className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div 
                      className={cn(
                        "rounded-3xl py-6 px-8 shadow-lg max-w-[85%] min-w-[300px]",
                        message.role === "system" 
                          ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-4 border-blue-200 dark:border-blue-700" 
                          : "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-4 border-blue-300",
                        !message.isComplete && message.role === "system" && "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600"
                      )}
                    >
                      {message.role === "system" ? (
                        <WordHighlighter text={message.content} isComplete={message.isComplete} />
                      ) : (
                        <p className="text-3xl leading-relaxed font-medium whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}
                      
                      {!message.isComplete && message.role === "system" && (
                        <div className="flex items-center gap-2 mt-4">
                          <div className="h-4 w-4 bg-blue-500 rounded-full animate-bounce" />
                          <div className="h-4 w-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                          <div className="h-4 w-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />
                        </div>
                      )}
                    </div>
                    
                    {message.role === "user" && (
                      <Avatar className="h-16 w-16 flex-shrink-0 mt-2">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          <User className="h-8 w-8" />
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
