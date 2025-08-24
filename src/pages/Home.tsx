
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import AdvisorDirectory from "@/components/AdvisorDirectory";
import { ChatInterface } from "@/components/ChatInterface";
import AuthModal from "@/components/AuthModal";
import UserSidebar, { SidebarContent } from "@/components/UserSidebar";
import MySim from "@/components/MySim";
import BasicInfo from "@/components/BasicInfo";
import InteractionModel from "@/components/InteractionModel";
import { CoreKnowledge } from "@/components/CoreKnowledge";
import Integrations from "@/components/Integrations";
import Actions from "@/components/Actions";
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

type ViewType = 'directory' | 'my-sim' | 'basic-info' | 'interaction-model' | 'core-knowledge' | 'integrations' | 'actions' | 'search';

const Home = () => {
  const { user, loading } = useAuth();
  const { advisorsAsAgents, addAdvisor, removeAdvisor } = useUserAdvisors();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedAdvisor, setSelectedAdvisor] = useState<AgentType | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [selectedPublicAdvisorId, setSelectedPublicAdvisorId] = useState<string | null>(null);
  // Default to 'my-sim' for authenticated users, 'directory' for non-authenticated
  const [currentView, setCurrentView] = useState<ViewType>(user ? 'my-sim' : 'directory');
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Update default view when user authentication state changes
  useEffect(() => {
    if (user && currentView === 'directory') {
      setCurrentView('my-sim');
    } else if (!user && currentView !== 'directory') {
      setCurrentView('directory');
    }
  }, [user, currentView]);

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
        setCurrentView('search'); // Keep the search view when selecting advisor
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

  // Handle search navigation
  const handleNavigateToSearch = () => {
    setCurrentView('search');
    setSelectedAgent(null);
    setSelectedAdvisor(null);
    setSelectedPublicAdvisorId(null);
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

  const handleNavigateToIntegrations = () => {
    setCurrentView('integrations');
    setSelectedAgent(null);
    setSelectedAdvisor(null);
    setSelectedPublicAdvisorId(null);
    setMobileSheetOpen(false); // Close mobile sheet
  };

  const handleNavigateToActions = () => {
    setCurrentView('actions');
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
            // Return to the previous view context
            if (currentView === 'search') {
              setCurrentView('search');
            } else {
              setCurrentView('directory');
            }
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
        // Use the first available advisor ID, or user ID if no advisors
        const advisorId = selectedPublicAdvisorId || 
                         (advisorsAsAgents.length > 0 ? advisorsAsAgents[0].id : '') ||
                         user?.id || 
                         'default';
        return <CoreKnowledge advisorId={advisorId} />;
      case 'integrations':
        return <Integrations />;
      case 'actions':
        return <Actions />;
      case 'search':
        return (
          <AdvisorDirectory 
            onSelectAdvisor={handleAdvisorSelect}
            onAuthRequired={handleAuthRequired}
          />
        );
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

  // For non-signed in users, show the special layout with left sidebar
  if (!user) {
    return (
      <div className="flex h-screen bg-background">
        {/* Left Sidebar for non-signed in users */}
        <div className="hidden md:flex w-80 bg-card border-r border-border flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
                alt="Logo" 
                className="h-8 w-8 object-contain"
              />
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="space-y-6 text-center">
              <div>
                <h2 className="text-xl font-semibold mb-2">Create your free Sim today</h2>
              </div>
              
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90 animate-pulse rounded-lg py-3"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <div className="md:hidden bg-card border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
                  alt="Logo" 
                  className="h-8 w-8 object-contain"
                />
              </div>
              
              <Button 
                onClick={() => setShowAuthModal(true)}
                size="sm"
                className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90 animate-pulse"
              >
                Get Started
              </Button>
            </div>
          </div>
          
          {/* Directory Content */}
          <div className="flex-1">
            <AdvisorDirectory 
              onSelectAdvisor={handleAdvisorSelect}
              onAuthRequired={handleAuthRequired}
            />
          </div>
        </div>
        
        <AuthModal 
          open={showAuthModal} 
          onOpenChange={setShowAuthModal}
        />
      </div>
    );
  }

  // For signed-in users, show the regular layout
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
        onNavigateToIntegrations={handleNavigateToIntegrations}
        onNavigateToActions={handleNavigateToActions}
        onNavigateToSearch={handleNavigateToSearch}
        activeView={currentView}
        onAuthRequired={handleAuthRequired}
      />
      
      {/* Main content with left margin to account for fixed sidebar on desktop */}
      <div className="flex-1 flex flex-col md:ml-80">
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
                  onNavigateToIntegrations={handleNavigateToIntegrations}
                  onNavigateToActions={handleNavigateToActions}
                  onNavigateToSearch={handleNavigateToSearch}
                  activeView={currentView}
                  onClose={() => setMobileSheetOpen(false)}
                  onAuthRequired={handleAuthRequired}
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
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
};

export default Home;
