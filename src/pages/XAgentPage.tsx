import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Users, Copy, Check, Share2, ExternalLink } from "lucide-react";
import aiLoadingGif from "@/assets/ai-loading.gif";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import PublicChatInterface from "@/components/PublicChatInterface";
import { XAgentStorefront } from "@/components/XAgentStorefront";
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
  const [linkCopied, setLinkCopied] = useState(false);
  const [offerings, setOfferings] = useState<any[]>([]);

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
        navigate('/', { state: { scrollToAgents: true } });
        return;
      }

      // Fetch offerings for this agent
      const { data: offeringsData } = await supabase
        .from('x_agent_offerings')
        .select('*')
        .eq('agent_id', matchingAgent.id)
        .eq('is_active', true);

      setOfferings(offeringsData || []);

      // Fetch real-time X data and tweets
      let xResponse: any = null;
      try {
        const { data: xResponseData, error: xError } = await supabase.functions.invoke("x-intelligence", {
          body: { username: username?.replace('@', '') },
        });

        if (!xError && xResponseData?.success && xResponseData?.report) {
          xResponse = {
            ...xResponseData.report,
            tweets: xResponseData.tweets || []
          };
          setXData(xResponse);
        }
      } catch (error) {
        console.error('Error fetching X data:', error);
      }

      // Build enhanced prompt for X agents
      let enhancedPrompt = matchingAgent.prompt || `You are ${matchingAgent.name}, an AI assistant representing this X account.`;

      // Add persona from tweets if available
      if (xResponse?.tweets && xResponse.tweets.length > 0) {
        const recentTweets = xResponse.tweets.slice(0, 10);
        const tweetSample = recentTweets.map((t: any) => t.text).join('\n\n');
        enhancedPrompt += `\n\nYour communication style and personality should match the tone and topics from these recent tweets:\n${tweetSample}`;
      }

      // Add offerings information if available
      if (offeringsData && offeringsData.length > 0) {
        enhancedPrompt += `\n\nYou are here to help visitors learn about and purchase the following offerings:\n\n`;
        offeringsData.forEach((offering: any) => {
          enhancedPrompt += `**${offering.title}** - $${offering.price} USDC\n`;
          enhancedPrompt += `Description: ${offering.description}\n`;
          enhancedPrompt += `Delivery: ${offering.delivery_method}\n\n`;
        });
        enhancedPrompt += `\nWhen visitors ask about your services or what you offer, enthusiastically share information about these offerings. Explain how they can benefit from them and encourage them to make a purchase. Answer any questions they have about the offerings in detail. Make the conversation natural and engaging while subtly guiding them toward making a purchase.`;
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
        prompt: enhancedPrompt,
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
        x402_wallet: matchingAgent.x402_wallet,
      } as any;

      setAgent(transformedAgent);

      // Fetch total earnings
      fetchTotalEarnings(matchingAgent.id);

    } catch (error) {
      console.error('Error fetching agent:', error);
      toast.error("Failed to load agent");
      navigate('/', { state: { scrollToAgents: true } });
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

  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    toast.success("Link copied to clipboard!");
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
        <div className="bg-white rounded-2xl p-6 flex items-center justify-center">
          <img 
            src={aiLoadingGif} 
            alt="Loading..." 
            className="h-32 w-32"
          />
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Agent Not Found</h1>
          <Button onClick={() => navigate('/', { state: { scrollToAgents: true } })}>Back to Agents</Button>
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
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 ring-2 ring-[#81f4aa]/20" style={{ borderColor: '#81f4aa' }}>
                <AvatarImage 
                  src={getImageUrl(xData?.profileImageUrl || agent.avatar)} 
                  alt={agent.name}
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="text-sm">{agent.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-semibold">{xData?.displayName || agent.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatNumber(xData?.metrics?.followers)} Followers
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/x/${username}/creator`)}
              className="gap-2 h-9 px-2 md:px-3"
            >
              <span className="text-xs md:text-sm">Creator Access</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 md:px-4 max-w-7xl h-[calc(100vh-4rem)]">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 h-full py-6 md:py-8">
          {/* Left Column - Store (3/4 width) */}
          <div className="lg:col-span-3 h-full">
            {((agent as any).x402_wallet || (agent.social_links as any)?.x402_wallet) && (
              <ScrollArea className="h-full rounded-lg border border-border bg-card/80 backdrop-blur-sm shadow-xl p-6">
                <XAgentStorefront
                  agentId={agent.id}
                  agentName={agent.name}
                  walletAddress={(agent as any).x402_wallet || (agent.social_links as any)?.x402_wallet}
                />
              </ScrollArea>
            )}
          </div>

          {/* Right Column - AI Chat (1/4 width) */}
          <div className="lg:col-span-1 h-full">
            <div className="h-full overflow-hidden rounded-lg border border-border bg-card/80 backdrop-blur-sm shadow-xl">
              <PublicChatInterface 
                agent={agent} 
                avatarUrl={getImageUrl(xData?.profileImageUrl || agent.avatar)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
