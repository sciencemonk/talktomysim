
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import TeacherDashboard from "./pages/TeacherDashboard";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserSettingsDropdown } from "./components/UserSettingsDropdown";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry if we get a 404 for new123 agent
        if (error?.message?.includes("Agent with id new123 not found")) {
          return false;
        }
        return failureCount < 3;
      }
    }
  }
});

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold text-fg">Agent Hub</h1>
          </div>
          <UserSettingsDropdown />
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={
                <DashboardLayout>
                  <TeacherDashboard />
                </DashboardLayout>
              } />
              <Route path="/agents" element={<Navigate to="/dashboard" replace />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
