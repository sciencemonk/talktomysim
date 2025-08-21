
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
import DashboardLayout from "./layouts/DashboardLayout";

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
