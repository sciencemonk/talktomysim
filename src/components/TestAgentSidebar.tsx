
import React, { useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AgentType } from "@/types/agent";
import { MessageSquare, Bot, Rocket, ArrowUp } from "lucide-react";
import { LiveTranscription } from "@/components/LiveTranscription";

interface TestAgentSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AgentType | null;
  onStartDirectCall: (phoneNumber: string, deviceSettings: { mic: string; speaker: string }) => void;
  onStartChat: () => void;
}

export const TestAgentSidebar: React.FC<TestAgentSidebarProps> = ({
  open,
  onOpenChange,
  agent,
  onStartDirectCall,
  onStartChat
}) => {
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<{role: "system" | "user"; text: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessages = [...chatMessages, { role: "user" as const, text: chatMessage }];
      setChatMessages(newMessages);
      
      setChatMessage("");
      
      setIsProcessing(true);
      setTimeout(() => {
        const agentResponse = { 
          role: "system" as const, 
          text: `I'm ${agent?.name || 'the AI assistant'}, and I'm here to help. ${chatMessage.length > 30 ? 'That\'s an interesting point you raised.' : 'How can I assist you today?'}` 
        };
        setChatMessages([...newMessages, agentResponse]);
        setIsProcessing(false);
      }, 1000);
      
      if (!hasStartedChat) {
        setHasStartedChat(true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 pt-0">
        <div className="flex flex-col h-full overflow-hidden">
          <SheetHeader className="space-y-2 p-6 pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Test Tutor
            </SheetTitle>
            <SheetDescription>
              Chat with your tutor to test how it responds to student questions.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 flex flex-col h-full overflow-hidden px-6 pb-6">
            <LiveTranscription 
              messages={chatMessages}
              isCallActive={isProcessing}
              className="flex-1 mb-4 overflow-y-auto"
            />
            
            <div className="relative mt-auto">
              <Textarea
                placeholder="Type your message..."
                className="min-h-[60px] max-h-[120px] resize-none pr-12 py-3 rounded-lg bg-background"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button 
                size="icon" 
                className="absolute bottom-3 right-3 h-8 w-8 rounded-full"
                onClick={handleSendMessage}
                disabled={!chatMessage.trim() || isProcessing}
                variant="ghost"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
