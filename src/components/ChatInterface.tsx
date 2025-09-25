
import { useState, useEffect, useRef } from "react";
import { Bot, ChevronLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/TextInput";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useTextChat } from "@/hooks/useTextChat";
import { AgentType } from "@/types/agent";

interface ChatInterfaceProps {
  agent: AgentType;
  onBack: () => void;
}

const ChatInterface = ({ agent, onBack }: ChatInterfaceProps) => {
  const [currentAgent, setCurrentAgent] = useState(agent);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
    <div className="flex flex-col h-full w-full bg-background">
      {/* Header with advisor info and back button - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 h-auto"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
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

      {/* Messages - Scrollable area with padding for fixed header and input */}
      <div className="flex-1 overflow-auto px-4 pt-20 pb-24 min-h-0">
        {chatHistory.messages.length === 0 && !textChat.isProcessing ? (
          <div className="flex flex-col items-center justify-center text-center h-full min-h-[50vh]">
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
                    className={`rounded-2xl px-4 py-2 text-sm max-w-[85%] ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-foreground'
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
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input - Fixed at bottom of viewport */}
      {(chatHistory.messages.length > 0 || !textChat.isProcessing) && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 z-50">
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
