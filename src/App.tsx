
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { FloatingChat } from "@/components/FloatingChat";
import { ThemeProvider } from "@/hooks/useTheme";
import { WalletProviders } from "@/components/WalletProviders";

// Layouts
import { AuthenticatedLayout } from "./layouts/AuthenticatedLayout";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignIn from "./pages/SignIn";
import AuthCallback from "./pages/AuthCallback";
import Home from "./pages/Home";
import NewLanding from "./pages/NewLanding";
import GodMode from "./pages/GodMode";
import Marketplace from "./pages/Marketplace";
import LiveChat from "./pages/LiveChat";
import LiveStream from "./pages/LiveStream";
import Pump from "./pages/Pump";
import Admin from "./pages/Admin";
import PublicTutorDetail from "./pages/PublicTutorDetail";
import StudentChat from "./pages/StudentChat";
import MySimChat from "./pages/MySimChat";
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
import EditSimPage from "./pages/EditSimPage";
import TradeStream from "./pages/TradeStream";
import Integrations from "./pages/Integrations";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import AdminWelcomeMessages from "./pages/AdminWelcomeMessages";
import BatchUpdateDescriptions from "./pages/BatchUpdateDescriptions";
import Test from "./pages/Test";
import Demo from "./pages/Demo";
import DemoTest from "./pages/DemoTest";
import DemoStore from "./pages/DemoStore";
import TokenAgentPage from "./pages/TokenAgentPage";
import XAgentPage from "./pages/XAgentPage";
import XAgentCreatorView from "./pages/XAgentCreatorView";
import OfferingDetail from "./pages/OfferingDetail";
import OfferingX402 from "./pages/OfferingX402";
import NFTDetail from "./pages/NFTDetail";
import SimCoin from "./pages/SimCoin";
import About from "./pages/About";
import Documentation from "./pages/Documentation";
import SimDashboard from "./pages/SimDashboard";
import Facilitator from "./pages/Facilitator";
import AgentPublicView from "./pages/AgentPublicView";
import RootRedirect from "./pages/RootRedirect";
import Onboarding from "./pages/Onboarding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="sim-theme">
      <WalletProviders>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/landing" element={<NewLanding />} />
              <Route path="/godmode" element={<GodMode />} />
              <Route path="/live" element={<LiveChat />} />
              <Route path="/livestream" element={<LiveStream />} />
              <Route path="/pump" element={<Pump />} />
              <Route path="/sim-directory" element={<Home />} />
              <Route path="/index" element={<Index />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/whitepaper" element={<WhitePaper />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/simai" element={<SimCoin />} />
              <Route path="/facilitator" element={<Facilitator />} />
              <Route path="/about" element={<About />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/test" element={<Test />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/demotest" element={<DemoTest />} />
              <Route path="/demostore" element={<DemoStore />} />
              <Route path="/app" element={<Home />} />
              <Route path="/tutors/:agentId" element={<PublicTutorDetail />} />
              <Route path="/tutors/:agentId/chat" element={<StudentChat />} />
              
              {/* Admin route */}
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/welcome-messages" element={<AdminWelcomeMessages />} />
              <Route path="/admin/batch-update-descriptions" element={<BatchUpdateDescriptions />} />
              <Route path="/knowledge-enhancement" element={<KnowledgeEnhancement />} />
              <Route path="/sim-conversations" element={<SimConversations />} />
              <Route path="/pumpfun" element={<TradeStream />} />
              
              {/* Token Agent Page */}
              <Route path="/token/:contractAddress" element={<TokenAgentPage />} />
              
              {/* Offering routes */}
              <Route path="/offering/:offeringId/x402" element={<OfferingX402 />} />
              <Route path="/offering/:offeringId" element={<OfferingDetail />} />
              
              {/* NFT Detail Page */}
              <Route path="/nft/:id" element={<NFTDetail />} />
              
              {/* X Agent Creator - Must come before catch-all */}
              <Route path="/:username/creator" element={<XAgentCreatorView />} />
              
              {/* Agent Public View */}
              <Route path="/agent/:agentId" element={<AgentPublicView />} />
              
              {/* Root route - Shows marketplace or redirects to chat if authenticated */}
              <Route path="/" element={<RootRedirect />} />
              
              {/* Previous landing page moved to /home */}
              <Route path="/home-old" element={<NewLanding />} />
              
              {/* Authenticated routes with sidebar */}
              <Route element={<AuthenticatedLayout />}>
                <Route path="/directory" element={<SimDirectory />} />
                <Route path="/conversations" element={<SimConversationsView />} />
                <Route path="/edit-sim" element={<EditSim />} />
                <Route path="/edit-sim-page" element={<EditSimPage />} />
                <Route path="/integrations" element={<Integrations />} />
              </Route>
              
              {/* Single catch-all that handles both X agents and sims */}
              <Route path="/:identifier" element={<PublicSimDetail />} />
              
              {/* Catch all 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
      </WalletProviders>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
