
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import UserSidebar from "@/components/UserSidebar";
import Settings from "@/pages/Settings";
import Billing from "@/pages/Billing";
import ChildProfile from "@/pages/ChildProfile";
import AgentsDashboard from "@/pages/AgentsDashboard";
import AgentCreate from "@/pages/AgentCreate";
import ChatInterface from "@/components/ChatInterface";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AgentType } from "@/types/agent";

type ModalType = 'settings' | 'billing' | 'child-profile' | 'agents' | 'agent-create' | null;

const Home = () => {
  const { user, loading } = useAuth();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const closeModal = () => setActiveModal(null);

  return (
    <div className="min-h-screen bg-background flex">
      <UserSidebar 
        onShowBilling={() => setActiveModal('billing')}
        onShowSettings={() => setActiveModal('settings')}
        onShowChildProfile={() => setActiveModal('child-profile')}
        onShowAgents={() => setActiveModal('agents')}
        onShowAgentCreate={() => setActiveModal('agent-create')}
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
      />
      
      <div className="flex-1 flex flex-col">
        {selectedAgent ? (
          <ChatInterface 
            agent={selectedAgent}
            onShowAgentDetails={() => setActiveModal('agents')}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-4">
              <img 
                src="/lovable-uploads/55ccce33-98a1-45d2-9e9e-7b446a02a417.png" 
                alt="Think With Me" 
                className="h-8 w-8"
              />
            </div>
            <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
              Choose a thinking partner from the sidebar to start learning together.
            </p>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <Dialog open={activeModal === 'settings'} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <Settings />
        </DialogContent>
      </Dialog>

      {/* Billing Modal */}
      <Dialog open={activeModal === 'billing'} onOpenChange={closeModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <Billing />
        </DialogContent>
      </Dialog>

      {/* Child Profile Modal */}
      <Dialog open={activeModal === 'child-profile'} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ChildProfile />
        </DialogContent>
      </Dialog>

      {/* Agents Dashboard Modal */}
      <Dialog open={activeModal === 'agents'} onOpenChange={closeModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <AgentsDashboard />
        </DialogContent>
      </Dialog>

      {/* Agent Creation Modal */}
      <Dialog open={activeModal === 'agent-create'} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AgentCreate />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
