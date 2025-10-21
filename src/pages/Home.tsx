
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import AdvisorDirectory from "@/components/AdvisorDirectory";
import ChatInterface from "@/components/ChatInterface";
import AuthModal from "@/components/AuthModal";
import TopNavigation from "@/components/TopNavigation";
import SimpleFooter from "@/components/SimpleFooter";
import { AgentType } from "@/types/agent";
import { useUserAdvisors } from "@/hooks/useUserAdvisors";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const { advisorsAsAgents, addAdvisor, removeAdvisor } = useUserAdvisors();
  const { toast } = useToast();
  const [selectedAdvisor, setSelectedAdvisor] = useState<AgentType | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAdvisor, setPendingAdvisor] = useState<AgentType | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [selectedPublicAdvisorId, setSelectedPublicAdvisorId] = useState<string | null>(null);

  // Check for sim ID in URL and load that sim's chat
  useEffect(() => {
    const simId = searchParams.get('sim');
    const isNewChat = searchParams.get('new') === 'true';
    
    console.log('useEffect triggered - simId:', simId, 'isNewChat:', isNewChat, 'current selectedAdvisor:', selectedAdvisor?.id);
    
    if (simId) {
      // Only fetch if the sim ID is different from current selection OR if it's a forced new chat
      if (selectedAdvisor?.id !== simId || isNewChat) {
        console.log('Loading sim from URL:', simId);
        // Fetch the sim data
        supabase
          .from('advisors')
          .select('*')
          .eq('id', simId)
          .single()
          .then(({ data, error }) => {
            if (data && !error) {
              console.log('Sim loaded:', data.name);
              // Transform database advisor to AgentType
              const agent: AgentType = {
                ...data,
                type: 'General Tutor' as const,
                status: 'active' as const,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
                avatar: data.avatar_url,
                auto_description: data.auto_description,
                sim_type: (data.sim_type === 'living' ? 'living' : 'historical') as 'historical' | 'living'
              };
              console.log('Setting selected advisor:', agent.name);
              setSelectedAdvisor(agent);
              setSelectedPublicAdvisorId(data.id);
            } else {
              console.error('Error loading sim:', error);
            }
          });
      } else {
        console.log('Sim already loaded:', selectedAdvisor?.name);
      }
    } else {
      console.log('No sim ID in URL, clearing selection');
      // No sim in URL, clear selection
      setSelectedAdvisor(null);
      setSelectedPublicAdvisorId(null);
    }
  }, [searchParams]);

  // Check if we were passed a selected advisor from navigation state
  useEffect(() => {
    const state = location.state as { selectedAdvisor?: AgentType };
    if (state?.selectedAdvisor) {
      handleAdvisorSelect(state.selectedAdvisor.id, state.selectedAdvisor);
      // Clear the state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Effect to handle post-authentication advisor selection
  useEffect(() => {
    if (user && pendingAdvisor && !selectedAdvisor) {
      handleAdvisorSelect(pendingAdvisor.id, pendingAdvisor);
      setPendingAdvisor(null);
      setShowAuthModal(false);
    }
  }, [user, pendingAdvisor, selectedAdvisor]);

  // Handle auth modal close
  const handleAuthModalClose = (open: boolean) => {
    setShowAuthModal(open);
    if (!open) {
      setPendingAdvisor(null);
    }
  };

  // Handle auth required (when non-signed-in user tries to start chat)
  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };
  const handleAdvisorSelect = async (advisorId: string, advisor?: AgentType) => {
    // Allow immediate chat for all users, authenticated or not
    if (advisor) {
      // If user is signed in, try to add to their list
      if (user) {
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
      }
      
      // Always allow chat regardless of authentication status
      setSelectedAdvisor(advisor);
      setSelectedPublicAdvisorId(advisor.id);
    }
  };

  // Handle agent selection from sidebar
  const handleAgentSelect = (agent: AgentType) => {
    setSelectedAgent(agent);
    setSelectedAdvisor(null);
    setSelectedPublicAdvisorId(null);
  };

  // Handle public advisor selection from sidebar
  const handlePublicAdvisorSelect = (advisorId: string, advisor?: AgentType) => {
    setSelectedPublicAdvisorId(advisorId);
    if (advisor) {
      setSelectedAdvisor(advisor);
    }
    setSelectedAgent(null);
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
  
  // Check if this is a new/restarted conversation
  const forceNewChat = searchParams.get('new') === 'true';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!currentChatAgent && <TopNavigation />}
      
      <div className="flex-1 flex flex-col min-h-0">
        {currentChatAgent ? (
          <ChatInterface
            agent={currentChatAgent}
            forceNewChat={forceNewChat}
            onBack={() => {
              setSelectedAgent(null);
              setSelectedAdvisor(null);
              setSelectedPublicAdvisorId(null);
              navigate('/directory');
            }}
          />
        ) : (
          <div className="flex-1 overflow-auto">
            <AdvisorDirectory 
              onSelectAdvisor={handleAdvisorSelect}
              onAuthRequired={handleAuthRequired}
            />
          </div>
        )}
      </div>

      {!currentChatAgent && <SimpleFooter />}
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={handleAuthModalClose}
      />
    </div>
  );
};

export default Home;
