
import { useParams } from "react-router-dom";
import { usePublicAgent } from "@/hooks/usePublicAgent";
import ChatInterface from "@/components/ChatInterface";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const StudentChat = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { agent, isLoading, error } = usePublicAgent(agentId);

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
    <ChatInterface
      agent={agent}
      onBack={() => window.history.back()}
    />
  );
};

export default StudentChat;
