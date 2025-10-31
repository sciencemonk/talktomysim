import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MatrixHeroSection } from "@/components/landing/MatrixHeroSection";
import AuthModal from "@/components/AuthModal";
import { UnifiedAgentCreation } from "@/components/UnifiedAgentCreation";
import { AgentType } from "@/types/agent";
import { HackathonAnnouncementModal } from "@/components/HackathonAnnouncementModal";
import { ScrollingSimsRows } from "@/components/landing/ScrollingSimsRows";
import { LandingFooter } from "@/components/landing/LandingFooter";

const NewLanding = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Check for create query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const createType = params.get('create');
    
    if (createType) {
      setShowCreateModal(true);
      // Clean up URL
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSimClick = (sim: AgentType) => {
    const simSlug = (sim as any).custom_url || generateSlug(sim.name);
    navigate(`/${simSlug}?chat=true`);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      <HackathonAnnouncementModal />
      
      <div className="flex-1 overflow-hidden">
        <MatrixHeroSection 
          onCreateAgent={() => setShowCreateModal(true)} 
          onSimClick={handleSimClick}
          onViewAllAgents={() => navigate('/agents')}
        />
      </div>

      <ScrollingSimsRows onSimClick={handleSimClick} />
      
      <LandingFooter />

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />

      <UnifiedAgentCreation
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default NewLanding;
