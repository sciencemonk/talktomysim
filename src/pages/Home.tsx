
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
import { usePublicAgent } from "@/hooks/usePublicAgent";

const Home = () => {
  const { user } = useAuth();
  const { agents } = useAgents();
  const isMobile = useIsMobile();
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [selectedPublicAdvisorId, setSelectedPublicAdvisorId] = useState<string | null>(null);
  const [selectedPublicAdvisors, setSelectedPublicAdvisors] = useState<AgentType[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Show advisor directory by default for new users (no agents and no selected advisors)
  const getDefaultView = () => {
    if (!selectedAgent && !selectedPublicAdvisorId && agents.length === 0 && selectedPublicAdvisors.length === 0) {
      return 'advisor-directory';
    }
    return 'chat';
  };
  
  const [currentView, setCurrentView] = useState<'chat' | 'child-profile' | 'settings' | 'agents' | 'agent-create' | 'advisor-directory'>(getDefaultView());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load public advisor data when selected
  const { agent: publicAgent, isLoading: publicAgentLoading, error: publicAgentError } = usePublicAgent(selectedPublicAdvisorId);

  const handleSelectAgent = useCallback((agent: AgentType) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedAgent(agent);
    setSelectedPublicAdvisorId(null); // Clear public advisor when selecting personal agent
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
    setSelectedPublicAdvisorId(advisorId);
    setSelectedAgent(null); // Clear personal agent when selecting public advisor
    
    // Add advisor to the selected list if not already there and we have advisor data
    if (advisor && !selectedPublicAdvisors.find(a => a.id === advisorId)) {
      setSelectedPublicAdvisors(prev => [...prev, advisor]);
    }
    
    // Always switch to chat view when selecting an advisor
    setCurrentView('chat');
  }, [selectedPublicAdvisors, user]);

  const handleSelectPublicAdvisor = useCallback((advisorId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    console.log('Selecting existing public advisor from sidebar:', advisorId);
    setSelectedPublicAdvisorId(advisorId);
    setSelectedAgent(null); // Clear personal agent when selecting public advisor
    
    // Always switch to chat view when selecting an advisor from sidebar
    setCurrentView('chat');
  }, [user]);

  const handleRemoveAdvisor = useCallback((advisorId: string) => {
    // Remove from selected advisors list
    setSelectedPublicAdvisors(prev => prev.filter(a => a.id !== advisorId));
    
    // If this was the currently selected advisor, clear it
    if (selectedPublicAdvisorId === advisorId) {
      setSelectedPublicAdvisorId(null);
      
      // If no other agents available, show advisor directory
      if (agents.length === 0 && selectedPublicAdvisors.length <= 1) {
        setCurrentView('advisor-directory');
      }
    }
  }, [selectedPublicAdvisorId, agents.length, selectedPublicAdvisors.length]);

  // Set first agent as selected if none selected and we're in chat view and user is authenticated
  if (user && !selectedAgent && !selectedPublicAdvisorId && agents.length > 0 && currentView === 'chat') {
    setSelectedAgent(agents[0]);
  }

  // Determine which agent to show in chat
  const activeAgent = selectedAgent || publicAgent;

  // Check if we're waiting for a public advisor to load
  const isWaitingForPublicAgent = selectedPublicAdvisorId && !publicAgent && publicAgentLoading;

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
              setSelectedPublicAdvisorId(null);
              setCurrentView('chat');
              setRefreshTrigger(prev => prev + 1);
            }}
          />
        );
      case 'advisor-directory':
        return <AdvisorDirectory onSelectAdvisor={handleSelectAdvisor} />;
      case 'chat':
      default:
        // Show loading state if we're waiting for a public agent to load
        if (isWaitingForPublicAgent) {
          return (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-xl text-muted-foreground">Loading advisor...</p>
              </div>
            </div>
          );
        }

        // Show error state if there's an error loading the public agent
        if (selectedPublicAdvisorId && publicAgentError) {
          return (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-xl text-muted-foreground mb-4">Unable to load advisor</p>
                <p className="text-muted-foreground">{publicAgentError}</p>
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
          selectedPublicAdvisorId={selectedPublicAdvisorId}
          selectedPublicAdvisors={selectedPublicAdvisors}
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
            selectedPublicAdvisorId={selectedPublicAdvisorId}
            selectedPublicAdvisors={selectedPublicAdvisors}
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
