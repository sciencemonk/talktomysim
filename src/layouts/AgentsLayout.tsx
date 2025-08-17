
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AgentsSidebar from "@/components/AgentsSidebar";
import { Outlet } from "react-router-dom";
import { UserSettingsDropdown } from "@/components/UserSettingsDropdown";
import ProtectedRoute from "@/components/ProtectedRoute";

const AgentsLayout = () => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AgentsSidebar />
          <main className="flex-1 flex flex-col">
            <header className="flex items-center justify-between p-4 border-b">
              <SidebarTrigger />
              <UserSettingsDropdown />
            </header>
            <div className="flex-1 p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default AgentsLayout;
