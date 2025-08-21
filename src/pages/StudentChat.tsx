import { useParams } from "react-router-dom";
import { usePublicAgent } from "@/hooks/usePublicAgent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Menu } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/TextInput";
import { InfoModal } from "@/components/InfoModal";
import { useRef, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTextChat } from "@/hooks/useTextChat";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarContent } from "@/components/UserSidebar";

interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  timestamp: Date;
  isComplete: boolean;
}

const StudentChat = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { agent, isLoading, error } = usePublicAgent(agentId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const [messages, setMessages] = useState<Message[]>([]);

  // Simple message management for public chat (no persistence needed)
  const addUserMessage = (content: string) => {
    const message: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      isComplete: true
    };
    setMessages(prev => [...prev, message]);
  };

  const startAiMessage = () => {
    const messageId = `ai_${Date.now()}`;
    const message: Message = {
      id: messageId,
      role: 'system',
      content: '',
      timestamp: new Date(),
      isComplete: false
    };
    setMessages(prev => [...prev, message]);
    return messageId;
  };

  const addAiTextDelta = (messageId: string, delta: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: msg.content + delta }
        : msg
    ));
  };

  const completeAiMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isComplete: true }
        : msg
    ));
  };

  const textChat = useTextChat({
    agent: agent!,
    onUserMessage: addUserMessage,
    onAiMessageStart: startAiMessage,
    onAiTextDelta: addAiTextDelta,
    onAiMessageComplete: completeAiMessage
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="h-screen flex">
        {/* Desktop Sidebar Skeleton */}
        {!isMobile && (
          <div className="w-80 border-r bg-background p-6">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        )}
        
        <div className="flex-1 flex flex-col">
          {/* Header Skeleton */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 py-5 sticky top-0 z-10">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                {isMobile && <Skeleton className="h-8 w-8" />}
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-9 w-16" />
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-base text-muted-foreground">Loading your learning buddy...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="h-screen flex">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-80 border-r bg-background">
            <SidebarContent
              selectedPublicAdvisors={[]}
              onSelectPublicAdvisor={() => {}}
              onRemovePublicAdvisor={() => {}}
              onShowAdvisorDirectory={() => {
                window.history.back();
              }}
              onClose={() => {}}
            />
          </div>
        )}
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6">
              <Bot className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-xl mb-3">Learning Buddy Not Available</h3>
            <p className="text-base text-muted-foreground">
              {error || "This learning buddy is not available for chat."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-80 border-r bg-background flex-shrink-0">
          <SidebarContent
            selectedPublicAdvisors={[]}
            onSelectPublicAdvisor={() => {}}
            onRemovePublicAdvisor={() => {}}
            onShowAdvisorDirectory={() => {
              window.history.back();
            }}
            onClose={() => {}}
          />
        </div>
      )}

      {/* Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 py-4 flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <SidebarContent
                      selectedPublicAdvisors={[]}
                      onSelectPublicAdvisor={() => {}}
                      onRemovePublicAdvisor={() => {}}
                      onShowAdvisorDirectory={() => {
                        window.history.back();
                      }}
                      onClose={() => {}}
                    />
                  </SheetContent>
                </Sheet>
              )}
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold truncate">{agent.name}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {agent.title || agent.subject || agent.type}
                </p>
              </div>
            </div>
            <InfoModal />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto px-4 sm:p-4 pt-6 min-h-0">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`${index === 0 ? 'mt-0' : 'mt-2'} mb-2 flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`rounded-lg px-3 py-2 text-sm max-w-[85%] sm:max-w-[75%] md:max-w-[60%] lg:max-w-[40%] xl:max-w-[30%] ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {message.content}
                {!message.isComplete && message.role === 'system' && message.content && (
                  <span className="animate-pulse">|</span>
                )}
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-background flex-shrink-0 sticky bottom-0 z-10">
          <TextInput 
            onSendMessage={textChat.sendMessage}
            disabled={textChat.isProcessing}
            placeholder={
              textChat.isProcessing 
                ? `${agent.name} is typing...` 
                : `Message ${agent.name}...`
            }
          />
        </div>
      </div>
    </div>
  );
};

export default StudentChat;
