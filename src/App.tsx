
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
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import AdvisorChat from "@/pages/AdvisorChat";
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster as SonnerToaster } from 'sonner'

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AuthenticatedUserRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is authenticated, redirect to home
  if (user) {
    return <Navigate to="/home" replace />;
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
              <Route 
                path="/" 
                element={
                  <AuthenticatedUserRedirect>
                    <Landing />
                  </AuthenticatedUserRedirect>
                } 
              />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route path="/public/agents/:agentId" element={<AdvisorChat />} />
              {/* Redirect any unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
