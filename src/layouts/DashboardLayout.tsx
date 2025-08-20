
import { useState } from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "@/components/UserSidebar";
import { AgentType } from "@/types/agent";

const DashboardLayout = () => {
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);

  const handleShowSettings = () => {
    // Navigate to settings or show settings modal
    console.log("Show settings");
  };

  const handleShowChildProfile = () => {
    // Navigate to child profile
    console.log("Show child profile");
  };

  const handleShowAgents = () => {
    // Navigate to agents page
    console.log("Show agents");
  };

  const handleShowAgentCreate = () => {
    // Navigate to agent creation
    console.log("Show agent create");
  };

  const handleSelectAgent = (agent: AgentType) => {
    setSelectedAgent(agent);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <UserSidebar 
        onShowSettings={handleShowSettings}
        onShowChildProfile={handleShowChildProfile}
        onShowAgents={handleShowAgents}
        onShowAgentCreate={handleShowAgentCreate}
        selectedAgent={selectedAgent}
        onSelectAgent={handleSelectAgent}
      />
      
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
