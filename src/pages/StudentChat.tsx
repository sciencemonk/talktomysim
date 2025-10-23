
import { useParams, useNavigate } from "react-router-dom";
import { usePublicAgent } from "@/hooks/usePublicAgent";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { TextInput } from "@/components/TextInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Menu, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState, useEffect } from "react";
import { ShareButton } from "@/components/ShareButton";
import { InfoModal } from "@/components/InfoModal";
import { useAuth } from "@/hooks/useAuth";

const StudentChat = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { agent, isLoading, error } = usePublicAgent(agentId);
  const realtimeChat = useRealtimeChat({ agent: agent! });
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Redirect non-authenticated users to bot check first
  useEffect(() => {
    // Allow both authenticated and anonymous users to access this page
    // No redirect needed - anonymous users can chat with public sims
  }, [user, authLoading, navigate, agentId]);

  // Combine messages with current partial message if speaking
  const allMessages = [...realtimeChat.messages];
  if (realtimeChat.currentMessage && realtimeChat.isSpeaking) {
    allMessages.push({
      id: 'current',
      role: 'assistant' as const,
      content: realtimeChat.currentMessage,
      timestamp: new Date(),
      isComplete: false
    });
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-base text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header Skeleton */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Skeleton className="h-10 w-10" />
              )}
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

  const MobileMenu = () => (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[300px]">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg">{agent.name}</h2>
              <p className="text-sm text-muted-foreground">{agent.title || agent.type}</p>
            </div>
          </div>
          
          <ShareButton 
            tutorId={agent.id}
            tutorName={agent.name}
            className="w-full justify-start"
          />
        </div>
      </DrawerContent>
    </Drawer>
  );

  return (
    <div className="h-screen flex flex-col w-full">
      {/* Header - Always visible and sticky on mobile */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 py-5 sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {isMobile && <MobileMenu />}
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
          
          {/* ShareButton and InfoModal */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isMobile && (
              <ShareButton 
                tutorId={agent.id}
                tutorName={agent.name}
              />
            )}
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
              <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mb-6">
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
              <div className="space-y-4">
                {allMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {(message.role === 'assistant' || message.role === 'system') && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={agent.avatar} alt={agent.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        
                        {!message.isComplete && (message.role === 'assistant' || message.role === 'system') && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" />
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                          </div>
                        )}
                      </div>
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

export default StudentChat;
