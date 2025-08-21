
import { useState } from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "@/components/UserSidebar";
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
    <div className="min-h-screen bg-background flex">
      <UserSidebar 
        selectedAgent={selectedAgent}
        selectedPublicAdvisorId={selectedPublicAdvisorId}
        selectedPublicAdvisors={advisorsAsAgents}
        onSelectAgent={handleSelectAgent}
        onSelectPublicAdvisor={handleSelectPublicAdvisor}
        onRemovePublicAdvisor={handleRemovePublicAdvisor}
        onShowAdvisorDirectory={handleShowAdvisorDirectory}
      />
      
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
