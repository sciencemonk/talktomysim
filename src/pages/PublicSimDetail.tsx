import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import PublicChatInterface from "@/components/PublicChatInterface";
import { AgentType } from "@/types/agent";
import { Sim } from "@/types/sim";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { updateMetaTags, resetMetaTags } from "@/lib/metaTags";
import { 
  ArrowLeft, 
  Globe, 
  Wallet, 
  Copy, 
  Check, 
  TrendingUp, 
  Activity, 
  Coins,
  ExternalLink,
  MessageSquare,
  Clock
} from "lucide-react";
import simHeroLogo from "@/assets/sim-hero-logo.png";
import simLogoWhite from "@/assets/sim-logo-white.png";
import SimpleFooter from "@/components/SimpleFooter";

interface ActivityLog {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
}

const PublicSimDetail = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [sim, setSim] = useState<Sim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletCopied, setWalletCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [simaiBalance, setSimaiBalance] = useState(1247); // Mock data
  const [ranking, setRanking] = useState(42); // Mock data
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

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
    startActivitySimulation();
    
    return () => {
      resetMetaTags();
    };
  }, [identifier]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const startActivitySimulation = () => {
    // Add initial activities
    const initialActivities: ActivityLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 120000),
        action: 'Conversation',
        details: 'Completed chat with user about crypto trends'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 300000),
        action: 'Transaction',
        details: 'Earned 15 $SIMAI from user interaction'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 480000),
        action: 'Analysis',
        details: 'Analyzed trending topics on X'
      }
    ];
    setActivityLogs(initialActivities);

    // Simulate real-time activity every 30 seconds
    const interval = setInterval(() => {
      const actions = [
        'Processing conversation request',
        'Analyzing user sentiment',
        'Generating response',
        'Earned $SIMAI from interaction',
        'Updating knowledge base',
        'Monitoring X mentions'
      ];
      
      const newActivity: ActivityLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        action: actions[Math.floor(Math.random() * 3)] === actions[0] ? 'Active' : 'Processing',
        details: actions[Math.floor(Math.random() * actions.length)]
      };
      
      setActivityLogs(prev => [newActivity, ...prev].slice(0, 20));
    }, 30000);

    return () => clearInterval(interval);
  };

  const fetchSim = async () => {
    try {
      setIsLoading(true);
      
      console.log('Fetching SIM with identifier:', identifier);
      
      // Check if identifier is a UUID format
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier || '');
      
      // Build query conditionally based on identifier format
      let query = supabase
        .from('sims')
        .select('*')
        .eq('is_active', true);
      
      // Only include id comparison if it's a valid UUID
      if (isUUID) {
        query = query.or(`custom_url.eq.${identifier},id.eq.${identifier},x_username.ilike.${identifier}`);
      } else {
        query = query.or(`custom_url.eq.${identifier},x_username.ilike.${identifier}`);
      }
      
      let { data: simData, error: simError } = await query.maybeSingle();
      
      console.log('Sims query result:', { simData, simError });

      // If not found in sims, try advisors (legacy)
      if (!simData && !simError) {
        let advisorQuery = supabase
          .from('advisors')
          .select('*')
          .eq('is_active', true);
        
        // Only include id comparison if it's a valid UUID
        if (isUUID) {
          advisorQuery = advisorQuery.or(`custom_url.eq.${identifier},id.eq.${identifier}`);
        } else {
          advisorQuery = advisorQuery.eq('custom_url', identifier);
        }
        
        const { data: advisorData, error: advisorError } = await advisorQuery.maybeSingle();
        
        console.log('Advisors query result:', { advisorData, advisorError });

        if (advisorData) {
          // Convert advisor to sim format - map fields properly
          simData = {
            ...advisorData,
            x_username: (advisorData.social_links as any)?.x_username || advisorData.custom_url || 'unknown',
            x_display_name: (advisorData.social_links as any)?.x_display_name || advisorData.name,
            training_completed: (advisorData.social_links as any)?.trained || false,
            training_post_count: (advisorData.social_links as any)?.trainingPostCount || 0,
          } as any;
        }
      }

      if (!simData) {
        console.log('No SIM found for identifier:', identifier, '- Using test data for development');
        
        // For testing purposes, create test data if identifier is 'testuser'
        if (identifier?.toLowerCase() === 'testuser') {
          simData = {
            id: 'test-sim-id',
            user_id: 'test-user-id',
            name: 'Test User',
            description: 'This is a test SIM for development purposes. A friendly AI agent ready to help!',
            prompt: 'You are a helpful AI assistant created for testing purposes.',
            welcome_message: 'Hi! I\'m Test User, your test SIM. This is test data for development. How can I help you today?',
            x_username: 'testuser',
            x_display_name: 'Test User',
            twitter_url: 'https://twitter.com/testuser',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser',
            crypto_wallet: 'EaS8MWRj6qNqkNLjGKjhqgXtV1KmAXCUDHqHpump',
            is_verified: false,
            verification_status: false,
            verified_at: null,
            edit_code: '',
            custom_url: 'testuser',
            is_active: true,
            is_public: true,
            integrations: ['solana-explorer', 'pumpfun', 'x-analyzer'],
            social_links: {},
            training_completed: false,
            training_post_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            creator_prompt: '',
            stranger_prompt: '',
            sim_to_sim_prompt: ''
          } as any;
          
          toast({
            title: "Using test data",
            description: "This is a test SIM for development purposes"
          });
        } else {
          navigate('/404');
          return;
        }
      }

      // Ensure all fields are properly typed for Sim interface
      const typedSim: Sim = {
        id: simData.id,
        user_id: simData.user_id,
        name: simData.name,
        description: simData.description,
        prompt: simData.prompt,
        welcome_message: simData.welcome_message,
        x_username: simData.x_username,
        x_display_name: simData.x_display_name,
        twitter_url: simData.twitter_url,
        avatar_url: simData.avatar_url,
        crypto_wallet: simData.crypto_wallet,
        is_verified: simData.is_verified,
        verification_status: simData.verification_status,
        verified_at: simData.verified_at,
        edit_code: simData.edit_code || '',
        custom_url: simData.custom_url,
        is_active: simData.is_active,
        is_public: simData.is_public,
        integrations: Array.isArray(simData.integrations) ? simData.integrations as string[] : [],
        social_links: simData.social_links as Sim['social_links'],
        training_completed: simData.training_completed || false,
        training_post_count: simData.training_post_count || 0,
        created_at: simData.created_at,
        updated_at: simData.updated_at,
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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

      {/* Hero Section with Stats */}
      <div className="border-b border-border bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar and Name */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary ring-4 ring-primary/20">
                <AvatarImage src={getAvatarUrl(sim.avatar_url)} alt={sim.name} />
                <AvatarFallback className="text-2xl">{sim.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold font-mono">{sim.name}</h1>
                  {sim.is_verified && (
                    <img src="/lovable-uploads/verified-badge.png" alt="Verified" className="h-6 w-6" />
                  )}
                </div>
                <p className="text-muted-foreground">{sim.description}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 ml-auto">
              {/* $SIMAI Balance */}
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Coins className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">$SIMAI Balance</p>
                      <p className="text-2xl font-bold font-mono">{simaiBalance.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ranking */}
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ranking</p>
                      <p className="text-2xl font-bold font-mono">#{ranking}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Wallet & X Links */}
              <Card className="bg-card/50">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    {sim.twitter_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => window.open(sim.twitter_url, '_blank')}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        View on X
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </Button>
                    )}
                    {sim.crypto_wallet && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={handleCopyWallet}
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        <span className="truncate flex-1 text-left text-xs">
                          {sim.crypto_wallet.slice(0, 8)}...{sim.crypto_wallet.slice(-6)}
                        </span>
                        {walletCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Chat and Activity */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Chat Interface - 2/3 width */}
            <div className="lg:col-span-2 h-full min-h-[600px] max-h-[calc(100vh-400px)]">
              <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm">
                <CardHeader className="border-b border-border/50 pb-4 flex-shrink-0">
                  <CardTitle className="flex items-center gap-2 font-mono">
                    <MessageSquare className="h-5 w-5" />
                    Chat with {sim.name}
                  </CardTitle>
                </CardHeader>
                <div className="flex-1 overflow-hidden min-h-0">
                  <PublicChatInterface 
                    agent={agentForChat}
                    avatarUrl={getAvatarUrl(sim.avatar_url)}
                  />
                </div>
              </Card>
            </div>

            {/* Right Sidebar - God View + Activity */}
            <div className="h-full min-h-[600px] max-h-[calc(100vh-400px)] flex flex-col gap-6">
              {/* God View - Where is the SIM */}
              <Card className="flex-shrink-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 font-mono text-lg">
                    <Globe className="h-5 w-5 text-primary" />
                    Digital Universe
                    <Badge variant="secondary" className="ml-auto">
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                      Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Current Location */}
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg shrink-0">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Current Location</p>
                        <p className="text-sm font-medium">X (Twitter) Platform</p>
                        <p className="text-xs text-muted-foreground mt-1">Monitoring mentions and trends</p>
                      </div>
                    </div>
                  </div>

                  {/* Current Activity */}
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-accent/20 rounded-lg shrink-0">
                        <MessageSquare className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Current Task</p>
                        <p className="text-sm font-medium">Engaging in conversations</p>
                        <p className="text-xs text-muted-foreground mt-1">2 active chats</p>
                      </div>
                    </div>
                  </div>

                  {/* Network Status */}
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg shrink-0">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Network</p>
                        <p className="text-sm font-medium">Solana Mainnet</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-1.5 flex-1 bg-background rounded-full overflow-hidden">
                            <div className="h-full w-[85%] bg-primary rounded-full"></div>
                          </div>
                          <span className="text-xs text-muted-foreground">85%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Activity Feed */}
              <Card className="flex-1 min-h-0 flex flex-col bg-card/50 backdrop-blur-sm">
                <CardHeader className="border-b border-border/50 pb-4 flex-shrink-0">
                  <CardTitle className="flex items-center gap-2 font-mono text-lg">
                    <Activity className="h-5 w-5 text-primary" />
                    Live Activity
                    <Badge variant="secondary" className="ml-auto">
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                      Live
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 min-h-0">
                  <ScrollArea className="h-full px-4 py-4">
                    <div className="space-y-3">
                      {activityLogs.map((log) => (
                        <div 
                          key={log.id}
                          className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted/70 transition-colors"
                        >
                          <div className="shrink-0">
                            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {log.action}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed break-words">
                              {log.details}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <SimpleFooter />
    </div>
  );
};

export default PublicSimDetail;
