
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import UserSidebar from "@/components/UserSidebar";
import ChatInterface from "@/components/ChatInterface";
import ChildProfile from "@/pages/ChildProfile";
import Settings from "@/pages/Settings";
import AgentCreate from "@/pages/AgentCreate";
import AdvisorDirectory from "@/components/AdvisorDirectory";
import AuthModal from "@/components/AuthModal";
import { AgentType } from "@/types/agent";
import { useAgents } from "@/hooks/useAgents";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAdvisorDetail } from "@/hooks/useAdvisorDetail";

const Home = () => {
  const { user } = useAuth();
  const { agents } = useAgents();
  const isMobile = useIsMobile();
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string | null>(null);
  const [selectedAdvisors, setSelectedAdvisors] = useState<AgentType[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Show advisor directory by default for new users (no agents and no selected advisors)
  const getDefaultView = () => {
    if (!selectedAgent && !selectedAdvisorId && agents.length === 0 && selectedAdvisors.length === 0) {
      return 'advisor-directory';
    }
    return 'chat';
  };
  
  const [currentView, setCurrentView] = useState<'chat' | 'child-profile' | 'settings' | 'agents' | 'agent-create' | 'advisor-directory'>(getDefaultView());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load advisor data when selected
  const { advisor: publicAdvisor, isLoading: advisorLoading, error: advisorError } = useAdvisorDetail(selectedAdvisorId);

  const handleSelectAgent = useCallback((agent: AgentType) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedAgent(agent);
    setSelectedAdvisorId(null); // Clear advisor when selecting personal agent
    setCurrentView('chat');
  }, [user]);

  const handleAgentUpdate = useCallback((updatedAgent: AgentType) => {
    setSelectedAgent(updatedAgent);
    // Trigger sidebar refresh to show updated agent name
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleShowChildProfile = () => setCurrentView('child-profile');
  const handleShowSettings = () => setCurrentView('settings');
  const handleShowAgents = () => setCurrentView('agents');
  const handleShowAgentCreate = () => setCurrentView('agent-create');
  const handleShowAdvisorDirectory = () => setCurrentView('advisor-directory');

  const handleSelectAdvisor = useCallback((advisorId: string, advisor?: AgentType) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    console.log('Selecting advisor:', advisorId);
    setSelectedAdvisorId(advisorId);
    setSelectedAgent(null); // Clear personal agent when selecting advisor
    
    // Add advisor to the selected list if not already there and we have advisor data
    if (advisor && !selectedAdvisors.find(a => a.id === advisorId)) {
      setSelectedAdvisors(prev => [...prev, advisor]);
    }
    
    // Always switch to chat view when selecting an advisor
    setCurrentView('chat');
  }, [selectedAdvisors, user]);

  const handleSelectPublicAdvisor = useCallback((advisorId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    console.log('Selecting existing advisor from sidebar:', advisorId);
    setSelectedAdvisorId(advisorId);
    setSelectedAgent(null); // Clear personal agent when selecting advisor
    
    // Always switch to chat view when selecting an advisor from sidebar
    setCurrentView('chat');
  }, [user]);

  const handleRemoveAdvisor = useCallback((advisorId: string) => {
    // Remove from selected advisors list
    setSelectedAdvisors(prev => prev.filter(a => a.id !== advisorId));
    
    // If this was the currently selected advisor, clear it
    if (selectedAdvisorId === advisorId) {
      setSelectedAdvisorId(null);
      
      // If no other agents available, show advisor directory
      if (agents.length === 0 && selectedAdvisors.length <= 1) {
        setCurrentView('advisor-directory');
      }
    }
  }, [selectedAdvisorId, agents.length, selectedAdvisors.length]);

  // Set first agent as selected if none selected and we're in chat view and user is authenticated
  if (user && !selectedAgent && !selectedAdvisorId && agents.length > 0 && currentView === 'chat') {
    setSelectedAgent(agents[0]);
  }

  // Determine which agent to show in chat
  const activeAgent = selectedAgent || publicAdvisor;

  // Check if we're waiting for an advisor to load
  const isWaitingForAdvisor = selectedAdvisorId && !publicAdvisor && advisorLoading;

  const renderMainContent = () => {
    switch (currentView) {
      case 'child-profile':
        return <ChildProfile />;
      case 'settings':
        return <Settings />;
      case 'agent-create':
        return (
          <AgentCreate 
            onAgentCreated={(agent) => {
              setSelectedAgent(agent);
              setSelectedAdvisorId(null);
              setCurrentView('chat');
              setRefreshTrigger(prev => prev + 1);
            }}
          />
        );
      case 'advisor-directory':
        return <AdvisorDirectory onSelectAdvisor={handleSelectAdvisor} />;
      case 'chat':
      default:
        // Show loading state if we're waiting for an advisor to load
        if (isWaitingForAdvisor) {
          return (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-xl text-muted-foreground">Loading advisor...</p>
              </div>
            </div>
          );
        }

        // Show error state if there's an error loading the advisor
        if (selectedAdvisorId && advisorError) {
          return (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-xl text-muted-foreground mb-4">Unable to load advisor</p>
                <p className="text-muted-foreground">{advisorError}</p>
              </div>
            </div>
          );
        }

        // Show chat interface if we have an active agent
        if (activeAgent) {
          return (
            <ChatInterface 
              agent={activeAgent} 
              onAgentUpdate={handleAgentUpdate}
            />
          );
        }

        // Show fallback message when no agent is available
        return (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <p className="text-xl text-muted-foreground mb-4">No thinking partners yet</p>
              <p className="text-muted-foreground">Browse advisors to start a new chat!</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {!isMobile && (
        <UserSidebar
          onShowSettings={handleShowSettings}
          onShowChildProfile={handleShowChildProfile}
          onShowAgents={handleShowAgents}
          onShowAdvisorDirectory={handleShowAdvisorDirectory}
          selectedAgent={selectedAgent}
          selectedPublicAdvisorId={selectedAdvisorId}
          selectedPublicAdvisors={selectedAdvisors}
          onSelectAgent={handleSelectAgent}
          onSelectPublicAdvisor={handleSelectPublicAdvisor}
          onRemovePublicAdvisor={handleRemoveAdvisor}
          refreshTrigger={refreshTrigger}
        />
      )}
      
      <div className={`flex-1 flex flex-col min-w-0 ${isMobile ? 'pl-0' : ''}`}>
        {isMobile && (
          <UserSidebar
            onShowSettings={handleShowSettings}
            onShowChildProfile={handleShowChildProfile}
            onShowAgents={handleShowAgents}
            onShowAdvisorDirectory={handleShowAdvisorDirectory}
            selectedAgent={selectedAgent}
            selectedPublicAdvisorId={selectedAdvisorId}
            selectedPublicAdvisors={selectedAdvisors}
            onSelectAgent={handleSelectAgent}
            onSelectPublicAdvisor={handleSelectPublicAdvisor}
            onRemovePublicAdvisor={handleRemoveAdvisor}
            refreshTrigger={refreshTrigger}
          />
        )}
        {renderMainContent()}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal} 
      />
    </div>
  );
};

export default Home;
