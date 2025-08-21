
import { useParams } from "react-router-dom";
import { usePublicAgent } from "@/hooks/usePublicAgent";
import { usePublicAgentByUrl } from "@/hooks/usePublicAgentByUrl";
import ChatInterface from "@/components/ChatInterface";
import { Bot, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const StudentChat = () => {
  const { agentId, customUrl } = useParams<{ agentId?: string; customUrl?: string }>();
  
  // Determine which hook to use based on the route parameters
  const isLegacyRoute = !!agentId;
  const isCustomUrlRoute = !!customUrl && !agentId;
  
  // Use the appropriate hook based on the route type
  const legacyAgentResult = usePublicAgent(isLegacyRoute ? agentId : undefined);
  const customUrlAgentResult = usePublicAgentByUrl(isCustomUrlRoute ? customUrl : undefined);
  
  // Use the result from the appropriate hook
  const { agent, isLoading, error } = isLegacyRoute ? legacyAgentResult : customUrlAgentResult;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="font-semibold mb-2">Tutor Not Available</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {error || "The tutor you're looking for is not available right now."}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                >
                  Go Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="h-screen bg-background">
      <ChatInterface 
        agent={agent}
        onBack={handleBack}
      />
    </div>
  );
};

export default StudentChat;
