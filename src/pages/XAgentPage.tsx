import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Users, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicChatInterface from "@/components/PublicChatInterface";
import { XMessageBoard } from "@/components/XMessageBoard";
import { AgentType } from "@/types/agent";
import { toast } from "sonner";
import xIcon from "@/assets/x-icon.png";

export default function XAgentPage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentType | null>(null);
  const [xData, setXData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usernameCopied, setUsernameCopied] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);

  useEffect(() => {
    if (username) {
      fetchAgent();
    }
  }, [username]);

  const fetchTotalEarnings = async (agentId: string) => {
    try {
      const { data, error } = await supabase
        .from('x_messages')
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
      
      // Find agent by X username in social_links
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('sim_category', 'Crypto Mail')
        .eq('is_active', true);

      if (error) throw error;

      // Find the agent with matching X username
      const matchingAgent = data?.find(agent => {
        const socialLinks = agent.social_links as { x_username?: string } | null;
        return socialLinks?.x_username?.toLowerCase() === username?.toLowerCase();
      });

      if (!matchingAgent) {
        toast.error("Agent not found");
        navigate('/agents');
        return;
      }

      // Transform to AgentType
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
      } as any;

      setAgent(transformedAgent);

      // Fetch total earnings
      fetchTotalEarnings(matchingAgent.id);

      // Fetch real-time X data
      try {
        const { data: xResponse, error: xError } = await supabase.functions.invoke("x-intelligence", {
          body: { username: username?.replace('@', '') },
        });

        if (!xError && xResponse?.success && xResponse?.report) {
          setXData({
            ...xResponse.report,
            tweets: xResponse.tweets || []
          });
        }
      } catch (error) {
        console.error('Error fetching X data:', error);
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
      toast.error("Failed to load agent");
      navigate('/agents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUsername = () => {
    if (username) {
      navigator.clipboard.writeText(`@${username}`);
      setUsernameCopied(true);
      setTimeout(() => setUsernameCopied(false), 2000);
      toast.success("Username copied!");
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
    
    // Handle Twitter/X images with CORS proxy
    if (url.includes('pbs.twimg.com') || url.includes('twimg.com')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    }
    
    // Handle IPFS URLs
    if (url.includes('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    
    // Handle gateway.pinata.cloud URLs
    if (url.includes('gateway.pinata.cloud')) {
      const hash = url.split('/ipfs/')[1];
      if (hash) {
        return `https://ipfs.io/ipfs/${hash}`;
      }
    }
    
    // Handle cf-ipfs.com URLs (which are failing)
    if (url.includes('cf-ipfs.com')) {
      const hash = url.split('/ipfs/')[1];
      if (hash) {
        return `https://ipfs.io/ipfs/${hash}`;
      }
    }
    
    return url;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Agent Not Found</h1>
          <Button onClick={() => navigate('/agents')}>Back to Agents</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/agents')}
              className="gap-2 h-9 px-2 md:px-3"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <img src={xIcon} alt="X" className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-xs md:text-sm font-medium text-muted-foreground">X Agent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - X Profile Info & Stats */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Profile Header - Enhanced Design */}
            <Card className="border-border bg-card/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="p-5 md:p-6">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 shrink-0 ring-2 ring-[#81f4aa]/20" style={{ borderColor: '#81f4aa' }}>
                      <AvatarImage 
                        src={getImageUrl(xData?.profilePicture || agent.avatar)} 
                        alt={agent.name}
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <AvatarFallback className="text-lg font-bold">{agent.name[0]}</AvatarFallback>
                    </Avatar>
                    {xData?.verified && (
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#81f4aa' }}>
                        <span className="text-black text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1 flex-wrap">
                      <CardTitle className="text-xl md:text-2xl break-words font-bold">{xData?.displayName || agent.name}</CardTitle>
                    </div>
                    <CardDescription className="text-sm md:text-base mb-3 break-all font-medium opacity-70">
                      @{xData?.username || username}
                    </CardDescription>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs px-2.5 py-1 font-medium" style={{ backgroundColor: 'rgba(129, 244, 170, 0.15)', color: '#81f4aa', borderColor: 'rgba(129, 244, 170, 0.3)' }}>
                        <Users className="h-3 w-3 mr-1.5" style={{ color: '#81f4aa' }} />
                        {formatNumber(xData?.metrics?.followers)} Followers
                      </Badge>
                      <Badge variant="secondary" className="text-xs px-2.5 py-1 font-medium" style={{ backgroundColor: 'rgba(129, 244, 170, 0.15)', color: '#81f4aa', borderColor: 'rgba(129, 244, 170, 0.3)' }}>
                        💰 ${totalEarnings.toFixed(0)} Earned
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              {(xData?.bio || xData?.location) && (
                <CardContent className="p-5 md:p-6 pt-0 md:pt-0 space-y-3">
                  {xData?.bio && (
                    <p className="text-sm md:text-base text-foreground/80 leading-relaxed line-clamp-3 md:line-clamp-none">
                      {xData.bio}
                    </p>
                  )}
                  {xData?.location && (
                    <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                      <span>📍</span> {xData.location}
                    </p>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Message Board */}
            <XMessageBoard
              agentId={agent.id}
              agentName={agent.name}
              agentAvatar={xData?.profilePicture || agent.avatar}
              price={agent.x402_price || 5}
              walletAddress={(agent.social_links as any)?.x402_wallet}
              xUsername={xData?.username || username}
            />
          </div>

          {/* Right Column - Chat Interface (Hidden on mobile) */}
          <div className="lg:col-span-1 hidden lg:block">
            <Card className="border-border bg-card/80 backdrop-blur-sm sticky top-24 shadow-lg">
              <CardHeader className="p-5">
                <CardTitle className="text-lg font-bold">{xData?.username || username} AI</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  AI agent trained on their actual posts to represent their voice and ideas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px] overflow-hidden">
                  <PublicChatInterface agent={agent} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
