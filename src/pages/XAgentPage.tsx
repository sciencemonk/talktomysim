import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, ExternalLink, Users, MessageCircle, TrendingUp, Activity, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import PublicChatInterface from "@/components/PublicChatInterface";
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

  useEffect(() => {
    if (username) {
      fetchAgent();
    }
  }, [username]);

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
        navigate('/');
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

      // Fetch real-time X data
      try {
        const { data: xResponse, error: xError } = await supabase.functions.invoke("x-intelligence", {
          body: { username: username?.replace('@', '') },
        });

        if (!xError && xResponse?.success && xResponse?.report) {
          setXData(xResponse.report);
        }
      } catch (error) {
        console.error('Error fetching X data:', error);
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
      toast.error("Failed to load agent");
      navigate('/');
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
          <Button onClick={() => navigate('/')}>Go Home</Button>
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
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <img src={xIcon} alt="X" className="h-5 w-5" />
              <span className="text-sm font-medium text-muted-foreground">X Agent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - X Profile Info & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    <AvatarImage src={agent.avatar} alt={agent.name} />
                    <AvatarFallback>{agent.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-2xl">{xData?.displayName || agent.name}</CardTitle>
                      {xData?.verified && (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-base mb-3">
                      @{xData?.username || username}
                    </CardDescription>
                    {agent.x402_enabled && (
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-neonGreen/10 text-neonGreen rounded-md text-sm font-medium border border-neonGreen/20">
                          Monetized with x402 • ${agent.x402_price || 5} per message
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {xData?.bio && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {xData.bio}
                  </p>
                )}
                {xData?.location && (
                  <p className="text-xs text-muted-foreground mb-4">📍 {xData.location}</p>
                )}
                {/* Username Display */}
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-muted-foreground mb-1">X Username</p>
                      <p className="text-sm font-medium">@{xData?.username || username}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyUsername}
                      className="shrink-0"
                    >
                      {usernameCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Followers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">
                    {formatNumber(xData?.metrics?.followers)}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Following
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">
                    {formatNumber(xData?.metrics?.following)}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    Total Posts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">
                    {formatNumber(xData?.metrics?.totalTweets)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for Insights */}
            <Card className="border-border bg-card">
              <Tabs defaultValue="overview" className="w-full">
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                    <TabsTrigger value="links">Links</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">About @{xData?.username || username}</h3>
                      <p className="text-sm text-muted-foreground">
                        {xData?.bio || agent.description || `X agent powered by x402. Chat with @${username} and ask questions about their X account!`}
                      </p>
                    </div>
                    {xData?.engagement && (
                      <div>
                        <h3 className="font-semibold mb-2">Engagement Metrics</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">Avg Likes per Post</span>
                            <span className="text-sm font-medium">{xData.engagement.avgLikesPerTweet}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">Avg Retweets per Post</span>
                            <span className="text-sm font-medium">{xData.engagement.avgRetweetsPerTweet}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-muted-foreground">Avg Replies per Post</span>
                            <span className="text-sm font-medium">{xData.engagement.avgRepliesPerTweet}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="insights" className="space-y-4">
                    {xData?.insights && xData.insights.length > 0 ? (
                      <div className="space-y-3">
                        {xData.insights.map((insight: string, index: number) => (
                          <div key={index} className="p-3 bg-muted/30 rounded-lg border border-border">
                            <p className="text-sm">{insight}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          Chat with the AI agent to get deeper insights and analysis about this X account.
                        </p>
                      </div>
                    )}
                    {xData?.activity && (
                      <div className="pt-4 border-t border-border">
                        <h3 className="font-semibold mb-2">Activity</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-muted-foreground">Posting Frequency</span>
                            <span className="text-sm font-medium">{xData.activity.postingFrequency}</span>
                          </div>
                          {xData.activity.topHashtags?.length > 0 && (
                            <div className="pt-2">
                              <span className="text-sm text-muted-foreground mb-2 block">Top Hashtags</span>
                              <div className="flex flex-wrap gap-2">
                                {xData.activity.topHashtags.map((tag: string, i: number) => (
                                  <Badge key={i} variant="secondary">{tag}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="links" className="space-y-4">
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => window.open(`https://x.com/${username}`, '_blank')}
                      >
                        <span className="flex items-center gap-2">
                          <img src={xIcon} alt="X" className="h-4 w-4" />
                          View on X
                        </span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      
                      {agent.x402_enabled && (
                        <div className="p-4 bg-neonGreen/5 border border-neonGreen/20 rounded-lg">
                          <h3 className="font-semibold mb-2 text-neonGreen">💰 Monetized Account</h3>
                          <p className="text-sm text-muted-foreground">
                            This account is monetized with x402. Pay ${agent.x402_price || 5} to send a message and get a guaranteed response.
                          </p>
                        </div>
                      )}
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
                <CardTitle className="text-lg">Chat with @{xData?.username || username}</CardTitle>
                <CardDescription className="text-sm">
                  Ask questions about this X account and get AI-powered insights
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
