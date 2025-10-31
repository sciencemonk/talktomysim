import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XMessageBoard } from "@/components/XMessageBoard";
import { AgentType } from "@/types/agent";
import { toast } from "sonner";
import xIcon from "@/assets/x-icon.png";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function XAgentCreatorView() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentType | null>(null);
  const [xData, setXData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [editCode, setEditCode] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [x402Price, setX402Price] = useState(5);
  const [walletAddress, setWalletAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
      
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('sim_category', 'Crypto Mail')
        .eq('is_active', true);

      if (error) throw error;

      const matchingAgent = data?.find(agent => {
        const socialLinks = agent.social_links as { x_username?: string } | null;
        return socialLinks?.x_username?.toLowerCase() === username?.toLowerCase();
      });

      if (!matchingAgent) {
        toast.error("Agent not found");
        navigate('/agents');
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
      } as any;

      setAgent(transformedAgent);
      setSystemPrompt(matchingAgent.prompt || "");
      setX402Price(matchingAgent.x402_price || 5);
      const socialLinks = matchingAgent.social_links as any;
      setWalletAddress(socialLinks?.x402_wallet || "");
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
      navigate('/agents');
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
      const { data, error } = await supabase
        .from('advisors')
        .select('edit_code')
        .eq('id', agent.id)
        .single();

      if (error) throw error;

      if (data.edit_code === editCode) {
        setIsValidated(true);
        toast.success("Access granted!");
      } else {
        toast.error("Invalid edit code");
      }
    } catch (error) {
      console.error('Error validating code:', error);
      toast.error("Failed to validate code");
    }
  };

  const handleSaveSettings = async () => {
    if (!agent || !editCode) return;

    // Validate wallet address format (basic Solana address validation)
    if (walletAddress && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
      toast.error("Invalid Solana wallet address format");
      return;
    }

    setIsSaving(true);
    try {
      // Get current social_links and update with new wallet
      const currentSocialLinks = (agent.social_links as any) || {};
      const updatedSocialLinks = {
        ...currentSocialLinks,
        x402_wallet: walletAddress
      };

      const { error } = await supabase
        .from('advisors')
        .update({
          prompt: systemPrompt,
          x402_price: x402Price,
          social_links: updatedSocialLinks,
          x402_enabled: walletAddress ? true : false,
          updated_at: new Date().toISOString()
        })
        .eq('id', agent.id)
        .eq('edit_code', editCode);

      if (error) throw error;

      toast.success("Settings saved successfully!");
      
      // Update local agent state
      setAgent({
        ...agent,
        social_links: updatedSocialLinks,
        x402_enabled: walletAddress ? true : false,
        x402_price: x402Price
      } as any);
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
          <Button onClick={() => navigate('/agents')}>Back to Agents</Button>
        </div>
      </div>
    );
  }

  if (!isValidated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Creator Access</CardTitle>
            <CardDescription>Enter your 6-digit edit code to manage this agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              />
            </div>
            <Button onClick={handleValidateCode} className="w-full">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - X Profile Info & Message Board */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
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

            {/* Message Board with Response Capability */}
            <XMessageBoard
              agentId={agent.id}
              agentName={agent.name}
              agentAvatar={xData?.profileImageUrl || agent.avatar}
              price={agent.x402_price || 5}
              walletAddress={(agent.social_links as any)?.x402_wallet}
              xUsername={xData?.username || username}
              isCreatorView={true}
              editCode={editCode}
            />
          </div>

          {/* Right Column - AI Settings */}
          <div className="lg:col-span-1">
            <Card className="border-border bg-card/80 backdrop-blur-sm sticky top-24 shadow-lg">
              <CardHeader className="p-5">
                <CardTitle className="text-lg font-bold">AI Settings</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Configure your AI chatbot behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="system-prompt">System Prompt</Label>
                  <Textarea
                    id="system-prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Define how your AI should respond..."
                    rows={10}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    This prompt guides how your AI chatbot responds to users
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Post Price (USDC)</Label>
                  <Input
                    id="price"
                    type="text"
                    inputMode="decimal"
                    value={x402Price}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow numbers and decimals
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setX402Price(value === '' ? 0 : parseFloat(value) || 0);
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    How much users pay to post on your message board
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wallet">Solana Wallet Address</Label>
                  <Input
                    id="wallet"
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter your Solana wallet address"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Solana wallet address to receive USDC payments
                  </p>
                </div>

                <Button
                  onClick={handleSaveSettings} 
                  disabled={isSaving}
                  className="w-full"
                  style={{ backgroundColor: '#81f4aa', color: '#000' }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
