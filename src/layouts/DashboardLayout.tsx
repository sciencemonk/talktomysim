
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarContent } from "@/components/UserSidebar";
import { Sidebar } from "@/components/ui/sidebar";
import { AgentType } from "@/types/agent";
import { useUserAdvisors } from "@/hooks/useUserAdvisors";

const DashboardLayout = () => {
  const { advisorsAsAgents } = useUserAdvisors();
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [selectedPublicAdvisorId, setSelectedPublicAdvisorId] = useState<string | null>(null);

  const handleSelectAgent = (agent: AgentType) => {
    setSelectedAgent(agent);
    setSelectedPublicAdvisorId(null);
  };

  const handleSelectPublicAdvisor = (advisorId: string, advisor?: AgentType) => {
    setSelectedPublicAdvisorId(advisorId);
    setSelectedAgent(null);
  };

  const handleRemovePublicAdvisor = (advisorId: string) => {
    if (selectedPublicAdvisorId === advisorId) {
      setSelectedPublicAdvisorId(null);
    }
  };

  const handleShowAdvisorDirectory = () => {
    setSelectedAgent(null);
    setSelectedPublicAdvisorId(null);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent
            selectedAgent={selectedAgent}
            selectedPublicAdvisorId={selectedPublicAdvisorId}
            selectedPublicAdvisors={advisorsAsAgents}
            onSelectAgent={handleSelectAgent}
            onSelectPublicAdvisor={handleSelectPublicAdvisor}
            onRemovePublicAdvisor={handleRemovePublicAdvisor}
            onShowAdvisorDirectory={handleShowAdvisorDirectory}
          />
        </Sidebar>
        
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
