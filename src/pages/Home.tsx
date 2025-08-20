
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import UserSidebar from "@/components/UserSidebar";
import ChatInterface from "@/components/ChatInterface";
import ChildProfile from "@/pages/ChildProfile";
import Settings from "@/pages/Settings";
import AgentCreate from "@/pages/AgentCreate";
import { AgentType } from "@/types/agent";
import { useAgents } from "@/hooks/useAgents";
import { useIsMobile } from "@/hooks/use-mobile";

const Home = () => {
  const { user } = useAuth();
  const { agents } = useAgents();
  const isMobile = useIsMobile();
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [currentView, setCurrentView] = useState<'chat' | 'child-profile' | 'settings' | 'agents' | 'agent-create'>('chat');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectAgent = useCallback((agent: AgentType) => {
    setSelectedAgent(agent);
    setCurrentView('chat');
  }, []);

  const handleAgentUpdate = useCallback((updatedAgent: AgentType) => {
    setSelectedAgent(updatedAgent);
    // Trigger sidebar refresh to show updated agent name
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleShowChildProfile = () => setCurrentView('child-profile');
  const handleShowSettings = () => setCurrentView('settings');
  const handleShowAgents = () => setCurrentView('agents');
  const handleShowAgentCreate = () => setCurrentView('agent-create');

  // Set first agent as selected if none selected
  if (!selectedAgent && agents.length > 0) {
    setSelectedAgent(agents[0]);
  }

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
              setCurrentView('chat');
              setRefreshTrigger(prev => prev + 1);
            }}
          />
        );
      case 'chat':
      default:
        if (!selectedAgent) {
          return (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-xl text-muted-foreground mb-4">No thinking partners yet</p>
                <p className="text-muted-foreground">Create your first thinking partner to get started!</p>
              </div>
            </div>
          );
        }
        return (
          <ChatInterface 
            agent={selectedAgent} 
            onAgentUpdate={handleAgentUpdate}
          />
        );
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      {!isMobile && (
        <UserSidebar
          onShowSettings={handleShowSettings}
          onShowChildProfile={handleShowChildProfile}
          onShowAgents={handleShowAgents}
          onShowAgentCreate={handleShowAgentCreate}
          selectedAgent={selectedAgent}
          onSelectAgent={handleSelectAgent}
          refreshTrigger={refreshTrigger}
        />
      )}
      
      <div className={`flex-1 flex flex-col min-w-0 ${isMobile ? 'pl-0' : ''}`}>
        {isMobile && (
          <UserSidebar
            onShowSettings={handleShowSettings}
            onShowChildProfile={handleShowChildProfile}
            onShowAgents={handleShowAgents}
            onShowAgentCreate={handleShowAgentCreate}
            selectedAgent={selectedAgent}
            onSelectAgent={handleSelectAgent}
            refreshTrigger={refreshTrigger}
          />
        )}
        {renderMainContent()}
      </div>
    </div>
  );
};

export default Home;
