
import { useState } from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "@/components/UserSidebar";
import { AgentType } from "@/types/agent";

const DashboardLayout = () => {
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [selectedPublicAdvisorId, setSelectedPublicAdvisorId] = useState<string | null>(null);
  const [selectedPublicAdvisors, setSelectedPublicAdvisors] = useState<AgentType[]>([]);

  const handleSelectAgent = (agent: AgentType) => {
    setSelectedAgent(agent);
  };

  const handleSelectPublicAdvisor = (advisorId: string, advisor?: AgentType) => {
    setSelectedPublicAdvisorId(advisorId);
    if (advisor && !selectedPublicAdvisors.find(a => a.id === advisor.id)) {
      setSelectedPublicAdvisors(prev => [...prev, advisor]);
    }
  };

  const handleRemovePublicAdvisor = (advisorId: string) => {
    setSelectedPublicAdvisors(prev => prev.filter(a => a.id !== advisorId));
    if (selectedPublicAdvisorId === advisorId) {
      setSelectedPublicAdvisorId(null);
    }
  };

  const handleShowAdvisorDirectory = () => {
    // This would typically navigate to advisor directory
    // For now, we'll just clear any selected advisor
    setSelectedAgent(null);
    setSelectedPublicAdvisorId(null);
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
      />
      
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
