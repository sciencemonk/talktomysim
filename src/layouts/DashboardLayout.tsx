import { useState } from "react";
import { Outlet } from "react-router-dom";

import { SidebarProvider } from "@/components/SidebarProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/SidebarTrigger";
import { SidebarInset } from "@/components/SidebarInset";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserSettingsDropdown } from "@/components/UserSettingsDropdown";
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
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/agents">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Child Profile and Usage */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-fgMuted">Child Profile</span>
                <button
                  onClick={() => setShowBilling(true)}
                  className="text-sm text-primary hover:text-primary/80 underline font-medium"
                >
                  0.0 hours left
                </button>
              </div>
              
              <UserSettingsDropdown />
              <ThemeToggle />
            </div>
          </header>
          
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
