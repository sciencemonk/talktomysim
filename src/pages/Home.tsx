
import React, { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSim } from "@/hooks/useSim";
import { useQuery } from "@tanstack/react-query";
import { AgentType } from "@/types/agent";
import { advisorService } from "@/services/advisorService";
import { publicAgentService } from "@/services/publicAgentService";
import UserSidebar from "@/components/UserSidebar";
import MySim from "@/components/MySim";
import BasicInfo from "@/components/BasicInfo";
import InteractionModel from "@/components/InteractionModel";
import { CoreKnowledge } from "@/components/CoreKnowledge";
import Integrations from "@/components/Integrations";
import Actions from "@/components/Actions";
import AdvisorDirectory from "@/components/AdvisorDirectory";
import AuthModal from "@/components/AuthModal";
import { ChatInterface } from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Home = () => {
  const { user } = useAuth();
  const { sim } = useSim();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [selectedPublicAdvisorId, setSelectedPublicAdvisorId] = useState<string | null>(null);
  const [selectedPublicAdvisors, setSelectedPublicAdvisors] = useState<AgentType[]>([]);
  
  // Change default view to "talk-to-sim" instead of "my-sim"
  const [activeView, setActiveView] = useState<string>("talk-to-sim");

  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: advisorService.getAdvisors,
  });

  const { data: publicAdvisors = [], isLoading: publicAdvisorsLoading } = useQuery({
    queryKey: ['public-advisors'],
    queryFn: publicAgentService.getPublicAgents,
  });

  const handleSelectAgent = (agent: AgentType) => {
    setSelectedAgent(agent);
  };

  const handleSelectPublicAdvisor = (advisorId: string, advisor?: AgentType) => {
    setSelectedPublicAdvisorId(advisorId);
    if (advisor) {
      setSelectedPublicAdvisors(prev => {
        if (prev.find(a => a.id === advisorId)) {
          return prev;
        }
        return [...prev, advisor];
      });
    }
  };

  const handleRemovePublicAdvisor = (advisorId: string) => {
    setSelectedPublicAdvisors(prev => prev.filter(advisor => advisor.id !== advisorId));
  };

  const handleShowAdvisorDirectory = () => {
    setActiveView("directory");
  };

  const handleNavigateToMySim = () => {
    setActiveView("my-sim");
  };

  const handleNavigateToBasicInfo = () => {
    setActiveView("basic-info");
  };

  const handleNavigateToInteractionModel = () => {
    setActiveView("interaction-model");
  };

  const handleNavigateToCoreKnowledge = () => {
    setActiveView("core-knowledge");
  };

  const handleNavigateToIntegrations = () => {
    setActiveView("integrations");
  };

  const handleNavigateToActions = () => {
    setActiveView("actions");
  };

  const handleNavigateToSearch = () => {
    setActiveView("search");
  };

  const handleNavigateToTalkToSim = () => {
    setActiveView("talk-to-sim");
  };

  // Convert SimData to AgentType for ChatInterface
  const getSimAsAgent = (): AgentType | null => {
    if (!sim) return null;
    
    return {
      id: sim.id || '',
      name: sim.name || sim.full_name || 'My Sim',
      description: sim.description || '',
      type: 'General Tutor' as any,
      status: 'active' as any,
      createdAt: sim.created_at || new Date().toISOString(),
      updatedAt: sim.updated_at || new Date().toISOString(),
      avatar: sim.avatar_url,
      prompt: sim.prompt,
      title: sim.professional_title,
      welcomeMessage: sim.welcome_message,
      // Default values for required AgentType fields
      model: 'gpt-4',
      voice: 'default',
      voiceProvider: 'openai',
      customVoiceId: null,
      voiceTraits: [],
      interactions: 0,
      studentsSaved: 0,
      helpfulnessScore: 0,
      avmScore: 0,
      csat: 0,
      performance: 0,
      channels: [],
      channelConfigs: {},
      isPersonal: true,
      phone: null,
      email: null,
      purpose: null,
      subject: null,
      gradeLevel: null,
      teachingStyle: null,
      customSubject: null,
      learningObjective: null,
      is_featured: false,
      url: sim.url,
      custom_url: sim.custom_url,
      isPublic: sim.is_public
    };
  };

  const renderContent = () => {
    if (!user) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to My Sim</h2>
            <p className="text-muted-foreground mb-6">Sign in to create and manage your AI simulation</p>
            <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case "talk-to-sim":
        const simAsAgent = getSimAsAgent();
        return simAsAgent ? (
          <ChatInterface 
            agent={simAsAgent} 
            isUserOwnSim={true}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Create Your Sim</h2>
              <p className="text-muted-foreground mb-6">Start by setting up your basic information</p>
              <Button onClick={() => setActiveView("basic-info")}>Get Started</Button>
            </div>
          </div>
        );
      case "my-sim":
        return <MySim />;
      case "basic-info":
        return <BasicInfo />;
      case "interaction-model":
        return <InteractionModel />;
      case "core-knowledge":
        return sim?.id ? <CoreKnowledge advisorId={sim.id} /> : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Please complete your basic information first</p>
            </div>
          </div>
        );
      case "integrations":
        return <Integrations />;
      case "actions":
        return <Actions />;
      case "directory":
        return <AdvisorDirectory
          onSelectAdvisor={handleSelectPublicAdvisor}
          onAuthRequired={() => setShowAuthModal(true)}
        />;
      case "search":
        return <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Search</h2>
            <p className="text-muted-foreground mb-6">Coming soon...</p>
          </div>
        </div>;
      default:
        return <MySim />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <UserSidebar
        selectedAgent={selectedAgent}
        selectedPublicAdvisorId={selectedPublicAdvisorId}
        selectedPublicAdvisors={selectedPublicAdvisors}
        onSelectAgent={handleSelectAgent}
        onSelectPublicAdvisor={handleSelectPublicAdvisor}
        onRemovePublicAdvisor={handleRemovePublicAdvisor}
        onShowAdvisorDirectory={handleShowAdvisorDirectory}
        onNavigateToMySim={handleNavigateToMySim}
        onNavigateToBasicInfo={handleNavigateToBasicInfo}
        onNavigateToInteractionModel={handleNavigateToInteractionModel}
        onNavigateToCoreKnowledge={handleNavigateToCoreKnowledge}
        onNavigateToIntegrations={handleNavigateToIntegrations}
        onNavigateToActions={handleNavigateToActions}
        onNavigateToSearch={handleNavigateToSearch}
        onNavigateToTalkToSim={handleNavigateToTalkToSim}
        activeView={activeView}
        onAuthRequired={() => setShowAuthModal(true)}
      />
      
      <div className="flex-1">
        {renderContent()}
      </div>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
};

export default Home;
