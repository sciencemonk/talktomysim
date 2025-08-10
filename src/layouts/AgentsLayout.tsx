
import { Outlet } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";

const AgentsLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <main className="flex-1 overflow-hidden">
        <TooltipProvider>
          <div className="h-full overflow-y-auto p-6 animate-fade-in">
            <Outlet />
          </div>
        </TooltipProvider>
      </main>
    </div>
  );
};

export default AgentsLayout;
