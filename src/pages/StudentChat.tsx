
import { useParams } from "react-router-dom";
import { usePublicAgent } from "@/hooks/usePublicAgent";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { ChatInterface } from "@/components/ChatInterface";
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
      <div className="h-full flex flex-col bg-background">
        {/* Header Skeleton */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading thinking partner...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
            <Bot className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">Thinking Partner Not Available</h3>
          <p className="text-sm text-muted-foreground">
            {error || "This thinking partner is not available for chat."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Minimal Header - ChatGPT style */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-medium text-sm">{agent.name}</h1>
              <p className="text-xs text-muted-foreground">{agent.type} • {agent.subject || 'General'}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleEdit} className="gap-1.5 text-xs">
            <Settings className="h-3 w-3" />
            Edit
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          {allMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-medium mb-2">Ready to chat with {agent.name}</h2>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {realtimeChat.connectionStatus === 'connecting' 
                  ? 'Getting ready to chat...' 
                  : realtimeChat.connectionStatus === 'error'
                  ? 'Connection error - please refresh'
                  : 'Start by typing a message or question'
                }
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="space-y-6">
                {allMessages.map((message) => (
                  <div key={message.id} className="flex gap-4">
                    {message.role === 'system' && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium">U</span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mb-0">
                          {message.content}
                        </p>
                      </div>
                      
                      {!message.isComplete && message.role === 'system' && (
                        <div className="flex items-center gap-1 mt-2">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" />
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
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
