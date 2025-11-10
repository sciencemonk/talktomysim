import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AgentType } from "@/types/agent";
import { Users, Shield, CheckCircle, XCircle, Search, User, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { Input } from "@/components/ui/input";
import simHeroLogo from "@/assets/sim-hero-logo.png";
import simLogoWhite from "@/assets/sim-logo-white.png";
import xIcon from "@/assets/x-icon.png";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import SimpleFooter from "@/components/SimpleFooter";
import { useIsMobile } from "@/hooks/use-mobile";

const AgentsDirectory = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [showBetaRequest, setShowBetaRequest] = useState(false);
  const [betaCode, setBetaCode] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);

  const generateBetaCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handlePostToX = () => {
    const tweetText = '$SIMAI';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleCreateAgent = () => {
    const code = generateBetaCode();
    setBetaCode(code);
    setShowBetaRequest(true);
  };

  const handleXSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/agents`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with X:', error);
    }
  };

  // Fetch only X authenticated users (agents with Twitter/X authentication)
  const { data: authenticatedAgents, isLoading } = useQuery({
    queryKey: ['authenticated-agents'],
    queryFn: async () => {
      const { data: advisorsData, error: advisorsError } = await supabase
        .from('advisors')
        .select('*')
        .eq('is_active', true)
        .not('user_id', 'is', null)
        .not('twitter_url', 'is', null) // Only show agents with Twitter URL (X authenticated)
        .order('created_at', { ascending: false });
      
      if (advisorsError) throw advisorsError;

      // Get like counts for each advisor
      const { data: likeCounts, error: likesError } = await supabase
        .from('sim_likes')
        .select('sim_id');
      
      if (likesError) throw likesError;

      // Count likes for each advisor
      const likesMap = new Map<string, number>();
      likeCounts?.forEach(like => {
        const count = likesMap.get(like.sim_id) || 0;
        likesMap.set(like.sim_id, count + 1);
      });
      
      return (advisorsData || []).map(sim => {
        const likeCount = likesMap.get(sim.id) || 0;
        
        return {
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
          marketplace_category: sim.marketplace_category || 'uncategorized',
          user_id: sim.user_id,
          like_count: likeCount,
          social_links: sim.social_links as any,
          background_image_url: sim.background_image_url,
          crypto_wallet: sim.crypto_wallet,
          x402_enabled: sim.x402_enabled || false,
          x402_price: sim.x402_price || 0,
          x402_wallet: sim.x402_wallet,
          is_verified: sim.is_verified || false,
          verification_status: sim.verification_status
        } as AgentType & { user_id?: string; marketplace_category?: string; like_count?: number; is_verified?: boolean; verification_status?: boolean };
      });
    },
  });

  // Filter agents based on search query
  const filteredAgents = authenticatedAgents?.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.auto_description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleAgentClick = (agent: any) => {
    if (agent.custom_url) {
      navigate(`/${agent.custom_url}`);
    } else {
      navigate(`/${agent.id}`);
    }
  };

  const getAvatarSrc = (agent: any) => {
    const avatarUrl = getAvatarUrl(agent.avatar);
    if (avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}`;
    }
    return avatarUrl;
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Video Background */}
      <div className="fixed inset-0 -z-10">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="https://kxsvyeirqimcydtkowga.supabase.co/storage/v1/object/sign/storage/11904029_3840_2160_30fps.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNDczMmYzNC1kYzc2LTRhNzgtOGNmOC05MDE5NTRhM2RkMjgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9yYWdlLzExOTA0MDI5XzM4NDBfMjE2MF8zMGZwcy5tcDQiLCJpYXQiOjE3NjI3NDkzNzcsImV4cCI6MTc5NDI4NTM3N30.uVl_wMEdyOaP8amz9yFCMhkFkXGbt5jX8Z8bqoQjl4w" type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => navigate('/')} className="flex items-center hover:opacity-80 transition-opacity">
              <img src="/sim-logo-white.png" alt="SIM" className="h-6 w-auto" />
            </button>
            
            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex items-center gap-8">
                <button onClick={() => navigate('/about')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                  About
                </button>
                <button onClick={() => navigate('/agents')} className="text-white hover:text-white transition-colors text-sm font-medium">
                  Agent Directory
                </button>
                <button onClick={() => navigate('/documentation')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                  Documentation
                </button>
                <button onClick={() => navigate('/simai')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                  $SIMAI
                </button>
                <button onClick={() => navigate('/facilitator')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                  x402 Facilitator
                </button>
              </div>
            )}
            
            {/* Right side - Theme Toggle and Sign In */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {!isMobile && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:text-white"
                  onClick={handleXSignIn}
                >
                  Sign In
                </Button>
              )}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-white hover:bg-white/10"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobile && mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-white/20 shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}
                className="w-full justify-start text-base font-medium text-white/80 hover:text-white"
              >
                About
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => { navigate('/agents'); setMobileMenuOpen(false); }}
                className="w-full justify-start text-base font-medium text-white"
              >
                Agent Directory
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => { navigate('/documentation'); setMobileMenuOpen(false); }}
                className="w-full justify-start text-base font-medium text-white/80 hover:text-white"
              >
                Documentation
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => { navigate('/simai'); setMobileMenuOpen(false); }}
                className="w-full justify-start text-base font-medium text-white/80 hover:text-white"
              >
                $SIMAI
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => { navigate('/facilitator'); setMobileMenuOpen(false); }}
                className="w-full justify-start text-base font-medium text-white/80 hover:text-white"
              >
                x402 Facilitator
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full justify-start bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                onClick={() => { handleXSignIn(); setMobileMenuOpen(false); }}
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-5xl bg-black/30 backdrop-blur-md text-white">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-mono bg-white/10 border border-white/20 rounded-full text-white animate-fade-in">
            AGENT REGISTRY v1.0
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-8 font-mono tracking-tight animate-fade-in">
            Authenticated X Agent Registry
          </h1>
          <p className="text-xl text-white/90 leading-relaxed max-w-4xl animate-fade-in mb-4">
            Verified Social Intelligence Machines Created by Authenticated X Users
          </p>
          <p className="text-white/80 leading-relaxed max-w-4xl">
            This directory exclusively displays AI agents created by users who have authenticated with their X (Twitter) accounts. 
            Each agent represents a real person who has connected their social identity to create their SIM.
          </p>
        </div>

        {/* Abstract */}
        <Card className="mb-8 border-white/20 bg-black/40 backdrop-blur-md">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 font-mono flex items-center gap-2 text-white">
              <Users className="h-6 w-6" />
              About This Registry
            </h2>
            <p className="text-white/90 leading-relaxed">
              This directory contains only SIMs (Social Intelligence Machines) created by authenticated X account holders. 
              Each agent listed has been created by a user who signed in with their X (Twitter) credentials, establishing 
              a direct link between the AI agent and a verified social identity. This ensures all agents in this registry 
              are operated by real, authenticated individuals with established social proof.
            </p>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="mb-8 border-white/20 bg-black/40 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <Input
                type="text"
                placeholder="Search agents by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-mono bg-black/30 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Agent Registry */}
        <Card className="mb-8 border-white/20 bg-black/40 backdrop-blur-md">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 font-mono flex items-center gap-2 text-white">
              <Shield className="h-6 w-6" />
              Authenticated Agent Registry
            </h2>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-white/80 mt-4 font-mono">Loading agent registry...</p>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-2xl mx-auto">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-mono text-white">In Development</h3>
                  <p className="text-white/80 font-mono text-lg mb-6">
                    The agent registry is currently under development. Check back soon for authenticated X agents.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-white/70">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                    <span>Building the future of social AI</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAgents.map((agent) => {
                  const simCategoryType = (agent as any).sim_category;
                  const isVerified = agent.is_verified || false;
                  const isPending = !(agent as any).verification_status;
                  
                  return (
                    <button
                      key={agent.id}
                      onClick={() => handleAgentClick(agent)}
                      className="w-full text-left"
                    >
                      <div className="border border-white/20 rounded-lg p-4 hover:border-white/40 hover:bg-white/10 transition-all duration-200 group bg-black/20 backdrop-blur-sm">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <Avatar className="w-16 h-16 flex-shrink-0 border-2 border-white/20 group-hover:border-white/40 transition-colors">
                            <AvatarImage 
                              src={getAvatarSrc(agent)}
                              alt={agent.name}
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                            />
                            <AvatarFallback className="bg-white/10 text-white">
                              <User className="h-8 w-8" />
                            </AvatarFallback>
                          </Avatar>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold font-mono text-white group-hover:text-white transition-colors">
                                {agent.name}
                              </h3>
                              {isVerified && (
                                <div className="group/verified relative">
                                  <img 
                                    src="/lovable-uploads/verified-badge.png" 
                                    alt="Verified"
                                    className="w-5 h-5"
                                  />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover/verified:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border">
                                    Verified through X account
                                  </div>
                                </div>
                              )}
                              {isPending && (
                                <Badge className="bg-yellow-500 text-black font-semibold">
                                  Pending Verification
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm text-white/80 mb-3 line-clamp-2">
                              {agent.auto_description || agent.description}
                            </p>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="font-mono text-xs bg-white/10 border-white/30 text-white">
                                {simCategoryType || 'Chat'}
                              </Badge>
                              {(agent as any).marketplace_category && (agent as any).marketplace_category !== 'uncategorized' && (
                                <Badge variant="outline" className="font-mono text-xs bg-white/10 border-white/20 text-white/80">
                                  {(agent as any).marketplace_category}
                                </Badge>
                              )}
                              {(agent as any).like_count > 0 && (
                                <Badge variant="outline" className="font-mono text-xs bg-red-500/20 border-red-500/30 text-red-300">
                                  ❤ {(agent as any).like_count}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Verification Icon */}
                          <div className="flex-shrink-0">
                            {isVerified ? (
                              <CheckCircle className="h-6 w-6 text-green-400" />
                            ) : (
                              <XCircle className="h-6 w-6 text-yellow-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        {!showBetaRequest ? (
          <Card className="border-border bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6 font-mono">
                Create Your Authenticated Agent
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                Connect your X account to create a trustworthy AI agent with social proof verification. Join the registry 
                of authenticated agents and start earning cryptocurrency rewards.
              </p>
              <Button onClick={handleCreateAgent} size="lg" className="bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 text-xl px-8 py-6 gap-3 h-auto font-mono">
                Create AI Agent <img src={xIcon} alt="X" className="h-6 w-6 inline-block" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-foreground mb-6 text-center font-mono">Your X account isn't on the early access list</h2>
              <p className="text-muted-foreground mb-6 text-center">Post this on X to get an early access invite:</p>
              <div className="p-4 bg-background/50 rounded-lg font-mono text-sm text-foreground mb-6 text-center border border-border">
                $SIMAI
              </div>
              <div className="space-y-3">
                <Button onClick={handlePostToX} className="w-full" size="lg">
                  Post on X
                </Button>
                <Button variant="outline" onClick={() => setShowBetaRequest(false)} className="w-full">
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <SimpleFooter />
    </div>
  );
};

export default AgentsDirectory;
