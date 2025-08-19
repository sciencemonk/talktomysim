
import { useParams } from "react-router-dom";
import { usePublicAgent } from "@/hooks/usePublicAgent";
import { ChatInterface } from "@/components/ChatInterface";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ChildChat = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { agent, isLoading, error } = usePublicAgent(agentId);

  const handleBack = () => {
    if (agentId) {
      window.location.href = `/tutors/${agentId}`;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-white">
        <div className="border-b bg-white p-4">
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading thinking partner...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="h-screen flex flex-col bg-white">
        <div className="border-b bg-white p-4">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Bot className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">Thinking Partner Not Available</h3>
            <p className="text-slate-600">
              {error || "This thinking partner is not available for chat."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleBack} className="gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-blue-500 text-white">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-slate-900">{agent.name}</h1>
              <p className="text-sm text-slate-600">{agent.type} • {agent.subject || 'General'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface 
          agent={agent}
          messages={[]}
          isConnected={false}
          isSpeaking={false}
          connectionStatus="connecting"
        />
      </div>
    </div>
  );
};

export default ChildChat;
