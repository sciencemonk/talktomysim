
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
                <div className="p-2 rounded-lg">
                  <img 
                    src="/lovable-uploads/35810899-a91c-4acc-b8e9-c0868e320e3f.png" 
                    alt="Think With Me Logo" 
                    className="h-8 w-8"
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
