
import { UserSettingsDropdown } from "@/components/UserSettingsDropdown";
import ProtectedRoute from "@/components/ProtectedRoute";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex w-full bg-background">
        <main className="flex-1 flex flex-col">
          <header className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-semibold">AI Tutors Dashboard</h1>
            <UserSettingsDropdown />
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
