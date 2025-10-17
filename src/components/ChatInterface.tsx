
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
}

const ChatInterface = ({ agent, onBack, hideHeader = false, transparentMode = false }: ChatInterfaceProps) => {
  const [currentAgent, setCurrentAgent] = useState(agent);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { isKeyboardVisible, viewportHeight } = useIOSKeyboard();
  
  const chatHistory = useChatHistory(currentAgent);
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory.messages]);

  return (
    <div 
      className={`flex flex-col w-full overflow-hidden ${
        transparentMode ? 'bg-transparent' : 'bg-background'
      }`}
      style={{
        height: hideHeader ? '100%' : (isMobile && isKeyboardVisible 
          ? `${viewportHeight}px` 
          : '100vh')
      }}
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
      <div className={`flex-1 overflow-auto py-4 min-h-0 ${transparentMode ? 'px-4' : 'px-4'}`}>
        {chatHistory.messages.length === 0 && !textChat.isProcessing ? (
          <div className="flex flex-col items-center justify-center text-center h-full min-h-[50vh]">
            <p className={`text-sm mb-4 max-w-sm ${transparentMode ? 'text-white/70' : 'text-muted-foreground'}`}>
              {currentAgent.description || `Start a conversation with ${currentAgent.name}`}
            </p>
          </div>
        ) : (
          <>
            {chatHistory.messages.map((message) => {
              // Don't render AI messages that are incomplete and have no content
              if (message.role === 'system' && !message.isComplete && !message.content.trim()) {
                return null;
              }
              
              return (
                <div
                  key={message.id}
                  className={`mb-4 flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] ${
                      transparentMode 
                        ? (message.role === 'user'
                          ? 'bg-white text-black ml-auto'
                          : 'bg-white/95 text-black')
                        : (message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground')
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}
            
            {/* Typing indicator */}
            {textChat.isProcessing && (
              <div className="mb-4 flex items-start">
                <div className="flex space-x-1 p-3">
                  <div className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s] ${
                    transparentMode ? 'bg-white/60' : 'bg-muted-foreground'
                  }`}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s] ${
                    transparentMode ? 'bg-white/60' : 'bg-muted-foreground'
                  }`}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${
                    transparentMode ? 'bg-white/60' : 'bg-muted-foreground'
                  }`}></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input - Flex footer */}
      {(chatHistory.messages.length > 0 || !textChat.isProcessing) && (
        <div className={`flex-shrink-0 p-4 ${
          transparentMode ? 'border-t-0' : 'border-t bg-background'
        }`}>
          <TextInput 
            onSendMessage={textChat.sendMessage}
            disabled={textChat.isProcessing || isAiResponding}
            placeholder={isAiResponding ? `${currentAgent.name} is typing...` : `Message ${currentAgent.name}...`}
            transparentMode={transparentMode}
          />
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
