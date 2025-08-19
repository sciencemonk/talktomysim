
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import TeacherDashboard from "./pages/TeacherDashboard";
import SimpleTeacherDashboard from "./pages/SimpleTeacherDashboard";
import AgentsDashboard from "./pages/AgentsDashboard";
import AgentDetails from "./pages/AgentDetails";
import AgentCreate from "./pages/AgentCreate";
import AgentAnalytics from "./pages/AgentAnalytics";
import StudentChat from "./pages/StudentChat";
import PublicTutorDetail from "./pages/PublicTutorDetail";
import Marketplace from "./pages/Marketplace";
import ProfessionalDevelopment from "./pages/ProfessionalDevelopment";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import NotFound from "./pages/NotFound";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import SimpleDashboardLayout from "./layouts/SimpleDashboardLayout";
import AgentsLayout from "./layouts/AgentsLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/tutors/:id" element={<PublicTutorDetail />} />
              <Route path="/chat/:tutorId" element={<StudentChat />} />
              
              {/* Protected dashboard routes */}
              <Route path="/dashboard" element={
                <DashboardLayout>
                  <TeacherDashboard />
                </DashboardLayout>
              } />
              
              <Route path="/simple-dashboard" element={
                <SimpleDashboardLayout>
                  <SimpleTeacherDashboard />
                </SimpleDashboardLayout>
              } />
              
              <Route path="/marketplace" element={
                <DashboardLayout>
                  <Marketplace />
                </DashboardLayout>
              } />
              
              <Route path="/professional-development" element={
                <DashboardLayout>
                  <ProfessionalDevelopment />
                </DashboardLayout>
              } />
              
              <Route path="/settings" element={
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              } />
              
              <Route path="/billing" element={
                <DashboardLayout>
                  <Billing />
                </DashboardLayout>
              } />
              
              {/* Agents routes */}
              <Route path="/agents" element={
                <AgentsLayout>
                  <AgentsDashboard />
                </AgentsLayout>
              } />
              
              <Route path="/agents/create" element={
                <AgentsLayout>
                  <AgentCreate />
                </AgentsLayout>
              } />
              
              <Route path="/agents/:id" element={
                <AgentsLayout>
                  <AgentDetails />
                </AgentsLayout>
              } />
              
              <Route path="/agents/:id/analytics" element={
                <AgentsLayout>
                  <AgentAnalytics />
                </AgentsLayout>
              } />
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
