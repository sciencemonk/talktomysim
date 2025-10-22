
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

// Extend Window interface for the chat widget flag
declare global {
  interface Window {
    __SIM_CHAT_LOADED__?: boolean;
  }
}

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

  // Initialize embedded chat widget
  useEffect(() => {
    // Inject the embedded chat widget script
    const script = document.createElement('script');
    script.innerHTML = `
      (function() {
        'use strict';
        
        // ULTRA AGGRESSIVE DUPLICATE PREVENTION
        if (window.__SIM_CHAT_LOADED__ === true) {
          console.log('[SimChat] Already loaded, skipping initialization');
          return;
        }
        
        // Cleanup any existing widgets
        function cleanupExistingWidget() {
          const existingBubble = document.getElementById('sim-chat-bubble');
          const existingWindow = document.getElementById('sim-chat-window');
          const existingStyles = document.getElementById('sim-chat-widget-styles');
          
          if (existingBubble) existingBubble.remove();
          if (existingWindow) existingWindow.remove();
          if (existingStyles) existingStyles.remove();
        }
        
        cleanupExistingWidget();
        window.__SIM_CHAT_LOADED__ = true;

        const simConfig = {
          name: "SimAI Helper",
          avatar: "https://uovhemqkztmkoozlmqxq.supabase.co/storage/v1/object/public/avatars/avatars/5fc73de1-9e91-4e0d-8e4a-f2fc587e7f69-1761073373654.jpg",
          simUrl: "${window.location.origin}/simai-helper?embed=chat-only",
          welcomeMessage: "Hey there! I'm SimAI Helper, your go-to for all things related to SimProject.org—ask me anything about our product, the $SIMAI token, or how to make the most of our platform. Just type your question, and let's get started!"
        };
        
        // Create styles
        const style = document.createElement('style');
        style.id = 'sim-chat-widget-styles';
        style.textContent = \`
          #sim-chat-bubble {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: transform 0.3s ease;
          }
          #sim-chat-bubble:hover { transform: scale(1.1); }
          #sim-chat-bubble img {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            object-fit: cover;
          }
          #sim-chat-window {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 380px;
            height: 600px;
            max-width: calc(100vw - 40px);
            max-height: calc(100vh - 120px);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            background: white;
            z-index: 9998;
            display: none;
            flex-direction: column;
            overflow: hidden;
          }
          #sim-chat-window.active { display: flex; }
          #sim-chat-header {
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          #sim-chat-close {
            margin-left: auto;
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          #sim-chat-iframe {
            flex: 1;
            border: none;
            width: 100%;
          }
        \`;
        document.head.appendChild(style);
        
        // Create bubble
        const bubble = document.createElement('div');
        bubble.id = 'sim-chat-bubble';
        bubble.innerHTML = '<img src="' + simConfig.avatar + '" alt="' + simConfig.name + '" draggable="false">';
        document.body.appendChild(bubble);
        
        // Create chat window
        const chatWindow = document.createElement('div');
        chatWindow.id = 'sim-chat-window';
        chatWindow.innerHTML = \`
          <div id="sim-chat-header">
            <strong>\${simConfig.name}</strong>
            <button id="sim-chat-close">×</button>
          </div>
          <iframe id="sim-chat-iframe" src="\${simConfig.simUrl}"></iframe>
        \`;
        document.body.appendChild(chatWindow);
        
        // Toggle chat window on bubble click
        bubble.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          chatWindow.classList.toggle('active');
        });
        
        // Close button
        const closeBtn = document.getElementById('sim-chat-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            chatWindow.classList.remove('active');
          });
        }
        
        console.log('[SimChat] Widget initialized successfully');
      })();
    `;
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      window.__SIM_CHAT_LOADED__ = false;
      const existingBubble = document.getElementById('sim-chat-bubble');
      const existingWindow = document.getElementById('sim-chat-window');
      const existingStyles = document.getElementById('sim-chat-widget-styles');
      
      if (existingBubble) existingBubble.remove();
      if (existingWindow) existingWindow.remove();
      if (existingStyles) existingStyles.remove();
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

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
                social_links: data.social_links as any,
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

      {/* Widget container */}
      <div id="sim-chat-widget"></div>
    </div>
  );
};

export default Home;
