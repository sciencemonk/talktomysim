
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import Dashboard from "@/pages/TeacherDashboard";
import AgentDetails from "@/pages/AgentDetails";
import PublicAgentDetails from "@/pages/PublicAgentDetails";
import Landing from "@/pages/Landing";
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster as SonnerToaster } from 'sonner'
import AgentBuilder from "@/pages/AgentCreate";
import AdvisorEdit from "@/pages/AdvisorEdit";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a more appropriate loading indicator
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <SonnerToaster />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/public" element={<PublicAgentDetails />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agent-builder"
                element={
                  <ProtectedRoute>
                    <AgentBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agents/:agentId"
                element={
                  <ProtectedRoute>
                    <AgentDetails />
                  </ProtectedRoute>
                }
              />
              <Route path="/public/agents/:agentId" element={<PublicAgentDetails />} />
              <Route 
                path="/advisor-edit/:advisorId" 
                element={
                  <ProtectedRoute>
                    <AdvisorEdit />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
