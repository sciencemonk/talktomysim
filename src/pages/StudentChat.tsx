
import { useParams } from "react-router-dom";
import { usePublicAgent } from "@/hooks/usePublicAgent";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Menu } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/TextInput";
import { InfoModal } from "@/components/InfoModal";
import { useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarContent } from "@/components/UserSidebar";

const StudentChat = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { agent, isLoading, error } = usePublicAgent(agentId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const {
    messages,
    isConnected,
    isSpeaking,
    connectionStatus,
    sendTextMessage,
    currentMessage
  } = useRealtimeChat({ agent });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header Skeleton */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
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
    );
  }

  if (error || !agent) {
    return (
      <div className="h-screen flex items-center justify-center">
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
    );
  }

  return (
    <div className="flex flex-col h-screen w-full">
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
      <div className="flex-1 overflow-auto px-4 sm:p-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`rounded-lg px-3 py-2 text-sm max-w-[85%] sm:max-w-[75%] md:max-w-[60%] lg:max-w-[40%] xl:max-w-[30%] ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {/* Show current AI message being typed */}
        {currentMessage && (
          <div className="mb-2 flex flex-col items-start">
            <div className="rounded-lg px-3 py-2 text-sm max-w-[85%] sm:max-w-[75%] md:max-w-[60%] lg:max-w-[40%] xl:max-w-[30%] bg-secondary text-secondary-foreground">
              {currentMessage}
              {isSpeaking && <span className="animate-pulse">|</span>}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-background flex-shrink-0 sticky bottom-0 z-10">
        <TextInput 
          onSendMessage={sendTextMessage}
          disabled={!isConnected || isSpeaking}
          placeholder={
            !isConnected 
              ? "Connecting..." 
              : isSpeaking 
                ? `${agent.name} is speaking...` 
                : `Message ${agent.name}...`
          }
        />
      </div>
    </div>
  );
};

export default StudentChat;
