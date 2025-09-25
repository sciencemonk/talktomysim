
import { useState, useEffect, useRef } from "react";
import { Bot, Menu } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/TextInput";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useTextChat } from "@/hooks/useTextChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { AgentType } from "@/types/agent";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarContent } from "./UserSidebar";
import { InfoModal } from "./InfoModal";

interface ChatInterfaceProps {
  agent: AgentType;
  onBack: () => void;
}

const ChatInterface = ({ agent, onBack }: ChatInterfaceProps) => {
  const [currentAgent, setCurrentAgent] = useState(agent);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
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
    <div className="flex flex-col h-full w-full relative bg-background">
      {/* Header with advisor info */}
      <div className="border-b bg-background px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
            <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold truncate">{currentAgent.name}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {currentAgent.title || currentAgent.subject || currentAgent.type}
            </p>
          </div>
        </div>
      </div>

      {/* Messages - Scrollable area with bottom padding for input */}
      <div className="flex-1 overflow-auto px-4 sm:p-4 pb-32 min-h-0">
        {chatHistory.messages.length === 0 && !textChat.isProcessing ? (
          <div className="flex flex-col items-center justify-center text-center px-4" style={{ minHeight: 'calc(100vh - 300px)' }}>
            <Avatar className="h-16 w-16 mb-4">
              <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                <Bot className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-medium mb-2">{currentAgent.name}</h2>
            <p className="text-muted-foreground text-sm mb-4 max-w-sm">
              {currentAgent.description || `Start a conversation with ${currentAgent.name}`}
            </p>
            <p className="text-xs text-muted-foreground">What will you ask?</p>
          </div>
        ) : (
          <>
            {chatHistory.messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 text-sm max-w-[85%] sm:max-w-[75%] md:max-w-[60%] lg:max-w-[50%] ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {textChat.isProcessing && (
              <div className="mb-4 flex flex-col items-start">
                <div className="rounded-2xl px-4 py-3 bg-muted text-foreground max-w-[85%] sm:max-w-[75%] md:max-w-[60%] lg:max-w-[50%]">
                  <div className="flex items-center gap-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input - Fixed at bottom above footer */}
      {(chatHistory.messages.length > 0 || !textChat.isProcessing) && (
        <div className="fixed bottom-16 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30">
          <TextInput 
            onSendMessage={textChat.sendMessage}
            disabled={textChat.isProcessing || isAiResponding}
            placeholder={isAiResponding ? `${currentAgent.name} is typing...` : `Message ${currentAgent.name}...`}
          />
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
