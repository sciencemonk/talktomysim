
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import PublicTutorDetail from "./pages/PublicTutorDetail";
import StudentChat from "./pages/StudentChat";
import NotFound from "./pages/NotFound";
import WhitePaper from "./pages/WhitePaper";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Main app as default route */}
            <Route path="/" element={<Home />} />
            
            {/* Admin route */}
            <Route path="/admin" element={<Admin />} />
            
            {/* Legacy routes */}
            <Route path="/index" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/whitepaper" element={<WhitePaper />} />
            <Route path="/app" element={<Home />} />
            
            {/* Public tutor share links - accessible by non-signed in users */}
            <Route path="/tutors/:agentId" element={<PublicTutorDetail />} />
            <Route path="/tutors/:agentId/chat" element={<StudentChat />} />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
