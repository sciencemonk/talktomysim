
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import TeacherDashboard from "./pages/TeacherDashboard";
import AgentsDashboard from "./pages/AgentsDashboard";
import AgentDetails from "./pages/AgentDetails";
import AgentCreate from "./pages/AgentCreate";
import AgentAnalytics from "./pages/AgentAnalytics";
import StudentChat from "./pages/StudentChat";
import PublicTutorDetail from "./pages/PublicTutorDetail";
import ProfessionalDevelopment from "./pages/ProfessionalDevelopment";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import NotFound from "./pages/NotFound";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            
            {/* Protected dashboard routes - Tutors is now the default home */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<AgentsDashboard />} />
            </Route>
            
            <Route path="/tutors" element={<DashboardLayout />}>
              <Route index element={<AgentsDashboard />} />
            </Route>
            
            <Route path="/professional-development" element={<DashboardLayout />}>
              <Route index element={<ProfessionalDevelopment />} />
            </Route>
            
            <Route path="/settings" element={<DashboardLayout />}>
              <Route index element={<Settings />} />
            </Route>
            
            <Route path="/billing" element={<DashboardLayout />}>
              <Route index element={<Billing />} />
            </Route>
            
            {/* Agents routes */}
            <Route path="/agents" element={<DashboardLayout />}>
              <Route index element={<AgentsDashboard />} />
            </Route>
            
            <Route path="/agents/create" element={<DashboardLayout />}>
              <Route index element={<AgentCreate />} />
            </Route>
            
            <Route path="/agents/:id" element={<DashboardLayout />}>
              <Route index element={<AgentDetails />} />
            </Route>
            
            <Route path="/agents/:id/analytics" element={<DashboardLayout />}>
              <Route index element={<AgentAnalytics />} />
            </Route>
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
