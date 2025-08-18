
import { UserSettingsDropdown } from "@/components/UserSettingsDropdown";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Bot } from "lucide-react";

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
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">TeacherHub</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI Tutoring Dashboard</p>
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
