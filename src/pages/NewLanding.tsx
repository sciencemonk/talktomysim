import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MatrixHeroSection } from "@/components/landing/MatrixHeroSection";
import AuthModal from "@/components/AuthModal";
import { UnifiedAgentCreation } from "@/components/UnifiedAgentCreation";
import SimDetailModal from "@/components/SimDetailModal";
import { AgentType } from "@/types/agent";
import { HackathonAnnouncementModal } from "@/components/HackathonAnnouncementModal";
import { ScrollingSimsRows } from "@/components/landing/ScrollingSimsRows";
import { LandingFooter } from "@/components/landing/LandingFooter";

const NewLanding = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSim, setSelectedSim] = useState<AgentType | null>(null);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

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

  const handleSimClick = (sim: AgentType) => {
    setSelectedSim(sim);
    setIsSimModalOpen(true);
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

      <SimDetailModal
        sim={selectedSim}
        open={isSimModalOpen}
        onOpenChange={setIsSimModalOpen}
        onAuthRequired={() => {
          setAuthModalOpen(true);
          setTimeout(() => setIsSimModalOpen(false), 100);
        }}
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
