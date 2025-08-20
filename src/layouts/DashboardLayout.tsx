
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import UserSettingsDropdown from "@/components/UserSettingsDropdown";
import UsageBilling from "@/components/UsageBilling";

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
        <div className="flex items-center">
          <UserSettingsDropdown 
            onShowBilling={() => setShowBilling(true)}
            trigger={
              <img 
                src="/lovable-uploads/55ccce33-98a1-45d2-9e9e-7b446a02a417.png" 
                alt="Think With Me" 
                className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity"
              />
            }
          />
        </div>
        
        <div className="flex items-center gap-4">
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
