import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, ExternalLink, TrendingUp, TrendingDown, Activity, Users, DollarSign, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PublicChatInterface from "@/components/PublicChatInterface";
import { AgentType } from "@/types/agent";
import { toast } from "sonner";
import { usePumpFunTokenData } from "@/hooks/usePumpFunTokenData";
import pumpfunLogo from "@/assets/pumpfun-logo.png";

export default function TokenAgentPage() {
  const { contractAddress } = useParams<{ contractAddress: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contractCopied, setContractCopied] = useState(false);
  const [showChat, setShowChat] = useState(true);

  // Fetch real-time token data
  const { data: tokenData, isLoading: isLoadingToken, error: tokenError } = usePumpFunTokenData(contractAddress, true);

  useEffect(() => {
    if (contractAddress) {
      fetchAgent();
    }
  }, [contractAddress]);

  const fetchAgent = async () => {
    try {
      setIsLoading(true);
      
      // Find agent by contract address in social_links
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('sim_category', 'PumpFun Agent')
        .eq('is_active', true);

      if (error) throw error;

      // Find the agent with matching contract address
      const matchingAgent = data?.find(agent => {
        const socialLinks = agent.social_links as { contract_address?: string } | null;
        return socialLinks?.contract_address === contractAddress;
      });

      if (!matchingAgent) {
        toast.error("Agent not found");
        navigate('/', { state: { scrollToAgents: true } });
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
        sim_category: matchingAgent.sim_category || 'Chat',
        is_verified: matchingAgent.is_verified || false,
      } as any;

      setAgent(transformedAgent);
    } catch (error) {
      console.error('Error fetching agent:', error);
      toast.error("Failed to load agent");
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyContract = () => {
    if (contractAddress) {
      navigator.clipboard.writeText(contractAddress);
      setContractCopied(true);
      setTimeout(() => setContractCopied(false), 2000);
      toast.success("Contract address copied!");
    }
  };

  const formatMarketCap = (value: number | undefined) => {
    if (!value) return 'N/A';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
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
          <Button onClick={() => navigate('/', { state: { scrollToAgents: true } })}>Back to Agents</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/', { state: { scrollToAgents: true } })}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <img src={pumpfunLogo} alt="PumpFun" className="h-5 w-5" />
              <span className="text-sm font-medium text-muted-foreground">PumpFun Agent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Token Info & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token Header */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    <AvatarImage src={agent.avatar} alt={agent.name} />
                    <AvatarFallback>{tokenData?.symbol?.[0] || agent.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{tokenData?.name || agent.name}</CardTitle>
                    <CardDescription className="text-base">
                      {tokenData?.symbol || 'TOKEN'}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                        PumpFun Token
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {agent.description}
                </p>
                {/* Contract Address */}
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-muted-foreground mb-1">Contract Address</p>
                      <p className="text-xs font-mono truncate">{contractAddress}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyContract}
                      className="shrink-0"
                    >
                      {contractCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Market Cap
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">
                    {isLoadingToken ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      formatMarketCap(tokenData?.marketCap)
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-sm font-medium">Live</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">Solana</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for Insights */}
            <Card className="border-border bg-card">
              <Tabs defaultValue="overview" className="w-full">
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="links">Links</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">About {tokenData?.name || agent.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {agent.description || `${tokenData?.name} is a token on the Solana blockchain, launched via PumpFun. This AI agent provides real-time information and insights about the token.`}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Token Metrics</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-2 border-b border-border">
                          <span className="text-sm text-muted-foreground">Market Cap</span>
                          <span className="text-sm font-medium">{formatMarketCap(tokenData?.marketCap)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Symbol</span>
                          <span className="text-sm font-medium">{tokenData?.symbol || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-4">
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">Real-time Analytics</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Analytics data is refreshed every minute. Chat with the AI agent to get deeper insights and analysis.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="links" className="space-y-4">
                    <div className="space-y-2">
                      {/* Creator's Social Links from PumpFun */}
                      {tokenData?.twitter && (
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => window.open(tokenData.twitter, '_blank')}
                        >
                          <span className="flex items-center gap-2">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            X (Twitter)
                          </span>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {tokenData?.website && (
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => window.open(tokenData.website, '_blank')}
                        >
                          <span className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Website
                          </span>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {tokenData?.telegram && (
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => window.open(tokenData.telegram, '_blank')}
                        >
                          <span className="flex items-center gap-2">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                            </svg>
                            Telegram
                          </span>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Separator if there are social links */}
                      {(tokenData?.twitter || tokenData?.website || tokenData?.telegram) && (
                        <div className="border-t border-border my-2" />
                      )}

                      {/* PumpFun CA Page */}
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => window.open(`https://pump.fun/coin/${contractAddress}`, '_blank')}
                      >
                        <span className="flex items-center gap-2">
                          <img src={pumpfunLogo} alt="PumpFun" className="h-4 w-4" />
                          View on PumpFun
                        </span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      
                      {/* Blockchain Explorers */}
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => window.open(`https://solscan.io/token/${contractAddress}`, '_blank')}
                      >
                        <span>View on Solscan</span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => window.open(`https://dexscreener.com/solana/${contractAddress}`, '_blank')}
                      >
                        <span>View on DexScreener</span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="lg:col-span-1">
            <Card className="border-border bg-card sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Chat with {tokenData?.symbol || agent.name}</CardTitle>
                <CardDescription className="text-sm">
                  Ask questions about the token, get real-time data, and insights
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
