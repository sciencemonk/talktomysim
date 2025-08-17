
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import AgentsLayout from "./layouts/AgentsLayout";
import TeacherDashboard from "./pages/TeacherDashboard";
import AgentDetails from "./pages/AgentDetails";
import AgentCreate from "./pages/AgentCreate";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";

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
              <Route path="/dashboard" element={<Navigate to="/agents" replace />} />
              <Route path="/agents" element={<AgentsLayout />}>
                <Route index element={<TeacherDashboard />} />
                <Route path="create" element={<AgentCreate />} />
                <Route path=":agentId" element={<AgentDetails />} />
              </Route>
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
