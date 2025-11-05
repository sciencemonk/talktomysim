import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users, Copy, Check, Share2, ExternalLink } from "lucide-react";
import aiLoadingGif from "@/assets/ai-loading.gif";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { XAgentStorefront } from "@/components/XAgentStorefront";
import { AgentOfferingsDisplay } from "@/components/AgentOfferingsDisplay";
import { AgentChatModal } from "@/components/AgentChatModal";
import { XOfferingPurchaseModal } from "@/components/XOfferingPurchaseModal";
import { AgentInfoCollectionModal } from "@/components/AgentInfoCollectionModal";
import { SimDesignerChat } from "@/components/SimDesignerChat";
import { AgentType } from "@/types/agent";
import { toast } from "sonner";
import xIcon from "@/assets/x-icon.png";

export default function XAgentPage() {
  const params = useParams<{ username?: string; customUrl?: string }>();
  // Support both /:username and /:customUrl param names
  const username = params.username || params.customUrl;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code');
  const [agent, setAgent] = useState<AgentType | null>(null);
  const [xData, setXData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usernameCopied, setUsernameCopied] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [pendingAgent, setPendingAgent] = useState<any>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [collectedInfo, setCollectedInfo] = useState<Record<string, string>>({});
  const [designSettings, setDesignSettings] = useState<any>(null);
  const [socialLinks, setSocialLinks] = useState<any>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [editCode, setEditCode] = useState(codeFromUrl || "");

  useEffect(() => {
    if (username) {
      fetchAgent();
    }
  }, [username]);

  // Check if user is the creator
  useEffect(() => {
    const checkCreatorStatus = async () => {
      if (!agent) return;
      
      // Check if code from URL matches
      if (codeFromUrl && (agent as any).edit_code === codeFromUrl) {
        setIsCreator(true);
        return;
      }

      // Check if user is authenticated and owns the agent
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userAgents } = await supabase
          .from('advisors')
          .select('id')
          .eq('id', agent.id)
          .single();
        
        if (userAgents) {
          setIsCreator(true);
        }
      }
    };

    checkCreatorStatus();
  }, [agent, codeFromUrl]);

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
        .eq('is_active', true); // Removed is_verified requirement to check all active agents

      if (error) throw error;

      // Find the agent with matching X username (check both x_username and userName fields)
      const matchingAgent = data?.find(agent => {
        const socialLinks = agent.social_links as { x_username?: string; userName?: string } | null;
        const storedUsername = (socialLinks?.x_username || socialLinks?.userName || '').toLowerCase();
        return storedUsername === username?.toLowerCase();
      });

      if (!matchingAgent) {
        console.error('No matching agent found for username:', username, 'in', data?.length, 'agents');
        setIsLoading(false);
        toast.error("Agent not found");
        navigate('/', { state: { scrollToAgents: true } });
        return;
      }

      // Log verification status for debugging
      console.log('Found agent:', matchingAgent.name, 'Verified:', matchingAgent.is_verified);

      // Extract design settings from social_links
      const socialLinksData = matchingAgent.social_links as any;
      setSocialLinks(socialLinksData);
      if (socialLinksData?.design_settings) {
        setDesignSettings(socialLinksData.design_settings);
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

        console.log('X Intelligence response:', xResponseData);

        if (!xError && xResponseData?.success && xResponseData?.report) {
          xResponse = {
            ...xResponseData.report,
            tweets: xResponseData.tweets || []
          };
          console.log('Setting xData with profile image:', xResponse.profileImageUrl);
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
        integrations: Array.isArray((matchingAgent as any).integrations) ? (matchingAgent as any).integrations : [],
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
    const wallet = (agent as any)?.x402_wallet || (agent?.social_links as any)?.x402_wallet;
    if (wallet) {
      navigator.clipboard.writeText(wallet);
      setUsernameCopied(true);
      setTimeout(() => setUsernameCopied(false), 2000);
      toast.success("Wallet address copied!");
    }
  };

  const handleShareLink = () => {
    const url = `https://socialinternetmoney.com/${username}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    toast.success("Link copied to clipboard!");
  };

  const handleAgentClick = (offering: any) => {
    const isFree = !offering.price_per_conversation || offering.price_per_conversation === 0;
    const hasRequiredInfo = offering.required_info && Array.isArray(offering.required_info) && offering.required_info.length > 0;
    
    const chatAgent: AgentType = {
      id: offering.id,
      name: offering.title,
      description: offering.description || '',
      type: 'General Tutor',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avatar: offering.agent_avatar_url || getAvatarUrl(),
      prompt: offering.agent_system_prompt || '',
      welcome_message: `Hi! I'm ${offering.title}. How can I help you today?`,
      title: offering.title,
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
    } as any;
    
    if (isFree) {
      // Free agent
      if (hasRequiredInfo) {
        // Collect info first, then open chat
        setPendingAgent({ ...offering, chatAgent });
        setShowInfoModal(true);
      } else {
        // Open chat directly
        setSelectedAgent(chatAgent);
        setCollectedInfo({});
        setShowChatModal(true);
      }
    } else {
      // Paid agent - show purchase modal
      setPendingAgent({ ...offering, chatAgent });
      setShowPurchaseModal(true);
    }
  };

  const handleInfoSubmit = (info: Record<string, string>) => {
    if (!pendingAgent) return;
    
    setCollectedInfo(info);
    setShowInfoModal(false);
    setSelectedAgent(pendingAgent.chatAgent);
    setShowChatModal(true);
    setPendingAgent(null);
  };

  const handlePurchaseSuccess = () => {
    if (!pendingAgent) return;
    
    const hasRequiredInfo = pendingAgent.required_info && Array.isArray(pendingAgent.required_info) && pendingAgent.required_info.length > 0;
    
    setShowPurchaseModal(false);
    
    if (hasRequiredInfo) {
      // Collect info before starting chat
      setShowInfoModal(true);
    } else {
      // Start chat directly
      setSelectedAgent(pendingAgent.chatAgent);
      setCollectedInfo({});
      setShowChatModal(true);
      setPendingAgent(null);
      toast.success("Purchase successful! Starting your chat...");
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

  const getAvatarUrl = () => {
    // Priority order: xData from X API > social_links > avatar_url > avatar
    const possibleUrls = [
      xData?.profileImageUrl,
      xData?.profile_image_url,
      (agent?.social_links as any)?.profile_image_url,
      (agent?.social_links as any)?.profileImageUrl,
      agent?.avatar_url,
      agent?.avatar,
    ];

    const url = possibleUrls.find(u => u && u.trim());
    console.log('Avatar URL candidates:', possibleUrls);
    console.log('Selected avatar URL:', url);
    
    return url ? getImageUrl(url) : undefined;
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

  // Apply design settings
  const primaryColor = designSettings?.primaryColor || '#81f4aa';
  const secondaryColor = designSettings?.secondaryColor || '#000000';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 font-system">
      {/* Top Navigation Bar */}
      <div className="border-b border-border/40 bg-card/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src="/sim-logo-dark.png"
                alt="SIM Logo"
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/sim-logo.png";
                }}
              />
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareLink}
                className="gap-2"
              >
                {linkCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Prominent Profile Header */}
      <div 
        className="border-b border-border/40 bg-gradient-to-r from-card/95 via-card/80 to-card/95 backdrop-blur-sm relative overflow-hidden"
      >
        {/* Header Image Background */}
        {designSettings?.headerImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${designSettings.headerImage})` }}
          />
        )}
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
            {/* Profile Image */}
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 shadow-2xl ring-4" style={{ borderColor: primaryColor, '--tw-ring-color': `${primaryColor}33` } as any}>
              <AvatarImage 
                key={xData?.profileImageUrl || 'fallback'} 
                src={getAvatarUrl()} 
                alt={agent.name}
                className="object-cover"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error('Avatar failed to load:', e.currentTarget.src);
                }}
              />
              <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                {agent.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
                {(designSettings?.storeName || "Crypto-native Online Stores") && (
                  <p className="text-sm text-muted-foreground mb-2">{designSettings?.storeName || "Crypto-native Online Stores"}</p>
                )}
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">{xData?.displayName || agent.name}</h1>
                  {agent.is_verified && (
                    <Badge variant="default" className="gap-1" style={{ backgroundColor: primaryColor, color: secondaryColor }}>
                      <Check className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                {designSettings?.storeTagline && (
                  <p className="text-muted-foreground italic mb-2">{designSettings.storeTagline}</p>
                )}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <button 
                    onClick={handleCopyUsername}
                    className="flex items-center gap-2 hover:text-foreground transition-colors font-mono text-sm"
                  >
                    <span className="truncate max-w-[200px] md:max-w-xs">
                      {(agent as any).x402_wallet || (agent.social_links as any)?.x402_wallet || 'No wallet'}
                    </span>
                    {usernameCopied ? (
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <Copy className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                  {xData?.username && (
                    <a 
                      href={`https://x.com/${xData.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <img src={xIcon} alt="X" className="h-4 w-4" />
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{formatNumber(xData?.metrics?.followers)}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                {totalEarnings > 0 && (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Total Earnings</div>
                  </div>
                )}
                {offerings.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{offerings.length}</div>
                    <div className="text-sm text-muted-foreground">Offerings</div>
                  </div>
                )}
              </div>

              {/* Bio */}
              {(xData?.bio || agent.description) && (
                <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                  {xData?.bio || agent.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Storefront */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 md:gap-8">
          {/* Left Column - Store */}
          <div className="space-y-6">
            {((agent as any).x402_wallet || (agent.social_links as any)?.x402_wallet) && (
              <XAgentStorefront
                agentId={agent.id}
                agentName={agent.name}
                walletAddress={(agent as any).x402_wallet || (agent.social_links as any)?.x402_wallet}
              />
            )}
          </div>

          {/* Right Column - AI Agents */}
          <div className="lg:sticky lg:top-20 h-fit">
            <AgentOfferingsDisplay 
              offerings={offerings}
              avatarUrl={getAvatarUrl()}
              agentName={username}
              onAgentClick={handleAgentClick}
            />
          </div>
        </div>
      </div>

      {/* Info Collection Modal */}
      {pendingAgent && (
        <AgentInfoCollectionModal
          isOpen={showInfoModal}
          onClose={() => {
            setShowInfoModal(false);
            setPendingAgent(null);
          }}
          agentName={pendingAgent.title}
          requiredInfo={pendingAgent.required_info || []}
          onSubmit={handleInfoSubmit}
        />
      )}

      {/* Chat Modal */}
      {selectedAgent && (
        <AgentChatModal
          isOpen={showChatModal}
          onClose={() => {
            setShowChatModal(false);
            setSelectedAgent(null);
            setCollectedInfo({});
          }}
          agent={selectedAgent}
          avatarUrl={selectedAgent.avatar}
          collectedInfo={collectedInfo}
        />
      )}

      {/* Purchase Modal */}
      {pendingAgent && agent && (
        <XOfferingPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setPendingAgent(null);
          }}
          offering={pendingAgent}
          agentId={agent.id}
          agentName={agent.name}
          walletAddress={(agent as any).x402_wallet || (agent.social_links as any)?.x402_wallet}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}

      {/* SIM Designer Chat - Only visible to creator */}
      {isCreator && agent && socialLinks && (
        <SimDesignerChat
          agentId={agent.id}
          editCode={editCode}
          currentDesignSettings={designSettings}
          socialLinks={socialLinks}
          onDesignUpdate={(newSettings) => {
            setDesignSettings(newSettings);
            // Also update social links with new design settings
            setSocialLinks({
              ...socialLinks,
              design_settings: newSettings
            });
          }}
        />
      )}
    </div>
  );
}
