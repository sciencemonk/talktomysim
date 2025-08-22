import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import AdvisorDirectory from "@/components/AdvisorDirectory";
import ChatInterface from "@/components/ChatInterface";
import AuthModal from "@/components/AuthModal";
import UserSidebar, { SidebarContent } from "@/components/UserSidebar";
import MySim from "@/components/MySim";
import BasicInfo from "@/components/BasicInfo";
import InteractionModel from "@/components/InteractionModel";
import CoreKnowledge from "@/components/CoreKnowledge";
import { AgentType } from "@/types/agent";
import { useUserAdvisors } from "@/hooks/useUserAdvisors";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

type ViewType = 'directory' | 'my-sim' | 'basic-info' | 'interaction-model' | 'core-knowledge';

const Home = () => {
  const { user, loading } = useAuth();
  const { advisorsAsAgents, addAdvisor, removeAdvisor } = useUserAdvisors();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedAdvisor, setSelectedAdvisor] = useState<AgentType | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [selectedPublicAdvisorId, setSelectedPublicAdvisorId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('directory');
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

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
    setMobileSheetOpen(false); // Close mobile sheet
  };

  // Handle public advisor selection from sidebar
  const handlePublicAdvisorSelect = (advisorId: string, advisor?: AgentType) => {
    setSelectedPublicAdvisorId(advisorId);
    if (advisor) {
      setSelectedAdvisor(advisor);
    }
    setSelectedAgent(null);
    setCurrentView('directory'); // Reset view when selecting public advisor
    setMobileSheetOpen(false); // Close mobile sheet
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
    setMobileSheetOpen(false); // Close mobile sheet
  };

  // Handle navigation to different views
  const handleNavigateToMySim = () => {
    setCurrentView('my-sim');
    setSelectedAgent(null);
    setSelectedAdvisor(null);
    setSelectedPublicAdvisorId(null);
    setMobileSheetOpen(false); // Close mobile sheet
  };

  const handleNavigateToBasicInfo = () => {
    setCurrentView('basic-info');
    setSelectedAgent(null);
    setSelectedAdvisor(null);
    setSelectedPublicAdvisorId(null);
    setMobileSheetOpen(false); // Close mobile sheet
  };

  const handleNavigateToInteractionModel = () => {
    setCurrentView('interaction-model');
    setSelectedAgent(null);
    setSelectedAdvisor(null);
    setSelectedPublicAdvisorId(null);
    setMobileSheetOpen(false); // Close mobile sheet
  };

  const handleNavigateToCoreKnowledge = () => {
    setCurrentView('core-knowledge');
    setSelectedAgent(null);
    setSelectedAdvisor(null);
    setSelectedPublicAdvisorId(null);
    setMobileSheetOpen(false); // Close mobile sheet
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
      
      <div className="flex-1 flex flex-col">
        {/* Mobile Header - shared across all views */}
        <div className="md:hidden bg-card border-b border-border p-4">
          <div className="flex items-center">
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <SidebarContent
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
                  onClose={() => setMobileSheetOpen(false)}
                />
              </SheetContent>
            </Sheet>
            
            <div className="flex-1 flex justify-center">
              <img 
                src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
                alt="Logo" 
                className="h-8 w-8 object-contain"
              />
            </div>
            
            {/* Invisible spacer to balance the hamburger menu */}
            <div className="flex-shrink-0 w-10"></div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {renderMainContent()}
        </div>
      </div>
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={handleAuthModalClose}
      />
    </div>
  );
};

export default Home;
