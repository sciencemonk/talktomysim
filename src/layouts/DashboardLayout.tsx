import { Outlet } from "react-router-dom";
import UserSidebar from "@/components/UserSidebar";
import { MobileTopNav } from "@/components/MobileTopNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { AgentType } from "@/types/agent";

const DashboardLayout = () => {
  const isMobile = useIsMobile();
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [selectedPublicAdvisorId, setSelectedPublicAdvisorId] = useState<string | null>(null);
  const [selectedPublicAdvisors, setSelectedPublicAdvisors] = useState<AgentType[]>([]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {isMobile && (
        <MobileTopNav 
          selectedAgent={selectedAgent}
          selectedPublicAdvisorId={selectedPublicAdvisorId}
          selectedPublicAdvisors={selectedPublicAdvisors}
          onSelectAgent={setSelectedAgent}
          onSelectPublicAdvisor={(id, advisor) => {
            setSelectedPublicAdvisorId(id);
            if (advisor && !selectedPublicAdvisors.find(a => a.id === id)) {
              setSelectedPublicAdvisors([...selectedPublicAdvisors, advisor]);
            }
          }}
        />
      )}
      
      <div className="flex flex-1 min-h-0">
        {!isMobile && <UserSidebar />}
        
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
