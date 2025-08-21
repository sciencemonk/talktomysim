
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import AgentsDashboard from "./pages/AgentsDashboard";
import AgentCreate from "./pages/AgentCreate";
import AgentDetails from "./pages/AgentDetails";
import AgentAnalytics from "./pages/AgentAnalytics";
import TeacherDashboard from "./pages/TeacherDashboard";
import SimpleTeacherDashboard from "./pages/SimpleTeacherDashboard";
import StudentChat from "./pages/StudentChat";
import PublicTutorDetail from "./pages/PublicTutorDetail";
import Settings from "./pages/Settings";
import ChildProfile from "./pages/ChildProfile";
import Billing from "./pages/Billing";
import ProfessionalDevelopment from "./pages/ProfessionalDevelopment";
import Marketplace from "./pages/Marketplace";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AgentsLayout from "./layouts/AgentsLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import SimpleDashboardLayout from "./layouts/SimpleDashboardLayout";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/tutors/:id/chat" element={<StudentChat />} />
                <Route path="/tutors/:id" element={<PublicTutorDetail />} />
                
                {/* Dashboard routes with sidebar */}
                <Route path="/" element={<DashboardLayout />}>
                  <Route index element={<Home />} />
                  <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="child-profile" element={<ProtectedRoute><ChildProfile /></ProtectedRoute>} />
                  <Route path="billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
                  <Route path="professional-development" element={<ProtectedRoute><ProfessionalDevelopment /></ProtectedRoute>} />
                  <Route path="marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                </Route>

                {/* Agent management routes */}
                <Route path="/agents" element={<ProtectedRoute><AgentsLayout /></ProtectedRoute>}>
                  <Route index element={<AgentsDashboard />} />
                  <Route path="create" element={<AgentCreate />} />
                  <Route path=":id" element={<AgentDetails />} />
                  <Route path=":id/analytics" element={<AgentAnalytics />} />
                </Route>

                {/* Teacher dashboard routes */}
                <Route path="/teacher" element={<ProtectedRoute><SimpleDashboardLayout /></ProtectedRoute>}>
                  <Route index element={<SimpleTeacherDashboard />} />
                  <Route path="dashboard" element={<TeacherDashboard />} />
                </Route>

                {/* Admin routes */}
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                
                {/* Legacy redirect */}
                <Route path="/index" element={<Navigate to="/" replace />} />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
