
import { useState } from "react";
import { Outlet } from "react-router-dom";
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
      
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
