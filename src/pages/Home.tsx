
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import AgentUserSidebar from "@/components/AgentUserSidebar";
import UserAdvisorChat from "@/components/UserAdvisorChat";
import ChildProfile from "@/pages/ChildProfile";
import Settings from "@/pages/Settings";
import { UserAdvisor } from "@/services/userAdvisorService";
import { useUserAdvisors } from "@/hooks/useUserAdvisors";
import { useIsMobile } from "@/hooks/use-mobile";

const Home = () => {
  const { user } = useAuth();
  const { userAdvisors } = useUserAdvisors();
  const isMobile = useIsMobile();
  const [selectedAdvisor, setSelectedAdvisor] = useState<UserAdvisor | null>(null);
  const [currentView, setCurrentView] = useState<'chat' | 'child-profile' | 'settings'>('chat');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectAdvisor = useCallback((advisor: UserAdvisor) => {
    setSelectedAdvisor(advisor);
    setCurrentView('chat');
  }, []);

  const handleShowChildProfile = () => setCurrentView('child-profile');
  const handleShowSettings = () => setCurrentView('settings');

  // Set first advisor as selected if none selected
  if (!selectedAdvisor && userAdvisors.length > 0) {
    setSelectedAdvisor(userAdvisors[0]);
  }

  const renderMainContent = () => {
    switch (currentView) {
      case 'child-profile':
        return <ChildProfile />;
      case 'settings':
        return <Settings />;
      case 'chat':
      default:
        if (!selectedAdvisor) {
          return (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-xl text-muted-foreground mb-4">No advisors yet</p>
                <p className="text-muted-foreground">Find and add AI advisors to get started!</p>
              </div>
            </div>
          );
        }
        return (
          <UserAdvisorChat advisor={selectedAdvisor} />
        );
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      {!isMobile && (
        <AgentUserSidebar
          onShowSettings={handleShowSettings}
          onShowChildProfile={handleShowChildProfile}
          selectedAdvisor={selectedAdvisor}
          onSelectAdvisor={handleSelectAdvisor}
          refreshTrigger={refreshTrigger}
        />
      )}
      
      <div className={`flex-1 flex flex-col min-w-0 ${isMobile ? 'pl-0' : ''}`}>
        {isMobile && (
          <AgentUserSidebar
            onShowSettings={handleShowSettings}
            onShowChildProfile={handleShowChildProfile}
            selectedAdvisor={selectedAdvisor}
            onSelectAdvisor={handleSelectAdvisor}
            refreshTrigger={refreshTrigger}
          />
        )}
        {renderMainContent()}
      </div>
    </div>
  );
};

export default Home;
