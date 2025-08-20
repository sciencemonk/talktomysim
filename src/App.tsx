
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import AgentsDashboard from "./pages/AgentsDashboard";
import AgentCreate from "./pages/AgentCreate";
import AgentDetails from "./pages/AgentDetails";
import AgentAnalytics from "./pages/AgentAnalytics";
import TeacherDashboard from "./pages/TeacherDashboard";
import SimpleTeacherDashboard from "./pages/SimpleTeacherDashboard";
import ProfessionalDevelopment from "./pages/ProfessionalDevelopment";
import ChildProfile from "./pages/ChildProfile";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import Marketplace from "./pages/Marketplace";
import PublicTutorDetail from "./pages/PublicTutorDetail";
import StudentChat from "./pages/StudentChat";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./layouts/DashboardLayout";
import AgentsLayout from "./layouts/AgentsLayout";
import SimpleDashboardLayout from "./layouts/SimpleDashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

function App() {
  const { loading } = useAuth();
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    console.log("App component mounted, auth loading:", loading);
    
    // Set a shorter timeout for better UX
    const timeout = setTimeout(() => {
      console.log("Force ending loading state after 2 seconds");
      setAppLoading(false);
    }, 2000);

    if (!loading) {
      console.log("Auth loading complete, ending app loading");
      setAppLoading(false);
      clearTimeout(timeout);
    }

    return () => clearTimeout(timeout);
  }, [loading]);

  if (appLoading && loading) {
    console.log("Showing loading spinner");
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log("Rendering main app");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Public routes - NO SIDEBAR */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/tutors/:agentId" element={<PublicTutorDetail />} />
            
            {/* Protected routes with DashboardLayout (includes sidebar) */}
            <Route path="/app" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Index />} />
              <Route path="tutors/:agentId/chat" element={<StudentChat />} />
              <Route path="child-profile" element={<ChildProfile />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Legacy dashboard redirect */}
            <Route path="/dashboard" element={<Navigate to="/app" replace />} />

            {/* Agents management routes */}
            <Route path="/agents" element={<AgentsLayout />}>
              <Route index element={<AgentsDashboard />} />
              <Route path="create" element={<AgentCreate />} />
              <Route path=":id" element={<AgentDetails />} />
              <Route path=":id/analytics" element={<AgentAnalytics />} />
            </Route>

            {/* Teacher dashboard routes */}
            <Route path="/teacher" element={<SimpleDashboardLayout />}>
              <Route index element={<SimpleTeacherDashboard />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="professional-development" element={<ProfessionalDevelopment />} />
              <Route path="billing" element={<Billing />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
