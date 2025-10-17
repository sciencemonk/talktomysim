
import { useState, useEffect, useRef } from "react";
import { Bot, ChevronLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/TextInput";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useTextChat } from "@/hooks/useTextChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIOSKeyboard } from "@/hooks/useIOSKeyboard";
import { AgentType } from "@/types/agent";

interface ChatInterfaceProps {
  agent: AgentType;
  onBack?: () => void;
  hideHeader?: boolean;
  transparentMode?: boolean;
  isCreatorChat?: boolean;
  forceNewChat?: boolean;
}

const ChatInterface = ({ agent, onBack, hideHeader = false, transparentMode = false, isCreatorChat = false, forceNewChat = false }: ChatInterfaceProps) => {
  const [currentAgent, setCurrentAgent] = useState(agent);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { isKeyboardVisible, viewportHeight } = useIOSKeyboard();
  
  const chatHistory = useChatHistory(currentAgent, isCreatorChat, forceNewChat);
  const textChat = useTextChat({
    agent: currentAgent,
    onUserMessage: chatHistory.addUserMessage,
    onAiMessageStart: chatHistory.startAiMessage,
    onAiTextDelta: chatHistory.addAiTextDelta,
    onAiMessageComplete: chatHistory.completeAiMessage
  });

  useEffect(() => {
    setCurrentAgent(agent);
  }, [agent]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory.messages]);

  return (
    <div 
      className={`flex flex-col w-full h-screen overflow-hidden ${
        transparentMode ? 'bg-transparent' : 'bg-background'
      }`}
    >
      {/* Header with advisor info and back button - Flex header */}
      {!hideHeader && (
        <div className={`flex-shrink-0 px-4 py-3 z-50 ${
          transparentMode ? 'border-b-0' : 'border-b bg-background'
        }`}>
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2 h-auto"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold truncate">{currentAgent.name}</h1>
              <p className="text-sm text-muted-foreground truncate">
                {currentAgent.title || currentAgent.subject || currentAgent.type}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages - Flex-1 scrollable area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto min-h-0 bg-background">
        {chatHistory.messages.length === 0 && !textChat.isProcessing ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
              How may I help you?
            </h1>
          </div>
        ) : (
          <div className="py-8">
            <div className="max-w-3xl mx-auto px-4">
              {chatHistory.messages.map((message) => {
                // Don't render AI messages that are incomplete and have no content
                if (message.role === 'system' && !message.isComplete && !message.content.trim()) {
                  return null;
                }
                
                return (
                  <div
                    key={message.id}
                    className={`mb-8 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing indicator */}
              {textChat.isProcessing && (
                <div className="mb-8 flex justify-start">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 bg-background border-t">
        <div className="max-w-3xl mx-auto">
          <TextInput 
            onSendMessage={textChat.sendMessage}
            disabled={textChat.isProcessing || isAiResponding}
            placeholder={isAiResponding ? `${currentAgent.name} is typing...` : `Message ${currentAgent.name}...`}
            transparentMode={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
