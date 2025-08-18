
import { UserSettingsDropdown } from "@/components/UserSettingsDropdown";
import ProtectedRoute from "@/components/ProtectedRoute";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 flex flex-col">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png" 
                    alt="Think With Me Logo" 
                    className="h-10 w-10"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Think With Me</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Learning Conversations</p>
                </div>
              </div>
              <UserSettingsDropdown />
            </div>
          </header>
          <div className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
