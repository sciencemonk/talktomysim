import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MatrixHeroSection } from "@/components/landing/MatrixHeroSection";
import AuthModal from "@/components/AuthModal";
import { CreateSimModal } from "@/components/CreateSimModal";
import { CreateCABotModal } from "@/components/CreateCABotModal";
import SimDetailModal from "@/components/SimDetailModal";
import { AgentType } from "@/types/agent";
import { HackathonAnnouncementModal } from "@/components/HackathonAnnouncementModal";

const NewLanding = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showCreateSimModal, setShowCreateSimModal] = useState(false);
  const [showCreateCABotModal, setShowCreateCABotModal] = useState(false);
  const [selectedSim, setSelectedSim] = useState<AgentType | null>(null);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  // Check for create query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const createType = params.get('create');
    
    if (createType === 'sim') {
      setShowCreateSimModal(true);
      // Clean up URL
      window.history.replaceState({}, '', '/');
    } else if (createType === 'pumpfun') {
      setShowCreateCABotModal(true);
      // Clean up URL
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleSimClick = (sim: AgentType) => {
    setSelectedSim(sim);
    setIsSimModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background relative">
      <HackathonAnnouncementModal />
      
      <MatrixHeroSection 
        onCreateAgent={() => setShowCreateSimModal(true)} 
        onSimClick={handleSimClick}
      />

      {/* View All Agents Text Link */}
      <button
        onClick={() => navigate('/agents')}
        className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 text-sm text-[#83f1aa] hover:underline transition-all duration-300"
      >
        View All Agents
      </button>

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

      {showCreateSimModal && (
        <CreateSimModal
          open={showCreateSimModal}
          onOpenChange={setShowCreateSimModal}
          onAuthRequired={() => {
            setShowCreateSimModal(false);
            setAuthModalOpen(true);
          }}
          onSuccess={() => {}}
        />
      )}

      {showCreateCABotModal && (
        <CreateCABotModal
          open={showCreateCABotModal}
          onOpenChange={setShowCreateCABotModal}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default NewLanding;
