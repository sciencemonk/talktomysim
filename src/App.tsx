
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { FloatingChat } from "@/components/FloatingChat";

// Layouts
import { AuthenticatedLayout } from "./layouts/AuthenticatedLayout";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import LiveChat from "./pages/LiveChat";
import LiveStream from "./pages/LiveStream";
import Pump from "./pages/Pump";
import Admin from "./pages/Admin";
import PublicTutorDetail from "./pages/PublicTutorDetail";
import StudentChat from "./pages/StudentChat";
import NotFound from "./pages/NotFound";
import WhitePaper from "./pages/WhitePaper";
import Contact from "./pages/Contact";
import KnowledgeEnhancement from "./pages/KnowledgeEnhancement";
import UserDashboard from "./pages/UserDashboard";
import PublicSimDetail from "./pages/PublicSimDetail";
import SimConversations from "./pages/SimConversations";
import EditSim from "./pages/EditSim";
import SimDirectory from "./pages/SimDirectory";
import ChatWithSim from "./pages/ChatWithSim";
import SimConversationsView from "./pages/SimConversationsView";

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
            <Route path="/landing" element={<Landing />} />
            <Route path="/live" element={<LiveChat />} />
            <Route path="/livestream" element={<LiveStream />} />
            <Route path="/pump" element={<Pump />} />
            <Route path="/sim-directory" element={<Home />} />
            <Route path="/index" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/whitepaper" element={<WhitePaper />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/app" element={<Home />} />
            <Route path="/tutors/:agentId" element={<PublicTutorDetail />} />
            <Route path="/tutors/:agentId/chat" element={<StudentChat />} />
            
            {/* Admin route */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/knowledge-enhancement" element={<KnowledgeEnhancement />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/sim-conversations" element={<SimConversations />} />
            
            {/* Authenticated routes with sidebar */}
            <Route element={<AuthenticatedLayout />}>
              <Route path="/" element={<ChatWithSim />} />
              <Route path="/home" element={<ChatWithSim />} />
              <Route path="/conversations" element={<SimConversationsView />} />
              <Route path="/directory" element={<SimDirectory />} />
              <Route path="/edit-sim" element={<EditSim />} />
            </Route>
            
            {/* Public sim share links - must be last to avoid catching other routes */}
            <Route path="/:customUrl" element={<PublicSimDetail />} />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
