import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XAgentStoreManager } from "@/components/XAgentStoreManager";
import { XAgentPurchases } from "@/components/XAgentPurchases";
import { AgentType } from "@/types/agent";
import { toast } from "sonner";
import xIcon from "@/assets/x-icon.png";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function XAgentCreatorView() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code');
  
  const [agent, setAgent] = useState<AgentType | null>(null);
  const [xData, setXData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [editCode, setEditCode] = useState(codeFromUrl || "");
  const [isValidated, setIsValidated] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // SECURITY: Redirect if no code parameter provided
  useEffect(() => {
    if (!codeFromUrl) {
      toast.error("Access denied. Edit code required.");
      navigate(`/x/${username}`, { replace: true });
    }
  }, [codeFromUrl, navigate, username]);

  useEffect(() => {
    if (username && codeFromUrl) {
      fetchAgent();
    }
  }, [username, codeFromUrl]);

  // Auto-validate if code is in URL
  useEffect(() => {
    if (codeFromUrl && agent && !isValidated) {
      handleValidateCode();
    }
  }, [codeFromUrl, agent]);

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
      
      const { data, error } = await supabase
        .from('advisors')
        .select('id, name, description, prompt, avatar_url, welcome_message, title, created_at, updated_at, is_active, is_verified, x402_enabled, x402_price, x402_wallet, crypto_wallet, sim_category, social_links, edit_code')
        .eq('sim_category', 'Crypto Mail');

      if (error) throw error;

      const matchingAgent = data?.find(agent => {
        const socialLinks = agent.social_links as { x_username?: string } | null;
        return socialLinks?.x_username?.toLowerCase() === username?.toLowerCase();
      });

      if (!matchingAgent) {
        toast.error("Agent not found");
        navigate('/', { state: { scrollToAgents: true } });
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
      console.log('Loaded wallet address:', loadedWallet); // Debug log
      setWalletAddress(loadedWallet);
      
      fetchTotalEarnings(matchingAgent.id);

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
      navigate('/', { state: { scrollToAgents: true } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateCode = async () => {
    if (!agent || !editCode) {
      toast.error("Please enter your edit code");
      return;
    }

    if (!/^\d{6}$/.test(editCode)) {
      toast.error("Edit code must be 6 digits");
      return;
    }

    try {
      // SECURITY: Use the rate-limited function to validate
      const { data, error } = await supabase.rpc('check_edit_code_rate_limit', {
        p_agent_id: agent.id
      });

      if (error) throw error;

      if (!data) {
        toast.error("Too many failed attempts. Please try again later.");
        return;
      }

      // Validate the code
      const { data: agentData, error: fetchError } = await supabase
        .from('advisors')
        .select('edit_code')
        .eq('id', agent.id)
        .single();

      if (fetchError) throw fetchError;

      if (agentData.edit_code === editCode) {
        setIsValidated(true);
        toast.success("Access granted!");
      } else {
        // Record failed attempt
        await supabase.rpc('record_failed_edit_code_attempt', {
          p_agent_id: agent.id
        });
        toast.error("Invalid edit code");
      }
    } catch (error) {
      console.error('Error validating code:', error);
      toast.error("Failed to validate code");
    }
  };

  const handleSaveSettings = async () => {
    if (!agent || !editCode) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('advisors')
        .update({
          prompt: systemPrompt,
          updated_at: new Date().toISOString()
        })
        .eq('id', agent.id)
        .eq('edit_code', editCode);

      if (error) throw error;

      toast.success("AI settings saved successfully!");
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
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

  // SECURITY: Require validated code before showing any content
  if (!isValidated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Creator Access Required</CardTitle>
            <CardDescription>
              Enter your 6-digit edit code to manage @{username}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-destructive font-medium">
                🔒 Unauthorized access is not allowed
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This page is for the agent creator only. You must have the edit code that was provided when this agent was created.
              </p>
            </div>
            <div>
              <Label htmlFor="edit-code">Edit Code</Label>
              <Input
                id="edit-code"
                type="text"
                maxLength={6}
                value={editCode}
                onChange={(e) => setEditCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
            </div>
            <Button onClick={handleValidateCode} className="w-full" style={{ backgroundColor: '#81f4aa', color: '#000' }}>
              Validate Code
            </Button>
            <Button variant="outline" onClick={() => navigate(`/x/${username}`)} className="w-full">
              Back to Public View
            </Button>
          </CardContent>
        </Card>
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
              onClick={() => navigate(`/x/${username}`)}
              className="gap-2 h-9 px-2 md:px-3"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Public View</span>
            </Button>
            <div className="flex items-center gap-2">
              <img src={xIcon} alt="X" className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-xs md:text-sm font-medium text-muted-foreground">Creator Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-7xl">
        <div className="space-y-4 md:space-y-6">
          {/* Profile Header */}
          <Card className="border-border bg-card/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="p-5 md:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 shrink-0 ring-2 ring-[#81f4aa]/20" style={{ borderColor: '#81f4aa' }}>
                    <AvatarImage 
                      src={getImageUrl(xData?.profileImageUrl || agent.avatar)} 
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
                    {xData?.username || username}
                  </CardDescription>
                  <div className="flex items-center gap-2 flex-wrap">
                    {!agent.is_verified && (
                      <Badge variant="outline" className="text-xs px-2.5 py-1 font-medium text-yellow-600 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                        Pending Verification
                      </Badge>
                    )}
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
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="store" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="store">Store</TabsTrigger>
              <TabsTrigger value="purchases">Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="store" className="mt-6">
              <XAgentStoreManager 
                agentId={agent.id}
                walletAddress={walletAddress}
                onWalletUpdate={setWalletAddress}
                editCode={editCode}
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
