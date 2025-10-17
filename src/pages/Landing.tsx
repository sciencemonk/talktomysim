import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import SimpleFooter from "@/components/SimpleFooter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BotCheck from "@/components/BotCheck";
import { useState, useEffect } from "react";
import { AgentType } from "@/types/agent";
import phantomIcon from "@/assets/phantom-icon.png";
import solflareIcon from "@/assets/solflare-icon.png";
import { toast as sonnerToast } from "sonner";
import bs58 from "bs58";
import AuthModal from "@/components/AuthModal";
import landingBackground from "@/assets/landing-background.jpg";
import { SimSettingsModal } from "@/components/SimSettingsModal";
import { Settings, LogOut, Link2, Copy, Check, Trash2, Award, Grid, MessageSquare, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showBotCheck, setShowBotCheck] = useState(false);
  const [selectedSim, setSelectedSim] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  // Fetch user's sim if signed in
  const { data: userSim } = useQuery({
    queryKey: ['user-sim', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        type: 'General Tutor' as const,
        status: 'active' as const,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        avatar: data.avatar_url,
        prompt: data.prompt,
        title: data.title,
        sim_type: data.sim_type as 'historical' | 'living',
        custom_url: data.custom_url,
        is_featured: false,
        is_official: data.is_official,
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
        twitter_url: data.twitter_url,
        website_url: data.website_url,
        crypto_wallet: data.crypto_wallet,
        background_image_url: data.background_image_url
      } as AgentType;
    },
    enabled: !!currentUser
  });

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
        voiceTraits: []
      } as AgentType));
    },
  });

  const handleSimClick = (sim: AgentType) => {
    if (sim.custom_url) {
      navigate(`/${sim.custom_url}`);
    } else {
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

      await wallet.connect();
      const publicKey = wallet.publicKey.toString();
      const message = `Sign in to Sim\n\nWallet: ${publicKey}\nTimestamp: ${new Date().toISOString()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await wallet.signMessage(encodedMessage, 'utf8');
      const signature = bs58.encode(signedMessage.signature);

      const { data, error } = await supabase.functions.invoke('solana-auth', {
        body: { publicKey, signature, message }
      });

      if (error) throw error;
      
      if (data?.access_token && data?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        sonnerToast.success('Connected successfully!');
      }
    } catch (error: any) {
      console.error('Error signing in with Solana:', error);
      sonnerToast.error(error?.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    sonnerToast.success('Signed out successfully');
  };

  const features = currentUser && userSim ? [
    {
      title: "Edit Your Sim",
      description: "Customize your sim's appearance, prompt, and settings",
      action: () => navigate("/edit-sim"),
      gradient: "from-primary/20 to-primary/5",
      gridArea: "edit",
      icon: "settings"
    },
    {
      title: "View Directory",
      description: "Browse and discover all available sims",
      action: () => navigate("/directory"),
      gradient: "from-muted/20 to-muted/5",
      gridArea: "directory",
      icon: "grid"
    },
    {
      title: "Chat with Your Sim",
      description: "Test and chat with your own sim privately",
      action: () => navigate("/chat-with-sim"),
      gradient: "from-primary/20 to-primary/5",
      gridArea: "chat",
      icon: "message"
    },
    {
      title: "View Conversations",
      description: "See all conversations your sim has had with visitors",
      action: () => navigate("/sim-conversations-view"),
      gradient: "from-muted/20 to-muted/5",
      gridArea: "conversations",
      icon: "history"
    },
  ] : [
    {
      title: "Create Your Own AI",
      description: "Be part of the Sim AI revolution",
      action: () => navigate("/dashboard"),
      gradient: "from-primary/20 to-primary/5",
      gridArea: "create",
      showWalletButtons: true,
    },
    {
      title: "The Future of AI is Personal",
      description: "ChatGPT is generic. Sim is yours. Create your own AI—a personal assistant, financial advisor, or friend. Connect your crypto wallet, customize everything, and build an AI that truly understands you.",
      action: copyCAToClipboard,
      gradient: "from-muted/20 to-muted/5",
      gridArea: "simai",
      showCA: true,
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
          {currentUser ? (
            <Button
              onClick={handleSignOut}
              className="bg-white text-black hover:bg-white/90 font-medium h-10 w-10 p-0"
              size="sm"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="bg-white text-black hover:bg-white/90 font-medium px-6"
              size="sm"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Main Section - Features */}
      <section className="flex items-center justify-center container mx-auto px-3 sm:px-4 py-4 sm:py-6 relative z-10">
        <div className="grid gap-3 max-w-6xl w-full grid-cols-1 md:grid-cols-2">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 border-white/20 bg-white/10 backdrop-blur-md cursor-pointer"
              onClick={feature.action}
            >
              <CardHeader className="pb-3 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-white">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-white/80">
                  {feature.description}
                </CardDescription>
                
                {feature.icon && (
                  <div className="mt-6 flex justify-center">
                    {feature.icon === 'settings' && <Settings className="h-16 w-16 text-white/40" />}
                    {feature.icon === 'grid' && <Grid className="h-16 w-16 text-white/40" />}
                    {feature.icon === 'message' && <MessageSquare className="h-16 w-16 text-white/40" />}
                    {feature.icon === 'history' && <History className="h-16 w-16 text-white/40" />}
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
                
                {feature.showCA && (
                  <div className="mt-4 p-3 rounded-lg bg-black/30 border border-white/20">
                    <p className="text-xs text-white/60 mb-1">Contract Address:</p>
                    <p className="text-xs text-white font-mono break-all">FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump</p>
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
                {sim.sim_type === 'historical' && sim.is_official && (
                  <Badge variant="outline" className="bg-transparent border-white text-white text-[10px] px-1.5 py-0">
                    <Award className="h-3 w-3 mr-1" />
                    Official
                  </Badge>
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
