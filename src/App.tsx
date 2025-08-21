
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";

import Index from "./pages/Index";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import ChildProfile from "./pages/ChildProfile";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AgentCreate from "./pages/AgentCreate";
import AgentDetails from "./pages/AgentDetails";
import AgentAnalytics from "./pages/AgentAnalytics";
import TeacherDashboard from "./pages/TeacherDashboard";
import SimpleTeacherDashboard from "./pages/SimpleTeacherDashboard";
import AgentsDashboard from "./pages/AgentsDashboard";
import Marketplace from "./pages/Marketplace";
import ProfessionalDevelopment from "./pages/ProfessionalDevelopment";
import StudentChat from "./pages/StudentChat";
import PublicTutorDetail from "./pages/PublicTutorDetail";

import DashboardLayout from "./layouts/DashboardLayout";
import SimpleDashboardLayout from "./layouts/SimpleDashboardLayout";
import AgentsLayout from "./layouts/AgentsLayout";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/index" element={<Index />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/tutors/:tutorId/chat" element={<StudentChat />} />
                <Route path="/tutors/:tutorId" element={<PublicTutorDetail />} />
                
                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<TeacherDashboard />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="billing" element={<Billing />} />
                  <Route path="child-profile" element={<ChildProfile />} />
                </Route>
                
                <Route
                  path="/simple"
                  element={
                    <ProtectedRoute>
                      <SimpleDashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<SimpleTeacherDashboard />} />
                </Route>
                
                {/* Agent Management Routes - Now available to all authenticated users */}
                <Route
                  path="/agents"
                  element={
                    <ProtectedRoute>
                      <AgentsLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AgentsDashboard />} />
                  <Route path="create" element={<AgentCreate />} />
                  <Route path=":agentId" element={<AgentDetails />} />
                  <Route path=":agentId/analytics" element={<AgentAnalytics />} />
                </Route>
                
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/professional-development" element={<ProfessionalDevelopment />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
