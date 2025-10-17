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
import landingBackground from "@/assets/landing-background.jpg";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showBotCheck, setShowBotCheck] = useState(false);
  const [selectedSim, setSelectedSim] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Fetch all sims (both historical and living)
  const { data: allSims } = useQuery({
    queryKey: ['all-sims-landing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      
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
        sim_type: sim.sim_type as 'historical' | 'living',
        custom_url: sim.custom_url,
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
    // If sim has custom_url, navigate to their landing page
    if (sim.custom_url) {
      navigate(`/sim/${sim.custom_url}`);
    } else {
      // Otherwise go to sim directory with state
      navigate('/sim-directory', { state: { selectedAdvisor: sim } });
    }
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
      title: "Read the Whitepaper",
      description: "Dive deep into our vision, technology, and roadmap for Sim.",
      action: () => navigate("/whitepaper"),
      gradient: "from-muted/20 to-muted/5",
      gridArea: "whitepaper",
    },
  ];

  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: `url(${landingBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40 z-0" />
      
      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-md bg-black/20 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
              alt="Sim" 
              className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
            />
          </div>
          <Button
            onClick={() => setAuthModalOpen(true)}
            className="bg-white text-black hover:bg-white/90 font-medium px-6"
            size="sm"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Main Section - Features */}
      <section className="flex items-center justify-center container mx-auto px-3 sm:px-4 py-4 sm:py-6 relative z-10">
        <div className="grid gap-3 max-w-6xl w-full grid-cols-1 md:grid-cols-2">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 border-white/20 bg-white/10 backdrop-blur-md flex flex-col"
              onClick={!feature.showWalletButtons ? feature.action : undefined}
            >
              <CardHeader className="pb-3 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-white">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-white/80">
                  {feature.description}
                </CardDescription>
                
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
            </Card>
          ))}
        </div>
      </section>

      {/* Sim Directory Section */}
      <section className="container mx-auto px-3 sm:px-4 pb-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
            Talk to a Sim
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {allSims?.map((sim) => (
              <button
                key={sim.id}
                onClick={() => handleSimClick(sim)}
                className="group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-md hover:scale-105"
              >
                <img 
                  src={sim.avatar} 
                  alt={sim.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/30 shadow-lg group-hover:shadow-xl transition-shadow"
                />
                <span className="text-xs sm:text-sm font-medium text-white text-center line-clamp-2 leading-tight">
                  {sim.name}
                </span>
                {sim.title && (
                  <span className="text-[10px] sm:text-xs text-white/60 text-center line-clamp-1">
                    {sim.title}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />

      <div className="relative z-10">
        <SimpleFooter />
      </div>
    </div>
  );
};

export default Landing;
