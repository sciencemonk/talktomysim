
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SidebarContent
                    selectedPublicAdvisors={[]}
                    onSelectPublicAdvisor={() => {
                      setIsSheetOpen(false);
                    }}
                    onRemovePublicAdvisor={() => {}}
                    onShowAdvisorDirectory={() => {
                      onBack();
                      setIsSheetOpen(false);
                    }}
                    onClose={() => setIsSheetOpen(false)}
                  />
                </SheetContent>
              </Sheet>
            )}
            <Avatar className="h-12 w-12">
              <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold">{currentAgent.name}</h1>
              <p className="text-sm text-muted-foreground">
                {currentAgent.subject || currentAgent.type}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4">
        {chatHistory.messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`rounded-lg px-3 py-2 text-sm max-w-[75%] sm:max-w-[60%] md:max-w-[40%] lg:max-w-[30%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-background p-4 flex-shrink-0">
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
