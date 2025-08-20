
import { useParams } from "react-router-dom";
import { usePublicAgent } from "@/hooks/usePublicAgent";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { ChatInterface } from "@/components/ChatInterface";
import { TextInput } from "@/components/TextInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ChildChat = () => {
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
      <div className="h-full flex flex-col">
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
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
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-destructive/20 rounded-3xl flex items-center justify-center mb-6">
            <Bot className="h-12 w-12 text-destructive" />
          </div>
          <h3 className="font-semibold mb-2 text-xl">Thinking Partner Not Available</h3>
          <p className="text-muted-foreground">
            {error || "This thinking partner is not available for chat."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={agent.avatar} alt={agent.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold">{agent.name}</h1>
            <p className="text-sm text-muted-foreground">{agent.type} • {agent.subject || 'General'}</p>
          </div>
        </div>
        
        {/* Edit Button */}
        <Button variant="outline" onClick={handleEdit} className="gap-2">
          <Settings className="h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Chat Interface - simplified for text-based chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1">
          <ChatInterface 
            agent={agent}
            messages={allMessages}
            isConnected={realtimeChat.isConnected}
            isSpeaking={realtimeChat.isSpeaking}
            connectionStatus={realtimeChat.connectionStatus}
            hideHeader={true}
          />
        </div>
        
        {/* Text Input */}
        <div className="border-t">
          <TextInput
            onSendMessage={realtimeChat.sendTextMessage}
            disabled={!realtimeChat.isConnected}
          />
        </div>
      </div>
    </div>
  );
};

export default ChildChat;
