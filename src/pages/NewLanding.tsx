import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MatrixHeroSection } from "@/components/landing/MatrixHeroSection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { CreateSimModal } from "@/components/CreateSimModal";
import SimDetailModal from "@/components/SimDetailModal";
import { AgentType } from "@/types/agent";
import { HackathonAnnouncementModal } from "@/components/HackathonAnnouncementModal";

const NewLanding = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showCreateSimModal, setShowCreateSimModal] = useState(false);
  const [selectedSim, setSelectedSim] = useState<AgentType | null>(null);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

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

      {/* View All Agents Button */}
      <Button
        onClick={() => navigate('/agents')}
        size="lg"
        className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 gap-2 font-semibold px-8 py-6 text-lg transition-all duration-300"
        style={{ backgroundColor: '#83f1aa', color: '#000' }}
      >
        View All Agents
        <ArrowRight className="h-5 w-5" />
      </Button>

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
    </div>
  );
};

export default NewLanding;
