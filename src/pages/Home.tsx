import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import AdvisorDirectory from "@/components/AdvisorDirectory";
import ChatInterface from "@/components/ChatInterface";
import AuthModal from "@/components/AuthModal";
import UserSidebar from "@/components/UserSidebar";
import MySim from "@/components/MySim";
import BasicInfo from "@/components/BasicInfo";
import InteractionModel from "@/components/InteractionModel";
import CoreKnowledge from "@/components/CoreKnowledge";
import { AgentType } from "@/types/agent";
import { useUserAdvisors } from "@/hooks/useUserAdvisors";
import { useToast } from "@/hooks/use-toast";

type ViewType = 'directory' | 'my-sim' | 'basic-info' | 'interaction-model' | 'core-knowledge';

const Home = () => {
  const { user, loading } = useAuth();
  const { advisorsAsAgents, addAdvisor, removeAdvisor } = useUserAdvisors();
  const { toast } = useToast();
  const [selectedAdvisor, setSelectedAdvisor] = useState<AgentType | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [selectedPublicAdvisorId, setSelectedPublicAdvisorId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('directory');

  // Handle auth modal close
  const handleAuthModalClose = (open: boolean) => {
    setShowAuthModal(open);
  };

  // Handle auth required (when non-signed-in user tries to start chat)
  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  // Handle advisor selection from directory
  const handleAdvisorSelect = async (advisorId: string, advisor?: AgentType) => {
    if (!user) {
      // Show auth modal for non-signed-in users
      setShowAuthModal(true);
    } else {
      // User is signed in, proceed directly
      if (advisor) {
        // Check if advisor is already in user's list
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
        
        setSelectedAdvisor(advisor);
        setSelectedPublicAdvisorId(advisor.id);
        setCurrentView('directory'); // Reset view when selecting advisor
      }
    }
  };

  // Handle agent selection from sidebar
  const handleAgentSelect = (agent: AgentType) => {
    setSelectedAgent(agent);
    setSelectedAdvisor(null);
    setSelectedPublicAdvisorId(null);
    setCurrentView('directory'); // Reset view when selecting agent
  };

  // Handle public advisor selection from sidebar
  const handlePublicAdvisorSelect = (advisorId: string, advisor?: AgentType) => {
    setSelectedPublicAdvisorId(advisorId);
    if (advisor) {
      setSelectedAdvisor(advisor);
    }
    setSelectedAgent(null);
    setCurrentView('directory'); // Reset view when selecting public advisor
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
    setCurrentView('directory');
  };

  // Handle navigation to different views
  const handleNavigateToMySim = () => {
    setCurrentView('my-sim');
    setSelectedAgent(null);
    setSelectedAdvisor(null);
    setSelectedPublicAdvisorId(null);
  };

  const handleNavigateToBasicInfo = () => {
    setCurrentView('basic-info');
    setSelectedAgent(null);
    setSelectedAdvisor(null);
    setSelectedPublicAdvisorId(null);
  };

  const handleNavigateToInteractionModel = () => {
    setCurrentView('interaction-model');
    setSelectedAgent(null);
    setSelectedAdvisor(null);
    setSelectedPublicAdvisorId(null);
  };

  const handleNavigateToCoreKnowledge = () => {
    setCurrentView('core-knowledge');
    setSelectedAgent(null);
    setSelectedAdvisor(null);
    setSelectedPublicAdvisorId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Determine which agent/advisor to show in chat
  const currentChatAgent = selectedAgent || selectedAdvisor;

  // Render the appropriate content based on current view and selections
  const renderMainContent = () => {
    // If there's a chat agent selected, show chat interface
    if (currentChatAgent) {
      return (
        <ChatInterface
          agent={currentChatAgent}
          onBack={() => {
            setSelectedAgent(null);
            setSelectedAdvisor(null);
            setSelectedPublicAdvisorId(null);
            setCurrentView('directory');
          }}
        />
      );
    }

    // Otherwise, show the appropriate view
    switch (currentView) {
      case 'my-sim':
        return <MySim />;
      case 'basic-info':
        return <BasicInfo />;
      case 'interaction-model':
        return <InteractionModel />;
      case 'core-knowledge':
        return <CoreKnowledge />;
      case 'directory':
      default:
        return (
          <AdvisorDirectory 
            onSelectAdvisor={handleAdvisorSelect}
            onAuthRequired={handleAuthRequired}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <UserSidebar
        selectedAgent={selectedAgent}
        selectedPublicAdvisorId={selectedPublicAdvisorId}
        selectedPublicAdvisors={advisorsAsAgents}
        onSelectAgent={handleAgentSelect}
        onSelectPublicAdvisor={handlePublicAdvisorSelect}
        onRemovePublicAdvisor={handleRemovePublicAdvisor}
        onShowAdvisorDirectory={handleShowAdvisorDirectory}
        onNavigateToMySim={handleNavigateToMySim}
        onNavigateToBasicInfo={handleNavigateToBasicInfo}
        onNavigateToInteractionModel={handleNavigateToInteractionModel}
        onNavigateToCoreKnowledge={handleNavigateToCoreKnowledge}
      />
      
      <div className="flex-1">
        {renderMainContent()}
      </div>
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={handleAuthModalClose}
      />
    </div>
  );
};

export default Home;
