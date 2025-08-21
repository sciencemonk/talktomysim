import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/TextInput";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { ShareButton } from "@/components/ShareButton";
import { InfoModal } from "@/components/InfoModal";

interface ChatInterfaceProps {
  agent: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    type: string;
  };
  onBack: () => void;
}

const ChatInterface = ({ agent, onBack }: ChatInterfaceProps) => {
  const realtimeChat = useRealtimeChat({ agent: agent! });

  // Combine messages with current partial message if speaking
  const allMessages = [...realtimeChat.messages];
  if (realtimeChat.currentMessage && realtimeChat.isSpeaking) {
    allMessages.push({
      id: 'current',
      role: 'system' as const,
      content: realtimeChat.currentMessage,
      timestamp: new Date(),
      isComplete: false
    });
  }

  return (
    <div className="h-screen flex flex-col w-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 py-5 sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-lg truncate">{agent.name}</h1>
              <p className="text-sm text-muted-foreground truncate">{agent.title || agent.type}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <ShareButton 
              tutorId={agent.id}
              tutorName={agent.name}
            />
            <InfoModal />
          </div>
        </div>
      </div>

      {/* Chat Content Area - Scrollable between header and input */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          {allMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4 sm:px-6">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6">
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-center">How can I help you today?</h2>
              <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md leading-relaxed">
                {realtimeChat.connectionStatus === 'connecting' 
                  ? 'Getting ready to chat...' 
                  : realtimeChat.connectionStatus === 'error'
                  ? 'Connection error - please refresh'
                  : `I'm ${agent.name}, ready to help you learn and explore ideas together!`
                }
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <div className="space-y-6 sm:space-y-8">
                {allMessages.map((message) => (
                  <div key={message.id} className="flex gap-3 sm:gap-4">
                    {message.role === 'system' && (
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-xs sm:text-sm font-medium">You</span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words mb-0 font-medium">
                          {message.content}
                        </p>
                      </div>
                      
                      {!message.isComplete && message.role === 'system' && (
                        <div className="flex items-center gap-1 mt-3">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Input Area - Always visible and sticky at bottom */}
        <div className="border-t bg-background sticky bottom-0 z-10 flex-shrink-0">
          <TextInput
            onSendMessage={realtimeChat.sendTextMessage}
            disabled={!realtimeChat.isConnected}
            placeholder={
              !realtimeChat.isConnected 
                ? "Connecting..." 
                : `Message ${agent.name}...`
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
