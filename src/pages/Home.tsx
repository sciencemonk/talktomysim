import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarContent } from "@/components/UserSidebar";
import AdvisorDirectory from "@/components/AdvisorDirectory";
import MySim from "@/components/MySim";
import BasicInfo from "@/components/BasicInfo";
import InteractionModel from "@/components/InteractionModel";
import CoreKnowledge from "@/components/CoreKnowledge";
import Integrations from "@/components/Integrations";
import { AgentType } from "@/types/agent";
import { LoaderIcon } from "@/components/LoaderIcon";
import { Link } from "react-router-dom";

const Home = () => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<string>("search");
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [selectedPublicAdvisorId, setSelectedPublicAdvisorId] = useState<string | null>(null);
  const [selectedPublicAdvisors, setSelectedPublicAdvisors] = useState<AgentType[]>([]);

  // For non-authenticated users, always show search directory
  useEffect(() => {
    if (!loading && !user) {
      setActiveView("search");
    }
  }, [user, loading]);

  const handleSelectAgent = (agent: AgentType) => {
    setSelectedAgent(agent);
    setSelectedPublicAdvisorId(null);
  };

  const handleSelectPublicAdvisor = (advisorId: string, advisor?: AgentType) => {
    setSelectedPublicAdvisorId(advisorId);
    setSelectedAgent(null);

    if (advisor) {
      // Check if the advisor is already in the list
      const advisorExists = selectedPublicAdvisors.some(a => a.id === advisorId);
      if (!advisorExists) {
        setSelectedPublicAdvisors(prev => [...prev, advisor]);
      }
    }
  };

  const handleRemovePublicAdvisor = (advisorId: string) => {
    setSelectedPublicAdvisors(prev => prev.filter(advisor => advisor.id !== advisorId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderIcon className="w-8 h-8" />
      </div>
    );
  }

  // For non-authenticated users, show search directory with login sidebar
  if (!user) {
    return (
      <div className="min-h-screen bg-bg flex">
        {/* Desktop Sidebar for non-authenticated users */}
        {!isMobile && (
          <div className="fixed left-0 top-0 h-screen w-80 z-40">
            <div className="flex flex-col h-full bg-card border-r border-border">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img 
                      src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
                      alt="Logo" 
                      className="h-8 w-8 object-contain"
                    />
                    <h2 className="text-lg font-semibold text-fg">Sim</h2>
                  </div>
                </div>
              </div>

              {/* Login Section */}
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                  <p className="text-fgMuted">Sign in to create and manage your AI tutors</p>
                  <Link to="/login">
                    <Button className="w-full">Sign In</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Header for non-authenticated users */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50 h-16">
            <div className="flex items-center justify-between px-4 h-full">
              <div className="flex items-center space-x-2">
                <img 
                  src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
                  alt="Logo" 
                  className="h-8 w-8 object-contain"
                />
                <h2 className="text-lg font-semibold text-fg">Sim</h2>
              </div>
              <Link to="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={`flex-1 ${!isMobile ? 'ml-80' : 'mt-16'}`}>
          <AdvisorDirectory 
            onSelectAdvisor={handleSelectPublicAdvisor}
          />
        </div>
      </div>
    );
  }

  // For authenticated users, show the full app
  return (
    <div className="min-h-screen bg-bg flex">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="fixed left-0 top-0 h-screen w-80 z-40">
          <SidebarContent
            selectedAgent={selectedAgent}
            selectedPublicAdvisorId={selectedPublicAdvisorId}
            selectedPublicAdvisors={selectedPublicAdvisors}
            onSelectAgent={handleSelectAgent}
            onSelectPublicAdvisor={handleSelectPublicAdvisor}
            onRemovePublicAdvisor={handleRemovePublicAdvisor}
            onShowAdvisorDirectory={() => setActiveView("search")}
            onNavigateToMySim={() => setActiveView("my-sim")}
            onNavigateToBasicInfo={() => setActiveView("basic-info")}
            onNavigateToInteractionModel={() => setActiveView("interaction-model")}
            onNavigateToCoreKnowledge={() => setActiveView("core-knowledge")}
            onNavigateToIntegrations={() => setActiveView("integrations")}
            activeView={activeView}
          />
        </div>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50 h-16">
          <div className="flex items-center justify-between px-4 h-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
                alt="Logo" 
                className="h-8 w-8 object-contain"
              />
              <h2 className="text-lg font-semibold text-fg">Sim</h2>
            </div>
            <div className="w-10" />
          </div>
        </div>
      )}

      {/* Mobile Sidebar Sheet */}
      {isMobile && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <SidebarContent
              selectedAgent={selectedAgent}
              selectedPublicAdvisorId={selectedPublicAdvisorId}
              selectedPublicAdvisors={selectedPublicAdvisors}
              onSelectAgent={handleSelectAgent}
              onSelectPublicAdvisor={handleSelectPublicAdvisor}
              onRemovePublicAdvisor={handleRemovePublicAdvisor}
              onShowAdvisorDirectory={() => { setActiveView("search"); setMobileMenuOpen(false); }}
              onNavigateToMySim={() => { setActiveView("my-sim"); setMobileMenuOpen(false); }}
              onNavigateToBasicInfo={() => { setActiveView("basic-info"); setMobileMenuOpen(false); }}
              onNavigateToInteractionModel={() => { setActiveView("interaction-model"); setMobileMenuOpen(false); }}
              onNavigateToCoreKnowledge={() => { setActiveView("core-knowledge"); setMobileMenuOpen(false); }}
              onNavigateToIntegrations={() => { setActiveView("integrations"); setMobileMenuOpen(false); }}
              activeView={activeView}
              onClose={() => setMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 ${!isMobile ? 'ml-80' : 'mt-16'}`}>
        {activeView === "search" && (
          <AdvisorDirectory 
            onSelectAdvisor={handleSelectPublicAdvisor}
          />
        )}

        {activeView === "my-sim" && <MySim />}
        {activeView === "basic-info" && <BasicInfo />}
        {activeView === "interaction-model" && <InteractionModel />}
        {activeView === "core-knowledge" && <CoreKnowledge />}
        {activeView === "integrations" && <Integrations />}
      </div>
    </div>
  );
};

export default Home;
