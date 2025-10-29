import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SimpleFooter from "@/components/SimpleFooter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { AgentType } from "@/types/agent";
import { toast as sonnerToast } from "sonner";
import AuthModal from "@/components/AuthModal";
import { CreateSimModal } from "@/components/CreateSimModal";
import { CreateCABotModal } from "@/components/CreateCABotModal";
import { User, LogOut, Plus, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SimDetailModal from "@/components/SimDetailModal";
import { updateMetaTags, resetMetaTags } from "@/lib/metaTags";
import { HeroSection } from "@/components/landing/HeroSection";
import { ApplicationsGrid } from "@/components/landing/ApplicationsGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { MarketplacePreview } from "@/components/landing/MarketplacePreview";
import { StatsSection } from "@/components/landing/StatsSection";
import { UseCases } from "@/components/landing/UseCases";
import { CTASection } from "@/components/landing/CTASection";

const Landing = () => {
  const navigate = useNavigate();
  const [selectedSim, setSelectedSim] = useState<AgentType | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showCreateSimModal, setShowCreateSimModal] = useState(false);
  const [showCreateCABotModal, setShowCreateCABotModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const directoryRef = useRef<HTMLDivElement>(null);

  // Update meta tags on mount
  useEffect(() => {
    updateMetaTags({
      title: "Sim - Build Your AI Agent in Seconds",
      description: "Create powerful AI agents instantly. From chatbots to autonomous agents, from token analysts to verified messaging. No coding required.",
      url: "https://simproject.org"
    });

    return () => resetMetaTags();
  }, []);

  // Check for signin query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('signin') === 'true') {
      setAuthModalOpen(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Check auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch all sims for marketplace preview
  const { data: allSims } = useQuery({
    queryKey: ['all-sims-landing'],
    queryFn: async () => {
      const { data: advisorsData, error: advisorsError } = await supabase
        .from('advisors')
        .select('*')
        .eq('is_active', true)
        .neq('name', '$GRUTA');
      
      if (advisorsError) throw advisorsError;

      const { data: likeCounts, error: likesError } = await supabase
        .from('sim_likes')
        .select('sim_id');
      
      if (likesError) throw likesError;

      const likesMap = new Map<string, number>();
      likeCounts?.forEach(like => {
        const count = likesMap.get(like.sim_id) || 0;
        likesMap.set(like.sim_id, count + 1);
      });
      
      return (advisorsData || []).map(sim => ({
        id: sim.id,
        name: sim.name,
        description: sim.description || '',
        auto_description: sim.auto_description,
        type: 'General Tutor' as const,
        status: 'active' as const,
        createdAt: sim.created_at,
        updatedAt: sim.updated_at,
        avatar: sim.avatar_url,
        prompt: sim.prompt,
        welcome_message: sim.welcome_message,
        title: sim.title,
        sim_type: sim.sim_type as 'historical' | 'living',
        sim_category: sim.sim_category,
        custom_url: sim.custom_url,
        is_featured: false,
        is_official: sim.is_official,
        model: 'GPT-4',
        interactions: 0,
        studentsSaved: 0,
        helpfulnessScore: 0,
        avmScore: 0,
        csat: 0,
        performance: 0,
        channels: [],
        channelConfigs: {},
        isPersonal: false,
        voiceTraits: [],
        price: sim.price || 0,
        marketplace_category: sim.marketplace_category || 'uncategorized',
        user_id: sim.user_id,
        like_count: likesMap.get(sim.id) || 0,
        social_links: sim.social_links as any,
        background_image_url: sim.background_image_url,
        crypto_wallet: sim.crypto_wallet,
        x402_enabled: sim.x402_enabled || false,
        x402_price: sim.x402_price || 0,
        x402_wallet: sim.x402_wallet,
        is_verified: sim.is_verified || false
      } as AgentType & { user_id?: string; marketplace_category?: string; like_count?: number; is_verified?: boolean }));
    },
  });

  // Calculate stats
  const stats = {
    totalSims: allSims?.length || 0,
    totalConversations: Math.floor((allSims?.length || 0) * 127), // Estimated
    chatSims: allSims?.filter(s => !s.sim_category || s.sim_category === 'Chat').length || 0,
    pumpFunAgents: allSims?.filter(s => s.sim_category === 'PumpFun Agent').length || 0,
    autonomousAgents: allSims?.filter(s => s.sim_category === 'Autonomous Agent').length || 0,
    cryptoMail: allSims?.filter(s => s.sim_category === 'Crypto Mail').length || 0,
    verifiedAccounts: allSims?.filter(s => (s as any).is_verified).length || 0
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    sonnerToast.success("Signed out successfully");
  };

  const handleGetStarted = () => {
    if (currentUser) {
      setShowCreateSimModal(true);
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleExploreSims = () => {
    navigate('/directory');
  };

  const handleViewWhitepaper = () => {
    navigate('/whitepaper');
  };

  const handleSimClick = (sim: AgentType) => {
    setSelectedSim(sim);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="flex items-center gap-2">
                <img
                  src="/sim-logo.png"
                  alt="Sim Logo"
                  className="h-8 w-auto"
                />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setShowCreateSimModal(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Sim
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/directory')}>
                      <Menu className="mr-2 h-4 w-4" />
                      Browse Directory
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setAuthModalOpen(true)} variant="default">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <HeroSection
          onGetStarted={handleGetStarted}
          onExploreSims={handleExploreSims}
          isAuthenticated={!!currentUser}
        />

        <ApplicationsGrid stats={{
          chatSims: stats.chatSims,
          pumpFunAgents: stats.pumpFunAgents,
          autonomousAgents: stats.autonomousAgents,
          cryptoMail: stats.cryptoMail
        }} />

        <HowItWorks />

        <FeaturesGrid />

        <MarketplacePreview
          sims={allSims}
          onSimClick={handleSimClick}
          onViewAll={handleExploreSims}
        />

        <StatsSection stats={{
          totalSims: stats.totalSims,
          totalConversations: stats.totalConversations,
          autonomousAgents: stats.autonomousAgents,
          verifiedAccounts: stats.verifiedAccounts
        }} />

        <UseCases />

        <CTASection
          onGetStarted={handleGetStarted}
          onViewWhitepaper={handleViewWhitepaper}
          isAuthenticated={!!currentUser}
        />
      </main>

      <SimpleFooter />

      {/* Modals */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
      />

      {selectedSim && (
        <SimDetailModal
          sim={selectedSim}
          open={!!selectedSim}
          onOpenChange={(open) => !open && setSelectedSim(null)}
        />
      )}

      <CreateSimModal
        open={showCreateSimModal}
        onOpenChange={setShowCreateSimModal}
      />

      <CreateCABotModal
        open={showCreateCABotModal}
        onOpenChange={setShowCreateCABotModal}
      />
    </div>
  );
};

export default Landing;
