
import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import UserSettingsDropdown from "@/components/UserSettingsDropdown";
import UsageBilling from "@/components/UsageBilling";
import { Brain } from "lucide-react";

const DashboardLayout = () => {
  const [showBilling, setShowBilling] = useState(false);

  if (showBilling) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-6xl">
          <UsageBilling onClose={() => setShowBilling(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Think With Me</h1>
          </div>
          
          <Link 
            to="/child-profile"
            className="text-sm text-primary hover:text-primary/80 underline font-medium"
          >
            Child Profile
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Usage Display */}
          <button
            onClick={() => setShowBilling(true)}
            className="text-sm text-fgMuted hover:text-fg font-medium"
          >
            0.0 hours left
          </button>
          
          <UserSettingsDropdown />
          <ThemeToggle />
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
