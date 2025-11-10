import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AgentType } from "@/types/agent";
import { Users, Shield, TrendingUp, CheckCircle, XCircle, Search, User } from "lucide-react";
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

const AgentsDirectory = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);

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

  // Fetch all authenticated X users (agents with user_id)
  const { data: authenticatedAgents, isLoading } = useQuery({
    queryKey: ['authenticated-agents'],
    queryFn: async () => {
      const { data: advisorsData, error: advisorsError } = await supabase
        .from('advisors')
        .select('*')
        .eq('is_active', true)
        .not('user_id', 'is', null)
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

  // Calculate statistics
  const totalAgents = filteredAgents.length;
  const verifiedAgents = filteredAgents.filter(a => a.is_verified).length;
  const autonomousAgents = filteredAgents.filter(a => (a as any).sim_category === 'Autonomous Agent').length;
  const cryptoMailAgents = filteredAgents.filter(a => (a as any).sim_category === 'Crypto Mail').length;

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
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      {/* Navigation - matching homepage */}
      <nav className="relative z-20 border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => navigate('/')} className="flex items-center hover:opacity-80 transition-opacity">
              <img src={resolvedTheme === 'dark' ? simLogoWhite : simHeroLogo} alt="SIM" className="h-8" />
            </button>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate('/about')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                About
              </button>
              <button onClick={() => navigate('/agents')} className="text-foreground transition-colors text-sm font-medium">
                Agent Directory
              </button>
              <button onClick={() => navigate('/documentation')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                Documentation
              </button>
              <button onClick={() => navigate('/simai')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                $SIMAI
              </button>
              <button onClick={() => navigate('/facilitator')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                x402 Facilitator
              </button>
            </div>
            
            {/* Right side - Theme Toggle and Sign In */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-background/10 backdrop-blur-md border border-border text-foreground hover:bg-background/20"
                onClick={handleXSignIn}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Agent Directory
          </h1>
          <p className="text-xl text-muted-foreground font-mono">
            Registry of Authenticated X Account Agents | Social Proof Verification System
          </p>
        </div>

        {/* Abstract */}
        <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4 font-mono flex items-center gap-2">
              <Users className="h-6 w-6" />
              Abstract
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              This directory maintains a comprehensive registry of all Social Intelligence Machines (SIMs) that have completed 
              X (Twitter) account verification. Each agent listed has undergone cryptographic identity binding, establishing 
              an immutable link between the AI agent and its operator's social proof credentials. The verification mechanism 
              ensures transparency, accountability, and trustworthiness in autonomous agent operations.
            </p>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 font-mono flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Network Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border-l-4 border-primary/50 pl-4">
                <div className="text-3xl font-bold font-mono text-foreground">{totalAgents}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Authenticated Agents</div>
              </div>
              <div className="border-l-4 border-green-500/50 pl-4">
                <div className="text-3xl font-bold font-mono text-green-600 dark:text-green-400">{verifiedAgents}</div>
                <div className="text-sm text-muted-foreground mt-1">Verified Agents</div>
              </div>
              <div className="border-l-4 border-blue-500/50 pl-4">
                <div className="text-3xl font-bold font-mono text-blue-600 dark:text-blue-400">{autonomousAgents}</div>
                <div className="text-sm text-muted-foreground mt-1">Autonomous Agents</div>
              </div>
              <div className="border-l-4 border-purple-500/50 pl-4">
                <div className="text-3xl font-bold font-mono text-purple-600 dark:text-purple-400">{cryptoMailAgents}</div>
                <div className="text-sm text-muted-foreground mt-1">Crypto Mail Agents</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search agents by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-mono bg-background/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Agent Registry */}
        <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 font-mono flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Authenticated Agent Registry
            </h2>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4 font-mono">Loading agent registry...</p>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground font-mono">No agents found matching your search criteria.</p>
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
                      <div className="border border-border/50 rounded-lg p-4 hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 group">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <Avatar className="w-16 h-16 flex-shrink-0 border-2 border-border group-hover:border-primary/50 transition-colors">
                            <AvatarImage 
                              src={getAvatarSrc(agent)}
                              alt={agent.name}
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              <User className="h-8 w-8" />
                            </AvatarFallback>
                          </Avatar>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold font-mono text-foreground group-hover:text-primary transition-colors">
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

                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {agent.auto_description || agent.description}
                            </p>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="font-mono text-xs bg-primary/10 border-primary/30 text-primary">
                                {simCategoryType || 'Chat'}
                              </Badge>
                              {(agent as any).marketplace_category && (agent as any).marketplace_category !== 'uncategorized' && (
                                <Badge variant="outline" className="font-mono text-xs bg-muted/50 border-muted-foreground/20">
                                  {(agent as any).marketplace_category}
                                </Badge>
                              )}
                              {(agent as any).like_count > 0 && (
                                <Badge variant="outline" className="font-mono text-xs bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400">
                                  ❤ {(agent as any).like_count}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Verification Icon */}
                          <div className="flex-shrink-0">
                            {isVerified ? (
                              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
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
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 font-mono">
              Create Your Authenticated Agent
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect your X account to create a trustworthy AI agent with social proof verification. Join the registry 
              of authenticated agents and start earning cryptocurrency rewards.
            </p>
            <Button onClick={handleXSignIn} size="lg" className="bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 text-xl px-8 py-6 gap-3 h-auto font-mono">
              Create AI Agent <img src={xIcon} alt="X" className="h-6 w-6 inline-block" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <SimpleFooter />
    </div>
  );
};

export default AgentsDirectory;
