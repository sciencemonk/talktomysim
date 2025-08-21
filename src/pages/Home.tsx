
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import AdvisorDirectory from "@/components/AdvisorDirectory";
import ChatInterface from "@/components/ChatInterface";
import AuthModal from "@/components/AuthModal";
import { AgentType } from "@/types/agent";

const Home = () => {
  const { user, loading } = useAuth();
  const [selectedAdvisor, setSelectedAdvisor] = useState<AgentType | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAdvisor, setPendingAdvisor] = useState<AgentType | null>(null);

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

  // Handle advisor selection
  const handleAdvisorSelect = (advisorId: string, advisor?: AgentType) => {
    if (!user) {
      // Store the advisor selection and show auth modal
      if (advisor) {
        setPendingAdvisor(advisor);
      }
      setShowAuthModal(true);
    } else {
      // User is signed in, proceed directly
      if (advisor) {
        setSelectedAdvisor(advisor);
      }
    }
  };

  // Effect to handle post-authentication advisor selection
  useEffect(() => {
    if (user && pendingAdvisor && !selectedAdvisor) {
      setSelectedAdvisor(pendingAdvisor);
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

  return (
    <div className="flex h-screen bg-background">
      {selectedAdvisor ? (
        <ChatInterface
          agent={selectedAdvisor}
          onBack={() => setSelectedAdvisor(null)}
        />
      ) : (
        <AdvisorDirectory 
          onSelectAdvisor={handleAdvisorSelect}
          onAuthRequired={handleAuthRequired}
        />
      )}
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={handleAuthModalClose}
      />
    </div>
  );
};

export default Home;
