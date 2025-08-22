
import { useState, useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/TextInput";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useEnhancedTextChat } from "@/hooks/useEnhancedTextChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { AgentType } from "@/types/agent";
import { InfoModal } from "./InfoModal";

interface ChatInterfaceProps {
  agent: AgentType;
  onBack: () => void;
}

const ChatInterface = ({ agent, onBack }: ChatInterfaceProps) => {
  const [currentAgent, setCurrentAgent] = useState(agent);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const chatHistory = useChatHistory(currentAgent);
  
  const textChat = useEnhancedTextChat({
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
    <div className="flex flex-col h-screen w-full">
      {/* Header - Always visible on mobile */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 py-4 flex-shrink-0 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isMobile ? 'justify-center flex-1' : ''}`}>
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
              </AvatarFallback>
            </Avatar>
            <div className={`min-w-0 flex-1 ${isMobile ? 'text-center' : ''}`}>
              <h1 className="text-lg sm:text-xl font-semibold truncate">{currentAgent.name}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {currentAgent.title || currentAgent.subject || currentAgent.type}
              </p>
            </div>
          </div>
          {!isMobile && <InfoModal agentName={currentAgent.name} />}
        </div>
        {isMobile && (
          <div className="flex justify-center mt-2">
            <InfoModal agentName={currentAgent.name} />
          </div>
        )}
      </div>

      {/* Messages - Scrollable area between header and input */}
      <div className="flex-1 overflow-auto px-4 sm:p-4 min-h-0">
        {chatHistory.messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`rounded-lg px-3 py-2 text-sm max-w-[85%] sm:max-w-[75%] md:max-w-[60%] lg:max-w-[40%] xl:max-w-[30%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Always visible and sticky on mobile */}
      <div className="border-t bg-background flex-shrink-0 sticky bottom-0 z-10">
        <TextInput 
          onSendMessage={textChat.sendMessage}
          disabled={textChat.isProcessing || isAiResponding}
          placeholder={isAiResponding ? `${currentAgent.name} is typing...` : `Message ${currentAgent.name}...`}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
