import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Menu, Copy, Check, Coins, TrendingUp, Activity, Clock, Settings, ExternalLink, ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GodModeMap } from "@/components/GodModeMap";
import { SimSettingsModal } from "@/components/SimSettingsModal";
import PublicChatInterface from "@/components/PublicChatInterface";
import { Sim } from "@/types/sim";
import { AgentType } from "@/types/agent";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";
import simHeroLogo from "@/assets/sim-hero-logo.png";
import simLogoWhite from "@/assets/sim-logo-white.png";
import SimpleFooter from "@/components/SimpleFooter";
import { AddActionModal } from "@/components/AddActionModal";
import { useSimActions } from "@/hooks/useSimActions";
import { AddLinkModal } from "@/components/AddLinkModal";
import { TipButton } from "@/components/TipButton";
import { ExternalLink as ExternalLinkIcon, Link as LinkIcon } from "lucide-react";

interface ActivityLog {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
}

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userSim, setUserSim] = useState<Sim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletCopied, setWalletCopied] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [simaiBalance, setSimaiBalance] = useState(1247);
  const [ranking, setRanking] = useState(42);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [editingAction, setEditingAction] = useState<{
    id: string;
    description: string;
    end_goal: string;
    usdc_amount: number;
  } | undefined>(undefined);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<{
    id: string;
    label: string;
    url: string;
  } | undefined>(undefined);
  const [customLinks, setCustomLinks] = useState<Array<{ id: string; label: string; url: string }>>([]);
  
  const { actions, isLoading: actionsLoading, deleteAction } = useSimActions(userSim?.id);

  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);

  useEffect(() => {
    if (!authLoading) {
      fetchUserSim();
      startActivitySimulation();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (userSim?.social_links) {
      setCustomLinks((userSim.social_links as any[]) || []);
    }
  }, [userSim]);

  const startActivitySimulation = () => {
    const initialActivities: ActivityLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 120000),
        action: 'Processing',
        details: 'Analyzing user sentiment'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 300000),
        action: 'Active',
        details: 'Updating knowledge base'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 480000),
        action: 'Transaction',
        details: 'Earned $SIMAI from interaction'
      }
    ];
    setActivityLogs(initialActivities);

    const interval = setInterval(() => {
      const actions = [
        'Processing conversation request',
        'Analyzing user sentiment',
        'Updating knowledge base',
        'Earned $SIMAI from interaction'
      ];
      
      const newActivity: ActivityLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        action: Math.random() > 0.5 ? 'Active' : 'Processing',
        details: actions[Math.floor(Math.random() * actions.length)]
      };
      
      setActivityLogs(prev => [newActivity, ...prev].slice(0, 20));
    }, 30000);

    return () => clearInterval(interval);
  };

  const fetchUserSim = async () => {
    try {
      setIsLoading(true);
      
      // For testing: if no user, use test data
      if (!user) {
        const testSim: Sim = {
          id: 'test-id',
          user_id: 'test-user',
          name: 'Test User',
          description: 'This is a test SIM for development purposes. A friendly AI agent ready to help!',
          prompt: 'You are a helpful AI assistant.',
          creator_prompt: 'You are speaking with your creator. Be detailed and technical.',
          stranger_prompt: 'You are speaking with a visitor. Be friendly and welcoming.',
          sim_to_sim_prompt: 'You are communicating with another AI agent. Be collaborative.',
          welcome_message: 'Hello! How can I help you today?',
          x_username: 'testuser',
          x_display_name: 'Test User',
          twitter_url: 'https://twitter.com/testuser',
          avatar_url: '/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png',
          crypto_wallet: 'Ea8MxoojkvVBV3XOttAcB1WeXs1',
          is_verified: true,
          verification_status: true,
          verified_at: new Date().toISOString(),
          edit_code: 'test-code',
          custom_url: 'testuser',
          is_active: true,
          is_public: true,
          integrations: [],
          social_links: null,
          training_completed: false,
          training_post_count: 0,
          interaction_style: 'Collaborative and value-driven',
          exploration_style: 'Curious and methodical',
          primary_objective: 'Build meaningful partnerships',
          interaction_autonomy: 5,
          exploration_frequency: 5,
          objective_focus: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUserSim(testSim);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('sims')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setUserSim(data);
    } catch (error) {
      console.error('Error fetching user sim:', error);
      toast({
        title: "Error",
        description: "Failed to load your SIM",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (updatedData: Partial<Sim>) => {
    try {
      const { error } = await supabase
        .from('sims')
        .update(updatedData)
        .eq('id', userSim?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your SIM settings have been updated"
      });
      
      fetchUserSim();
    } catch (error) {
      console.error('Failed to update SIM:', error);
      toast({
        title: "Error",
        description: "Failed to update your SIM",
        variant: "destructive"
      });
      throw error;
    }
  };

  const copyWalletAddress = () => {
    if (!userSim?.crypto_wallet) return;
    navigator.clipboard.writeText(userSim.crypto_wallet);
    setWalletCopied(true);
    setTimeout(() => setWalletCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard"
    });
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userSim) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">No SIM Found</h1>
          <p className="text-muted-foreground mb-6">Create your SIM to get started</p>
          <Button onClick={() => navigate('/onboarding')}>
            Create Your SIM
          </Button>
        </div>
      </div>
    );
  }

  // Convert Sim to AgentType for chat interface
  const agentForChat: AgentType = {
    id: userSim.id,
    name: userSim.name,
    avatar: userSim.avatar_url || '',
    prompt: userSim.creator_prompt || userSim.prompt,
    welcome_message: userSim.welcome_message || null,
    sim_category: 'Chat',
    description: userSim.description,
    type: 'General Tutor',
    status: 'active',
    createdAt: userSim.created_at,
    updatedAt: userSim.updated_at
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate('/dashboard')} className="flex items-center hover:opacity-80 transition-opacity">
              <div className="bg-black/90 rounded-lg px-2 py-1">
                <img src="/sim-logo-white.png" alt="SIM" className="h-6 w-auto" />
              </div>
            </button>
            
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-sm font-medium hover:text-primary"
              >
                Home
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/godmode')}
                className="text-sm font-medium hover:text-primary"
              >
                God Mode
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.open(`/${userSim?.custom_url || userSim?.x_username}`, '_blank')}
                className="text-sm font-medium hover:text-primary"
              >
                Public Page
              </Button>
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/landing');
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 overflow-auto pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={getAvatarUrl(userSim.avatar_url)} alt={userSim.name} />
                <AvatarFallback>{userSim.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{userSim.name}</h1>
                <p className="text-muted-foreground">{userSim.description || "Your AI SIM in the digital universe"}</p>
                
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {/* Custom Links */}
                  {customLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customLinks.map((link) => (
                        <div
                          key={link.id}
                          className="group relative inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <ExternalLinkIcon className="h-3 w-3" />
                            {link.label}
                          </a>
                          <div className="hidden group-hover:flex gap-1 ml-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                              onClick={(e) => {
                                e.preventDefault();
                                setEditingLink(link);
                                setShowAddLinkModal(true);
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                              onClick={async (e) => {
                                e.preventDefault();
                                const updatedLinks = customLinks.filter((l) => l.id !== link.id);
                                await supabase
                                  .from("sims")
                                  .update({ social_links: updatedLinks })
                                  .eq("id", userSim.id);
                                setCustomLinks(updatedLinks);
                                toast({
                                  title: "Link deleted",
                                  description: "The link has been removed successfully",
                                });
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Link Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      setEditingLink(undefined);
                      setShowAddLinkModal(true);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                    Add Link
                  </Button>
                  
                  {/* Tip Button */}
                  {userSim.crypto_wallet && (
                    <TipButton 
                      simName={userSim.name}
                      walletAddress={userSim.crypto_wallet}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/${userSim.custom_url || userSim.x_username}`, '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Public Page
              </Button>
              <Button
                size="sm"
                onClick={() => setShowSettingsModal(true)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">$SIMAI Balance</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{simaiBalance.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ranking</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">#{ranking}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wallet</CardTitle>
                <Copy className="h-4 w-4 text-muted-foreground cursor-pointer" onClick={copyWalletAddress} />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-mono truncate">
                  {userSim.crypto_wallet ? `${userSim.crypto_wallet.slice(0, 8)}...${userSim.crypto_wallet.slice(-6)}` : 'Not set'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Your SIM Map - Takes 2 columns */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Your SIM
                    </CardTitle>
                    <Badge variant="secondary" className="gap-1">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0 h-[600px]">
                  <GodModeMap agentName={userSim.name} />
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Live Activity */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="h-4 w-4 text-primary" />
                      Live Activity
                    </CardTitle>
                    <Badge variant="secondary" className="gap-1">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                      {activityLogs.map((log) => (
                        <div key={log.id} className="flex gap-3 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-muted-foreground text-xs">{formatTimeAgo(log.timestamp)}</p>
                            <p className="text-foreground break-words">{log.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions Management Section */}
          {actions.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Manage Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {actions.map((action) => (
                    <div
                      key={action.id}
                      className="group relative p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-medium text-sm flex-1">{action.description}</p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditingAction({
                                id: action.id,
                                description: action.description,
                                end_goal: action.end_goal,
                                usdc_amount: action.usdc_amount,
                              });
                              setShowAddActionModal(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => deleteAction(action.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {action.end_goal}
                      </p>
                      {action.usdc_amount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          ${action.usdc_amount} USDC
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Settings Modal */}
      {userSim && (
        <SimSettingsModal
          open={showSettingsModal}
          onOpenChange={setShowSettingsModal}
          sim={userSim}
          onSave={handleSaveSettings}
        />
      )}

      {/* Add Action Modal */}
      {userSim && (
        <AddActionModal
          open={showAddActionModal}
          onOpenChange={(open) => {
            setShowAddActionModal(open);
            if (!open) setEditingAction(undefined);
          }}
          simId={userSim.id}
          actionToEdit={editingAction}
          onActionSaved={() => {
            // Refetch is handled by react-query
          }}
        />
      )}

      {/* Add Link Modal */}
      {userSim && (
        <AddLinkModal
          open={showAddLinkModal}
          onOpenChange={(open) => {
            setShowAddLinkModal(open);
            if (!open) setEditingLink(undefined);
          }}
          simId={userSim.id}
          linkToEdit={editingLink}
          onLinkSaved={() => {
            fetchUserSim();
          }}
        />
      )}

      {/* Footer */}
      <SimpleFooter />
    </div>
  );
};

export default UserDashboard;
