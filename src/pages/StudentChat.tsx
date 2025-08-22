
import { useParams } from "react-router-dom";
import { usePublicAgent } from "@/hooks/usePublicAgent";
import { usePublicAgentByUrl } from "@/hooks/usePublicAgentByUrl";
import ChatInterface from "@/components/ChatInterface";
import UserSidebar from "@/components/UserSidebar";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { Bot, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

const StudentChat = () => {
  const { agentId, customUrl } = useParams<{ agentId?: string; customUrl?: string }>();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
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

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  // On mobile, render just the chat interface without sidebar
  if (isMobile) {
    return (
      <>
        <div className="h-screen bg-background">
          <ChatInterface 
            agent={agent}
            onBack={handleBack}
          />
        </div>
        <AuthModal 
          open={showAuthModal} 
          onOpenChange={setShowAuthModal} 
        />
      </>
    );
  }

  // On desktop, always render with sidebar (for both signed-in and non-signed-in users)
  return (
    <>
      <div className="h-screen bg-background flex">
        <UserSidebar 
          selectedAgent={null}
          selectedPublicAdvisorId={null}
          selectedPublicAdvisors={[]}
          onSelectAgent={() => {}}
          onSelectPublicAdvisor={() => {}}
          onRemovePublicAdvisor={() => {}}
          onShowAdvisorDirectory={() => {}}
          onNavigateToMySim={() => {}}
          onNavigateToBasicInfo={() => {}}
          onNavigateToInteractionModel={() => {}}
          onNavigateToCoreKnowledge={() => {}}
          onNavigateToIntegrations={() => {}}
          onNavigateToSearch={() => {}}
          activeView="directory"
          onAuthRequired={handleAuthRequired} 
        />
        <div className="flex-1 md:ml-80">
          <ChatInterface 
            agent={agent}
            onBack={handleBack}
          />
        </div>
      </div>
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal} 
      />
    </>
  );
};

export default StudentChat;
