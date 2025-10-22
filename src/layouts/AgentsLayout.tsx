
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AgentsSidebar from "@/components/AgentsSidebar";
import { Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import ProtectedRoute from "@/components/ProtectedRoute";

const AgentsLayout = () => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AgentsSidebar />
          <main className="flex-1 flex flex-col">
            <header className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <div className="dark:bg-white rounded-lg p-1 md:hidden">
                  <img 
                    src="/sim-logo.png" 
                    alt="Sim Logo" 
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <ThemeToggle />
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
