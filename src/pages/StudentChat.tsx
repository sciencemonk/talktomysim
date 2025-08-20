
import { useParams } from "react-router-dom";
import { usePublicAgent } from "@/hooks/usePublicAgent";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { TextInput } from "@/components/TextInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const StudentChat = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { agent, isLoading, error } = usePublicAgent(agentId);
  const realtimeChat = useRealtimeChat({ agent: agent! });

  const handleEdit = () => {
    // Navigate to agent detail page for editing
    window.location.href = `/agents/${agentId}`;
  };

  // Combine messages with current partial message if speaking
  const allMessages = [...realtimeChat.messages];
  if (realtimeChat.currentMessage && realtimeChat.isSpeaking) {
    allMessages.push({
      id: 'current',
      role: 'system' as const,
      content: realtimeChat.currentMessage,
      timestamp: new Date(),
      isComplete: false
    });
  }

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header Skeleton */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-5">
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
    <div className="h-screen flex flex-col">
      {/* Header - ChatGPT style */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-5">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-lg">{agent.name}</h1>
              <p className="text-sm text-muted-foreground">{agent.type} • {agent.subject || 'General'}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleEdit} className="gap-2 text-sm">
            <Settings className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Chat Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          {allMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6">
              <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mb-6">
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">How can I help you today?</h2>
              <p className="text-base text-muted-foreground text-center max-w-md leading-relaxed">
                {realtimeChat.connectionStatus === 'connecting' 
                  ? 'Getting ready to chat...' 
                  : realtimeChat.connectionStatus === 'error'
                  ? 'Connection error - please refresh'
                  : `I'm ${agent.name}, ready to help you learn and explore ideas together!`
                }
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="space-y-8">
                {allMessages.map((message) => (
                  <div key={message.id} className="flex gap-4">
                    {message.role === 'system' && (
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    {message.role === 'user' && (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium">You</span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-base leading-relaxed whitespace-pre-wrap break-words mb-0 font-medium">
                          {message.content}
                        </p>
                      </div>
                      
                      {!message.isComplete && message.role === 'system' && (
                        <div className="flex items-center gap-1 mt-3">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="border-t bg-background">
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
