
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
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<TeacherDashboard />} />
              </Route>
              
              <Route path="/simple-dashboard" element={<SimpleDashboardLayout />}>
                <Route index element={<SimpleTeacherDashboard />} />
              </Route>
              
              <Route path="/marketplace" element={<DashboardLayout />}>
                <Route index element={<Marketplace />} />
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
              <Route path="/agents" element={<AgentsLayout />}>
                <Route index element={<AgentsDashboard />} />
                <Route path="create" element={<AgentCreate />} />
                <Route path=":id" element={<AgentDetails />} />
                <Route path=":id/analytics" element={<AgentAnalytics />} />
              </Route>
              
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
