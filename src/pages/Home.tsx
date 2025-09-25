
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import AdvisorDirectory from "@/components/AdvisorDirectory";
import ChatInterface from "@/components/ChatInterface";
import AuthModal from "@/components/AuthModal";
import UserSidebar from "@/components/UserSidebar";
import Footer from "@/components/Footer";
import { AgentType } from "@/types/agent";
import { useUserAdvisors } from "@/hooks/useUserAdvisors";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const { user, loading } = useAuth();
  const { advisorsAsAgents, addAdvisor, removeAdvisor } = useUserAdvisors();
  const { toast } = useToast();
  const [selectedAdvisor, setSelectedAdvisor] = useState<AgentType | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAdvisor, setPendingAdvisor] = useState<AgentType | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [selectedPublicAdvisorId, setSelectedPublicAdvisorId] = useState<string | null>(null);

  // Handle auth modal close
  const handleAuthModalClose = (open: boolean) => {
    setShowAuthModal(open);
    if (!open) {
      setPendingAdvisor(null);
    }
  };

  // Handle auth required (when non-signed-in user tries to start chat)
  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  // Handle advisor selection from directory
  const handleAdvisorSelect = async (advisorId: string, advisor?: AgentType) => {
    // Allow immediate chat for all users, authenticated or not
    if (advisor) {
      // If user is signed in, try to add to their list
      if (user) {
        const isAlreadyAdded = advisorsAsAgents.some(a => a.id === advisor.id);
        
        if (!isAlreadyAdded) {
          try {
            await addAdvisor(advisor);
          } catch (error) {
            console.error("Failed to add advisor:", error);
            toast({
              title: "Error",
              description: "Failed to add advisor to your list.",
              variant: "destructive"
            });
          }
        }
      }
      
      // Always allow chat regardless of authentication status
      setSelectedAdvisor(advisor);
      setSelectedPublicAdvisorId(advisor.id);
    }
  };

  // Handle agent selection from sidebar
  const handleAgentSelect = (agent: AgentType) => {
    setSelectedAgent(agent);
    setSelectedAdvisor(null);
    setSelectedPublicAdvisorId(null);
  };

  // Handle public advisor selection from sidebar
  const handlePublicAdvisorSelect = (advisorId: string, advisor?: AgentType) => {
    setSelectedPublicAdvisorId(advisorId);
    if (advisor) {
      setSelectedAdvisor(advisor);
    }
    setSelectedAgent(null);
  };

  // Handle removing public advisor
  const handleRemovePublicAdvisor = async (advisorId: string) => {
    try {
      await removeAdvisor(advisorId);
      if (selectedPublicAdvisorId === advisorId) {
        setSelectedPublicAdvisorId(null);
        setSelectedAdvisor(null);
      }
    } catch (error) {
      console.error("Failed to remove advisor:", error);
      toast({
        title: "Error",
        description: "Failed to remove advisor.",
        variant: "destructive"
      });
    }
  };

  // Handle showing advisor directory
  const handleShowAdvisorDirectory = () => {
    setSelectedAgent(null);
    setSelectedAdvisor(null);
    setSelectedPublicAdvisorId(null);
  };

  // Effect to handle post-authentication advisor selection
  useEffect(() => {
    if (user && pendingAdvisor && !selectedAdvisor) {
      handleAdvisorSelect(pendingAdvisor.id, pendingAdvisor);
      setPendingAdvisor(null);
      setShowAuthModal(false);
    }
  }, [user, pendingAdvisor, selectedAdvisor]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Determine which agent/advisor to show in chat
  const currentChatAgent = selectedAgent || selectedAdvisor;

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex flex-1 overflow-hidden">
        <UserSidebar
          selectedAgent={selectedAgent}
          selectedPublicAdvisorId={selectedPublicAdvisorId}
          selectedPublicAdvisors={advisorsAsAgents}
          onSelectAgent={handleAgentSelect}
          onSelectPublicAdvisor={handlePublicAdvisorSelect}
          onRemovePublicAdvisor={handleRemovePublicAdvisor}
          onShowAdvisorDirectory={handleShowAdvisorDirectory}
        />
        
        <div className="flex-1 overflow-auto">
          {currentChatAgent ? (
            <ChatInterface
              agent={currentChatAgent}
              onBack={() => {
                setSelectedAgent(null);
                setSelectedAdvisor(null);
                setSelectedPublicAdvisorId(null);
              }}
            />
          ) : (
            <AdvisorDirectory 
              onSelectAdvisor={handleAdvisorSelect}
              onAuthRequired={handleAuthRequired}
            />
          )}
        </div>
      </div>
      
      <Footer />
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={handleAuthModalClose}
      />
    </div>
  );
};

export default Home;
