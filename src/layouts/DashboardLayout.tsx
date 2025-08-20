
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import UserSidebar from "@/components/UserSidebar";
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
    <div className="min-h-screen bg-background flex">
      <UserSidebar onShowBilling={() => setShowBilling(true)} />
      
      <div className="flex-1 flex flex-col">
        <header className="flex h-16 shrink-0 items-center justify-end border-b px-4">
          <ThemeToggle />
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
