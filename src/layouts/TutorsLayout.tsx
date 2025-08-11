
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import TutorsSidebar from "@/components/TutorsSidebar";

const TutorsLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <TutorsSidebar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default TutorsLayout;
