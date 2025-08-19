
import { useParams } from "react-router-dom";
import { usePublicAgent } from "@/hooks/usePublicAgent";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { ChatInterface } from "@/components/ChatInterface";
import { TextInput } from "@/components/TextInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ChildChat = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { agent, isLoading, error } = usePublicAgent(agentId);
  const realtimeChat = useRealtimeChat({ agent: agent! });

  const handleBack = () => {
    // Navigate to dashboard instead of tutor detail page
    window.location.href = `/dashboard`;
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
      <div className="h-screen flex flex-col bg-gradient-to-br from-bg via-bgMuted to-bg">
        <div className="border-b bg-bg/80 backdrop-blur-xl p-4">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandBlue mx-auto mb-4"></div>
            <p className="text-fgMuted">Loading thinking partner...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-bg via-bgMuted to-bg">
        <div className="border-b bg-bg/80 backdrop-blur-xl p-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={handleBack} className="gap-2 text-fg hover:text-fg">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-3xl flex items-center justify-center mb-6">
              <Bot className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="font-semibold text-fg mb-2 text-xl">Thinking Partner Not Available</h3>
            <p className="text-fgMuted">
              {error || "This thinking partner is not available for chat."}
            </p>
            <Button onClick={handleBack} className="mt-6">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-bg via-bgMuted to-bg">
      {/* Simplified Header - removed duplicate avatar */}
      <div className="border-b bg-bg/80 backdrop-blur-xl p-4 shadow-sm border-border/20">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleBack} className="gap-2 text-fgMuted hover:text-fg">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border/50" />
            <Avatar className="h-10 w-10 border-2 border-brandBlue/20">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-gradient-to-br from-brandBlue to-brandPurple text-white">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-fg">{agent.name}</h1>
              <p className="text-sm text-fgMuted">{agent.type} • {agent.subject || 'General'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface - pass simplified props to avoid duplicate rendering */}
      <div className="flex-1 overflow-hidden flex flex-col">
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
        <div className="border-t border-border/20 bg-bg/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto">
            <TextInput
              onSendMessage={realtimeChat.sendTextMessage}
              disabled={!realtimeChat.isConnected}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildChat;
