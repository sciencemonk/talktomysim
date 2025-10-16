import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import SimpleFooter from "@/components/SimpleFooter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BotCheck from "@/components/BotCheck";
import { useState } from "react";
import { AgentType } from "@/types/agent";
import phantomIcon from "@/assets/phantom-icon.png";
import solflareIcon from "@/assets/solflare-icon.png";
import { toast as sonnerToast } from "sonner";
import bs58 from "bs58";
import AuthModal from "@/components/AuthModal";
import { LogIn } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showBotCheck, setShowBotCheck] = useState(false);
  const [selectedSim, setSelectedSim] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Fetch historical sims with full data
  const { data: historicalSims } = useQuery({
    queryKey: ['historical-sims-landing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('sim_type', 'historical')
        .eq('is_active', true)
        .limit(8);
      
      if (error) throw error;
      
      // Transform to AgentType
      return (data || []).map(sim => ({
        id: sim.id,
        name: sim.name,
        description: sim.description || '',
        type: 'General Tutor' as const,
        status: 'active' as const,
        createdAt: sim.created_at,
        updatedAt: sim.updated_at,
        avatar: sim.avatar_url,
        prompt: sim.prompt,
        title: sim.title,
        sim_type: 'historical' as const,
        is_featured: false,
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
        voiceTraits: []
      } as AgentType));
    },
  });

  const handleSimClick = (sim: AgentType) => {
    setSelectedSim(sim);
    setShowBotCheck(true);
  };

  const handleBotCheckComplete = () => {
    setShowBotCheck(false);
    if (selectedSim) {
      // Navigate to sim-directory with state to pre-select this sim
      navigate('/sim-directory', { state: { selectedAdvisor: selectedSim } });
    }
  };

  const handleBotCheckCancel = () => {
    setShowBotCheck(false);
    setSelectedSim(null);
  };

  const copyCAToClipboard = async () => {
    const ca = "FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump";
    try {
      await navigator.clipboard.writeText(ca);
      toast({
        title: "Copied!",
        description: "Contract address copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleWalletSignIn = async (walletType: 'phantom' | 'solflare') => {
    setIsLoading(walletType);
    try {
      let wallet;
      
      if (walletType === 'phantom') {
        wallet = (window as any).solana;
        if (!wallet?.isPhantom) {
          sonnerToast.error('Please install Phantom wallet');
          setIsLoading(null);
          return;
        }
      } else {
        wallet = (window as any).solflare;
        if (!wallet) {
          sonnerToast.error('Please install Solflare wallet');
          setIsLoading(null);
          return;
        }
      }

      // Connect to wallet
      await wallet.connect();
      
      // Get public key
      const publicKey = wallet.publicKey.toString();

      // Create message to sign
      const message = `Sign in to Sim\n\nWallet: ${publicKey}\nTimestamp: ${new Date().toISOString()}`;
      const encodedMessage = new TextEncoder().encode(message);
      
      // Request signature
      const signedMessage = await wallet.signMessage(encodedMessage, 'utf8');
      const signature = bs58.encode(signedMessage.signature);

      // Authenticate with backend
      const { data, error } = await supabase.functions.invoke('solana-auth', {
        body: { 
          publicKey,
          signature,
          message 
        }
      });

      if (error) throw error;
      
      if (data?.access_token && data?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        
        sonnerToast.success('Connected successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error signing in with Solana:', error);
      sonnerToast.error(error?.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(null);
    }
  };

  const features = [
    {
      title: "Create Your Own AI",
      description: "Build and share your own ai based on your personality or your wildest ideas.",
      action: () => navigate("/dashboard"),
      gradient: "from-primary/20 to-primary/5",
      gridArea: "create",
      showWalletButtons: true,
    },
    {
      title: "Talk to a Sim",
      description: "Engage in conversations with AI personalities across various domains and expertise.",
      action: () => navigate("/live"),
      gradient: "from-accent/20 to-accent/5",
      gridArea: "talk",
      showSims: true,
    },
    {
      title: "Watch Sims Debate",
      description: "Experience dynamic debates between AI simulations on trending topics and ideas.",
      action: () => navigate("/live"),
      gradient: "from-secondary/20 to-secondary/5",
      gridArea: "debate",
    },
    {
      title: "Read the Whitepaper",
      description: "Dive deep into our vision, technology, and roadmap for Sim.",
      action: () => navigate("/whitepaper"),
      gradient: "from-muted/20 to-muted/5",
      gridArea: "whitepaper",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg via-bgMuted to-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-bg/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
              alt="Sim" 
              className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
            />
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign In</span>
          </Button>
        </div>
      </header>

      {/* Main Section - All Features */}
      <section className="flex-1 flex items-center justify-center container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid gap-3 max-w-6xl w-full [grid-template-areas:'create'_'talk'_'debate'_'whitepaper'] md:[grid-template-areas:'create_create_talk_talk'_'debate_debate_talk_talk'_'whitepaper_whitepaper_talk_talk'] grid-cols-1 md:grid-cols-4">
          {features.map((feature, index) => {
            const isMainFeature = ['create', 'talk', 'debate'].includes(feature.gridArea);
            const showButton = !feature.showSims && !feature.showWalletButtons;
            return (
              <Card 
                key={index}
                className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 border-border bg-gradient-to-br ${feature.gradient} flex flex-col`}
                style={{ gridArea: feature.gridArea }}
                onClick={(!feature.showSims && !feature.showWalletButtons) ? feature.action : undefined}
              >
                <CardHeader className="pb-3 p-3 sm:p-4">
                  <CardTitle className={`${isMainFeature ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} font-bold text-fg`}>
                    {feature.title}
                  </CardTitle>
                  <CardDescription className={`text-xs sm:text-sm text-fgMuted ${isMainFeature ? '' : 'line-clamp-2'}`}>
                    {feature.description}
                  </CardDescription>
                  
                  {feature.showSims && historicalSims && historicalSims.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 sm:mt-4">
                      {historicalSims.map((sim) => (
                        <button
                          key={sim.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSimClick(sim);
                          }}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-bg/50 hover:bg-bg transition-colors"
                        >
                          <img 
                            src={sim.avatar} 
                            alt={sim.name}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-border shadow-sm"
                          />
                          <span className="text-[9px] sm:text-[10px] font-medium text-fg text-center line-clamp-2 leading-tight w-full">
                            {sim.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {feature.showWalletButtons && (
                    <div className="flex flex-col gap-2 mt-4">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 h-auto py-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWalletSignIn('phantom');
                        }}
                        disabled={!!isLoading}
                      >
                        <img src={phantomIcon} alt="Phantom" className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {isLoading === 'phantom' ? 'Connecting...' : 'Connect Phantom'}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 h-auto py-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWalletSignIn('solflare');
                        }}
                        disabled={!!isLoading}
                      >
                        <img src={solflareIcon} alt="Solflare" className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {isLoading === 'solflare' ? 'Connecting...' : 'Connect Solflare'}
                        </span>
                      </Button>
                    </div>
                  )}
                </CardHeader>
                {feature.showSims && (
                  <CardContent className="pt-0 mt-auto p-3 sm:p-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full group-hover:translate-x-1 transition-transform text-xs sm:text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/sim-directory");
                      }}
                    >
                      View All
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {showBotCheck && (
        <BotCheck
          onVerificationComplete={handleBotCheckComplete}
          onCancel={handleBotCheckCancel}
        />
      )}

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />

      <SimpleFooter />
    </div>
  );
};

export default Landing;
