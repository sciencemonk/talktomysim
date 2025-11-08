import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XAgentStoreManager } from "@/components/XAgentStoreManager";
import { XAgentPurchases } from "@/components/XAgentPurchases";
import { XAgentSimPageEditor } from "@/components/XAgentSimPageEditor";
import { AgentType } from "@/types/agent";
import { toast } from "sonner";
import xIcon from "@/assets/x-icon.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function XAgentCreatorView() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  
  const [agent, setAgent] = useState<AgentType | null>(null);
  const [xData, setXData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userXUsername, setUserXUsername] = useState<string | null>(null);

  // Check authentication and authorization
  useEffect(() => {
    const checkAuth = async () => {
      if (authLoading) return;
      
      if (!user) {
        toast.error("You must be signed in with X to access this page");
        navigate('/login');
        return;
      }

      // Get user's X username from their metadata
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const userMetadata = authUser?.user_metadata;
      const xUsername = userMetadata?.user_name || userMetadata?.preferred_username;
      
      if (!xUsername) {
        toast.error("X username not found in your account. Please sign in with X again.");
        navigate('/login');
        return;
      }

      setUserXUsername(xUsername);
    };

    checkAuth();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (username && userXUsername) {
      fetchAgent();
    }
  }, [username, userXUsername]);

  const fetchTotalEarnings = async (agentId: string) => {
    try {
      const { data, error } = await supabase
        .from('x_agent_purchases')
        .select('payment_amount')
        .eq('agent_id', agentId);

      if (error) throw error;

      const total = data?.reduce((sum, msg) => sum + Number(msg.payment_amount), 0) || 0;
      setTotalEarnings(total);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  const fetchAgent = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('advisors')
        .select('id, name, description, prompt, avatar_url, welcome_message, title, created_at, updated_at, is_active, is_verified, x402_enabled, x402_price, x402_wallet, crypto_wallet, sim_category, social_links, edit_code')
        .eq('sim_category', 'Crypto Mail');

      if (error) throw error;

      const matchingAgent = data?.find(agent => {
        const socialLinks = agent.social_links as { x_username?: string; userName?: string } | null;
        const storedUsername = (socialLinks?.userName || socialLinks?.x_username || '').toLowerCase();
        return storedUsername === username?.toLowerCase();
      });

      if (!matchingAgent) {
        console.error("Agent not found for username:", username);
        console.log("Available agents:", data?.map(a => {
          const sl = a.social_links as any;
          return { id: a.id, x_username: sl?.x_username };
        }));
        setIsLoading(false);
        // Don't redirect - show error in UI instead
        return;
      }

      const transformedAgent: AgentType = {
        id: matchingAgent.id,
        name: matchingAgent.name,
        description: matchingAgent.description || '',
        type: 'General Tutor',
        status: 'active',
        createdAt: matchingAgent.created_at,
        updatedAt: matchingAgent.updated_at,
        avatar: matchingAgent.avatar_url,
        prompt: matchingAgent.prompt,
        welcome_message: matchingAgent.welcome_message,
        title: matchingAgent.title,
        sim_type: 'living',
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
        voiceTraits: [],
        social_links: matchingAgent.social_links as any,
        sim_category: matchingAgent.sim_category || 'Crypto Mail',
        is_verified: matchingAgent.is_verified || false,
        x402_enabled: matchingAgent.x402_enabled || false,
        x402_price: matchingAgent.x402_price || 5.0,
        integrations: Array.isArray((matchingAgent as any).integrations) ? (matchingAgent as any).integrations : [],
      } as any;

      setAgent(transformedAgent);
      setSystemPrompt(matchingAgent.prompt || "");
      
      // Load wallet address - prioritize x402_wallet, fallback to crypto_wallet
      const loadedWallet = matchingAgent.x402_wallet || matchingAgent.crypto_wallet || "";
      setWalletAddress(loadedWallet);
      
      // Verify authorization: user's X username must match agent's X username
      const socialLinks = transformedAgent.social_links as any;
      const agentXUsername = (socialLinks?.x_username || socialLinks?.userName || '').toLowerCase();
      const normalizedUserXUsername = userXUsername?.toLowerCase();
      
      if (agentXUsername !== normalizedUserXUsername) {
        toast.error("Unauthorized: You can only access your own agent's creator page");
        navigate(`/${username}`);
        return;
      }
      
      setIsAuthorized(true);
      fetchTotalEarnings(matchingAgent.id);

      // Only fetch fresh X data if cached data is stale (>24 hours old)
      const lastFetch = socialLinks?.last_twitter_fetch;
      const shouldFetchFresh = !lastFetch || 
        (new Date().getTime() - new Date(lastFetch).getTime()) > 24 * 60 * 60 * 1000;

      if (shouldFetchFresh) {
        console.log('Fetching fresh X data (cache is stale or missing)');
        try {
          const { data: xResponse, error: xError } = await supabase.functions.invoke("x-intelligence", {
            body: { 
              username: username?.replace('@', ''),
              forceRefresh: false // Let edge function use cache
            },
          });

          if (!xError && xResponse?.success && xResponse?.report) {
            setXData({
              ...xResponse.report,
              tweets: xResponse.tweets || []
            });
            console.log('X data source:', xResponse.cached ? 'cache' : 'fresh API');
          }
        } catch (error) {
          console.error('Error fetching X data:', error);
        }
      } else {
        console.log('Using existing cached X data');
        // Use cached data from social_links
        setXData({
          displayName: socialLinks.name || socialLinks.x_display_name,
          username: socialLinks.userName || socialLinks.x_username,
          bio: socialLinks.description,
          profileImageUrl: socialLinks.profilePicture || socialLinks.profile_image_url,
          verified: socialLinks.isVerified || socialLinks.isBlueVerified,
          metrics: {
            followers: socialLinks.followers,
            following: socialLinks.following,
          },
          tweets: socialLinks.tweet_history || []
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching agent:', error);
      toast.error("Failed to load agent");
      // Don't redirect on error - show error state instead
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!agent || !isAuthorized) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('advisors')
        .update({
          prompt: systemPrompt,
          updated_at: new Date().toISOString()
        })
        .eq('id', agent.id);

      if (error) throw error;

      toast.success("AI settings saved successfully!");
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error("Failed to log out");
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const getImageUrl = (url: string | undefined) => {
    if (!url) return undefined;
    
    if (url.includes('pbs.twimg.com') || url.includes('twimg.com')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    }
    
    if (url.includes('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    
    if (url.includes('gateway.pinata.cloud')) {
      const hash = url.split('/ipfs/')[1];
      if (hash) {
        return `https://ipfs.io/ipfs/${hash}`;
      }
    }
    
    if (url.includes('cf-ipfs.com')) {
      const hash = url.split('/ipfs/')[1];
      if (hash) {
        return `https://ipfs.io/ipfs/${hash}`;
      }
    }
    
    return url;
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Agent Not Found</CardTitle>
            <CardDescription>
              We couldn't find an X agent for @{username}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render anything if not authorized (redirect will happen in useEffect)
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/${username}`)}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img 
                src="/default-logo.png" 
                alt="SIM" 
                className="h-8 md:h-10 w-auto"
              />
            </button>
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-xs md:text-sm font-medium text-muted-foreground">Creator Dashboard</span>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 h-9 px-2 md:px-3"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-7xl">
        <div className="space-y-4 md:space-y-6">
          {/* Tabs */}
          <Tabs defaultValue="your-page" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="your-page">Your Page</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="purchases">Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="your-page" className="mt-6">
              <XAgentSimPageEditor
                agentId={agent.id}
                agentName={xData?.displayName || agent.name}
                agentUsername={xData?.username || username || ''}
                avatarUrl={xData?.profileImageUrl || agent.avatar}
                walletAddress={walletAddress}
                isVerified={xData?.verified}
              />
            </TabsContent>
            
            <TabsContent value="inventory" className="mt-6">
              <XAgentStoreManager 
                agentId={agent.id}
                walletAddress={walletAddress}
                onWalletUpdate={setWalletAddress}
              />
            </TabsContent>
            
            <TabsContent value="purchases" className="mt-6">
              <XAgentPurchases agentId={agent.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
