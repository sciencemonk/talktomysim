import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PublicChatInterface from "@/components/PublicChatInterface";
import { AgentOfferingsDisplay } from "@/components/AgentOfferingsDisplay";
import { AgentType } from "@/types/agent";
import { Sim } from "@/types/sim";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { updateMetaTags, resetMetaTags } from "@/lib/metaTags";
import { ArrowLeft, Globe, Wallet, Copy, Check, MessageCircle, Package } from "lucide-react";
import simHeroLogo from "@/assets/sim-hero-logo.png";
import simLogoWhite from "@/assets/sim-logo-white.png";
import SimpleFooter from "@/components/SimpleFooter";

const PublicSimDetail = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [sim, setSim] = useState<Sim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletCopied, setWalletCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);

  useEffect(() => {
    checkUser();
    fetchSim();
    
    return () => {
      resetMetaTags();
    };
  }, [identifier]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchSim = async () => {
    try {
      setIsLoading(true);
      
      // Try to fetch from sims table first
      let { data: simData, error: simError } = await supabase
        .from('sims')
        .select('*')
        .eq('is_active', true)
        .or(`custom_url.eq.${identifier},id.eq.${identifier},x_username.ilike.${identifier}`)
        .maybeSingle();

      // Convert integrations to string array if found
      if (simData) {
        const integrationsArray = Array.isArray(simData.integrations) 
          ? simData.integrations 
          : [];
        simData = {
          ...simData,
          integrations: integrationsArray as string[]
        };
      }

      // If not found in sims, try advisors (legacy)
      if (!simData && !simError) {
        const { data: advisorData, error: advisorError } = await supabase
          .from('advisors')
          .select('*')
          .eq('is_active', true)
          .or(`custom_url.eq.${identifier},id.eq.${identifier}`)
          .maybeSingle();

        if (advisorData) {
          // Convert advisor to sim format
          const integrationsArray = Array.isArray(advisorData.integrations) 
            ? advisorData.integrations 
            : [];
          
          simData = {
            id: advisorData.id,
            user_id: advisorData.user_id,
            name: advisorData.name,
            description: advisorData.auto_description || advisorData.description,
            prompt: advisorData.prompt,
            welcome_message: advisorData.welcome_message,
            x_username: (advisorData.social_links as any)?.x_username || 'unknown',
            x_display_name: (advisorData.social_links as any)?.x_display_name || advisorData.name,
            twitter_url: advisorData.twitter_url || '',
            avatar_url: advisorData.avatar_url,
            crypto_wallet: advisorData.crypto_wallet || '',
            is_verified: advisorData.is_verified || false,
            verification_status: advisorData.verification_status || false,
            verified_at: advisorData.verified_at,
            edit_code: '',
            custom_url: advisorData.custom_url,
            is_active: true,
            is_public: true,
            integrations: integrationsArray as string[],
            social_links: advisorData.social_links,
            training_completed: (advisorData.social_links as any)?.trained || false,
            training_post_count: (advisorData.social_links as any)?.trainingPostCount || 0,
            created_at: advisorData.created_at,
            updated_at: advisorData.updated_at,
          };
        }
      }

      if (!simData) {
        navigate('/404');
        return;
      }

      // Ensure all fields are properly typed
      const typedSim: Sim = {
        ...simData,
        integrations: Array.isArray(simData.integrations) ? simData.integrations as string[] : [],
        social_links: simData.social_links as Sim['social_links']
      };

      setSim(typedSim);

      // Update meta tags
      const simUrl = `https://simproject.org/${simData.custom_url || simData.x_username}`;
      const avatarUrl = getAvatarUrl(simData.avatar_url) || 'https://simproject.org/sim-logo.png';
      
      updateMetaTags({
        title: `${simData.name} - SIM Agent`,
        description: simData.description || `Chat with ${simData.name}, an AI agent on SIM.`,
        image: avatarUrl.startsWith('http') ? avatarUrl : `https://simproject.org${avatarUrl}`,
        url: simUrl
      });
    } catch (error) {
      console.error('Error fetching sim:', error);
      navigate('/404');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyWallet = () => {
    if (!sim?.crypto_wallet) return;
    navigator.clipboard.writeText(sim.crypto_wallet);
    setWalletCopied(true);
    setTimeout(() => setWalletCopied(false), 2000);
    toast({
      title: "Wallet address copied!",
      description: "The wallet address has been copied to your clipboard"
    });
  };

  const handleXSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with X:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!sim) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">SIM not found</div>
      </div>
    );
  }

  // Convert Sim to AgentType for PublicChatInterface compatibility
  const agentForChat: AgentType = {
    id: sim.id,
    name: sim.name,
    description: sim.description || '',
    type: 'General Tutor',
    status: 'active',
    createdAt: sim.created_at,
    updatedAt: sim.updated_at,
    avatar: sim.avatar_url,
    prompt: sim.prompt,
    welcome_message: sim.welcome_message,
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-9 w-9"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <button onClick={() => navigate('/')} className="flex items-center hover:opacity-80 transition-opacity">
                <img src={resolvedTheme === 'dark' ? simLogoWhite : simHeroLogo} alt="SIM" className="h-8" />
              </button>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate('/about')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                About
              </button>
              <button onClick={() => navigate('/godmode')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                God Mode
              </button>
              <button onClick={() => navigate('/documentation')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                Documentation
              </button>
            </div>
            
            {/* Right side */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {!currentUser && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleXSignIn}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Compact Header */}
        <div className="border-b border-border bg-card/30 backdrop-blur-sm p-4">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-border">
              <AvatarImage src={getAvatarUrl(sim.avatar_url)} alt={sim.name} />
              <AvatarFallback>{sim.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{sim.name}</h1>
                {sim.is_verified && (
                  <img src="/lovable-uploads/verified-badge.png" alt="Verified" className="h-5 w-5" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{sim.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {sim.twitter_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(sim.twitter_url, '_blank')}
                >
                  <Globe className="h-4 w-4" />
                </Button>
              )}
              {sim.crypto_wallet && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyWallet}
                >
                  {walletCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Interface - Full Height */}
        <div className="flex-1 overflow-hidden">
          <PublicChatInterface 
            agent={agentForChat}
            avatarUrl={getAvatarUrl(sim.avatar_url)}
          />
        </div>
      </div>

      <SimpleFooter />
    </div>
  );
};

export default PublicSimDetail;
