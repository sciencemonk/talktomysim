
import { useParams } from "react-router-dom";
import { usePublicAgent } from "@/hooks/usePublicAgent";
import { usePublicAgentByUrl } from "@/hooks/usePublicAgentByUrl";
import { ChatInterface } from "@/components/ChatInterface";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { Bot, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const StudentChat = () => {
  const params = useParams();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isMobile = useIsMobile();
  
  // Extract parameters based on the route structure
  // For /tutors/:agentId/chat -> params.agentId
  // For /:customUrl -> params.customUrl
  const agentId = params.agentId;
  const customUrl = params.customUrl;
  
  console.log('StudentChat params:', params);
  console.log('agentId:', agentId, 'customUrl:', customUrl);
  
  // Determine which hook to use based on the route parameters
  const publicAgentQuery = usePublicAgent(agentId || "");
  const publicAgentByUrlQuery = usePublicAgentByUrl(customUrl || "");
  
  // Use the appropriate query based on which parameter is present
  const query = agentId ? publicAgentQuery : publicAgentByUrlQuery;
  const { agent, isLoading, error } = query;

  // Redirect from legacy /tutors/:agentId route to custom URL route
  useEffect(() => {
    if (agent && agent.url && agentId && !customUrl) {
      // Replace the current URL with the custom URL route
      window.history.replaceState(null, '', `/${agent.url}`);
    }
  }, [agent, agentId, customUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Sim Not Found</h2>
              <p className="text-sm text-muted-foreground mb-4">
                The Sim you're looking for isn't active.
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Main content - full width */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          {/* Log agent details for debugging */}
          <div className="hidden">
            {console.log('StudentChat rendering with agent:', agent.id, agent.name)}
          </div>
          <ChatInterface 
            agent={agent}
            onBack={handleBack}
            onLoginClick={() => setShowAuthModal(true)}
            hasSidebar={false}
            key={`public-chat-${agent.id}`} /* Force re-render with unique key */
          />
        </div>
      </div>
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
};

export default StudentChat;
