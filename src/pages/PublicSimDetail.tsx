import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Globe, Wallet, ExternalLink, Copy, Check, MessageCircle, X, Share2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import PublicChatInterface from "@/components/PublicChatInterface";
import ContactFormPage from "@/components/ContactFormPage";
import DailyBriefsList from "@/components/DailyBriefsList";
import AuthModal from "@/components/AuthModal";
import { AgentType } from "@/types/agent";
import { useToast } from "@/hooks/use-toast";
import landingBackground from "@/assets/landing-background.jpg";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { fetchSolanaBalance, formatSolBalance } from "@/services/solanaBalanceService";
import { validateX402Session } from "@/utils/x402Session";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Lazy load X402PaymentModal to avoid blocking app initialization with ethers.js
const X402PaymentModal = lazy(() => 
  import("@/components/X402PaymentModal").then(module => ({ default: module.X402PaymentModal }))
);

const PublicSimDetail = () => {
  const { customUrl } = useParams<{ customUrl: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sim, setSim] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Check if this is an embedded view or chat mode and show chat immediately
  const searchParams = new URLSearchParams(window.location.search);
  const embedMode = searchParams.get('embed');
  const isEmbedded = embedMode === 'true' || embedMode === 'chat-only';
  const isChatOnly = embedMode === 'chat-only';
  const shouldShowChat = searchParams.get('chat') === 'true' || isEmbedded;
  const [showChat, setShowChat] = useState(shouldShowChat);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [walletCopied, setWalletCopied] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [embedCodeCopied, setEmbedCodeCopied] = useState(false);
  const embedCodeRef = useRef<HTMLDivElement>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);
  const [showCreatorCodeModal, setShowCreatorCodeModal] = useState(false);
  const [creatorCodeInput, setCreatorCodeInput] = useState('');
  const [creatorCodeError, setCreatorCodeError] = useState('');
  const [hasAccess, setHasAccess] = useState(false);

  // Calculate SOL equivalent (example rate: 1 $SimAI = 0.0001 SOL)
  const SIMAI_TO_SOL_RATE = 0.0001;

  const getSimDescription = () => {
    // For Crypto Mail sims, use the user-written description
    if (sim?.sim_category === 'Crypto Mail' && sim?.description) {
      return sim.description;
    }
    // For other sims, use auto_description (never the system prompt in 'description' field)
    if ((sim as any)?.auto_description) {
      return (sim as any).auto_description;
    }
    // Fallback to a friendly default
    if (sim?.title) {
      return `Chat with ${sim.name}, an AI expert in ${sim.title}.`;
    }
    return `Chat with ${sim.name}, your AI assistant.`;
  };

  const getSimPrice = () => {
    const price = (sim as any)?.price || 0;
    if (!price || price === 0) {
      return { display: 'Free', isFree: true };
    }
    const solEquivalent = (price * SIMAI_TO_SOL_RATE).toFixed(4);
    return { 
      display: `${price.toLocaleString()} $SimAI (~${solEquivalent} SOL)`,
      isFree: false 
    };
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleShareLink = () => {
    if (!sim) return;
    const simSlug = (sim as any).custom_url || generateSlug(sim.name);
    const shareUrl = `${window.location.origin}/${simSlug}`;
    navigator.clipboard.writeText(shareUrl);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2000);
    toast({
      title: "Link copied!",
      description: "Share this link with others to let them discover this Sim"
    });
  };

  const getEmbedCode = () => {
    if (!sim) return '';
    const simSlug = (sim as any).custom_url || generateSlug(sim.name);
    const simUrl = `${window.location.origin}/${simSlug}?embed=chat-only`;
    const avatarUrl = getAvatarUrl(sim.avatar);
    
    return `<!-- ${sim.name} Chat Widget -->
<div id="sim-chat-widget"></div>
<script>
  (function() {
    'use strict';
    
    // ULTRA AGGRESSIVE DUPLICATE PREVENTION
    if (window.__SIM_CHAT_LOADED__ === true) {
      console.log('[SimChat] Already loaded, skipping initialization');
      return;
    }
    
    // Cleanup any existing widgets
    function cleanupExistingWidget() {
      const existingBubble = document.getElementById('sim-chat-bubble');
      const existingWindow = document.getElementById('sim-chat-window');
      const existingStyles = document.getElementById('sim-chat-widget-styles');
      
      if (existingBubble) existingBubble.remove();
      if (existingWindow) existingWindow.remove();
      if (existingStyles) existingStyles.remove();
    }
    
    cleanupExistingWidget();
    window.__SIM_CHAT_LOADED__ = true;

    const simConfig = {
      name: "${sim.name}",
      avatar: "${avatarUrl}",
      simUrl: "${simUrl}",
      welcomeMessage: "${(sim.welcome_message || `Hi! I'm ${sim.name}. How can I help you today?`).replace(/"/g, '\\"')}"
    };
    
    // Create styles
    const style = document.createElement('style');
    style.id = 'sim-chat-widget-styles';
    style.textContent = \\\`
      #sim-chat-bubble {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: transform 0.3s ease;
      }
      #sim-chat-bubble:hover { transform: scale(1.1); }
      #sim-chat-bubble img {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        object-fit: cover;
      }
      #sim-chat-window {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 380px;
        height: 600px;
        max-width: calc(100vw - 40px);
        max-height: calc(100vh - 120px);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        background: white;
        z-index: 9998;
        display: none;
        flex-direction: column;
        overflow: hidden;
      }
      #sim-chat-window.active { display: flex; }
      #sim-chat-header {
        padding: 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      #sim-chat-close {
        margin-left: auto;
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #sim-chat-iframe {
        flex: 1;
        border: none;
        width: 100%;
      }
    \\\`;
    document.head.appendChild(style);
    
    // Create bubble
    const bubble = document.createElement('div');
    bubble.id = 'sim-chat-bubble';
    bubble.innerHTML = '<img src="' + simConfig.avatar + '" alt="' + simConfig.name + '" draggable="false">';
    document.body.appendChild(bubble);
    
    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'sim-chat-window';
    chatWindow.innerHTML = \\\`
      <div id="sim-chat-header">
        <strong>\\\${simConfig.name}</strong>
        <button id="sim-chat-close">×</button>
      </div>
      <iframe id="sim-chat-iframe" src="\\\${simConfig.simUrl}"></iframe>
    \\\`;
    document.body.appendChild(chatWindow);
    
    // Toggle chat window on bubble click
    bubble.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      chatWindow.classList.toggle('active');
    });
    
    // Close button
    const closeBtn = document.getElementById('sim-chat-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        chatWindow.classList.remove('active');
      });
    }
    
    console.log('[SimChat] Widget initialized successfully');
  })();
</script>`;
  };

  const handleCopyEmbedCode = () => {
    const code = getEmbedCode();
    navigator.clipboard.writeText(code);
    setEmbedCodeCopied(true);
    setTimeout(() => setEmbedCodeCopied(false), 2000);
    toast({
      title: "Embed code copied!",
      description: "Paste this code before the </body> tag in your HTML"
    });
  };

  // Scroll to embed code when it's shown
  useEffect(() => {
    if (showEmbedCode && embedCodeRef.current) {
      setTimeout(() => {
        embedCodeRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest'
        });
      }, 100);
    }
  }, [showEmbedCode]);

  useEffect(() => {
    checkUser();
    if (customUrl) {
      fetchSim();
    }
  }, [customUrl]);

  // Check for x402 payment when showing Crypto Mail form
  useEffect(() => {
    if (sim?.sim_category === 'Crypto Mail' && sim?.x402_enabled && sim?.x402_price && sim?.x402_wallet) {
      const validSession = validateX402Session(sim.x402_wallet);
      if (validSession) {
        setPaymentSessionId(validSession);
      } else if (!showPaymentModal) {
        setShowPaymentModal(true);
      }
    }
  }, [sim]);

  // Check for x402 payment when chat is shown
  useEffect(() => {
    if (showChat && sim && sim.x402_enabled && sim.x402_price && sim.x402_wallet) {
      const validSession = validateX402Session(sim.x402_wallet);
      if (!validSession) {
        console.log('x402 payment required, showing payment modal');
        setShowPaymentModal(true);
        setShowChat(false); // Hide chat until payment
      } else {
        console.log('Valid x402 session found:', validSession);
        setPaymentSessionId(validSession);
      }
    }
  }, [showChat, sim]);

  // Fetch SOL balance when sim has a crypto wallet
  useEffect(() => {
    const loadBalance = async () => {
      const wallet = (sim as any)?.crypto_wallet;
      if (wallet && wallet.trim()) {
        setIsLoadingBalance(true);
        const balance = await fetchSolanaBalance(wallet);
        setSolBalance(balance);
        setIsLoadingBalance(false);
      } else {
        setSolBalance(null);
      }
    };

    if (sim) {
      loadBalance();
    }
  }, [sim]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const handleCreateSimClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      navigate('/directory');
    } else {
      setShowAuthModal(true);
    }
  };

  const fetchSim = async () => {
    try {
      setIsLoading(true);
      
      // Try to fetch by custom_url first, then by id if not found
      let query = supabase
        .from('advisors')
        .select('*')
        .eq('is_active', true);
      
      // Try custom_url first
      let { data, error } = await query
        .eq('custom_url', customUrl)
        .maybeSingle();

      // If not found by custom_url, try by id
      if (!data && !error) {
        const { data: dataById, error: errorById } = await supabase
          .from('advisors')
          .select('*')
          .eq('id', customUrl)
          .eq('is_active', true)
          .maybeSingle();
        
        data = dataById;
        error = errorById;
      }

      // If still not found, try matching against generated slug from name
      if (!data && !error) {
        const { data: allSims, error: allError } = await supabase
          .from('advisors')
          .select('*')
          .eq('is_active', true);
        
        if (!allError && allSims) {
          data = allSims.find(sim => generateSlug(sim.name) === customUrl) || null;
        }
      }

      if (error) throw error;

      if (!data) {
        navigate('/404');
        return;
      }

      // Transform to AgentType with social links and price
      const transformedSim: AgentType = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        type: 'General Tutor',
        status: 'active',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        avatar: data.avatar_url,
        prompt: data.prompt,
        welcome_message: data.welcome_message,
        title: data.title,
        sim_type: (data.sim_type || 'living') as 'historical' | 'living',
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
        social_links: data.social_links as any,
        twitter_url: data.twitter_url,
        website_url: data.website_url,
        crypto_wallet: data.crypto_wallet,
        background_image_url: data.background_image_url,
        price: data.price || 0,
        auto_description: data.auto_description,
        x402_enabled: data.x402_enabled || false,
        x402_price: data.x402_price || 0,
        x402_wallet: data.x402_wallet,
        sim_category: data.sim_category || 'Chat',
        is_verified: data.is_verified || false,
        edit_code: data.edit_code
      } as any;

      console.log('Fetched sim with x402 settings:', {
        id: transformedSim.id,
        name: transformedSim.name,
        x402_enabled: transformedSim.x402_enabled,
        x402_price: transformedSim.x402_price,
        x402_wallet: transformedSim.x402_wallet
      });

      setSim(transformedSim);
      
      // Check if this is an Autonomous Agent and show creator code modal
      if (transformedSim.sim_category === 'Autonomous Agent') {
        setShowCreatorCodeModal(true);
      }
    } catch (error) {
      console.error('Error fetching sim:', error);
      navigate('/404');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatorCodeSubmit = () => {
    if (!sim) return;
    
    const editCode = (sim as any).edit_code;
    if (creatorCodeInput.trim() === editCode) {
      setHasAccess(true);
      setShowCreatorCodeModal(false);
      setCreatorCodeError('');
      toast({
        title: "Access granted!",
        description: "You can now interact with this Autonomous Agent"
      });
    } else {
      setCreatorCodeError('Invalid creator code. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen relative bg-gradient-to-br from-primary/20 via-background to-secondary/20"
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0" />
        <Loader2 className="h-8 w-8 animate-spin relative z-10" />
      </div>
    );
  }

  if (!sim) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen relative bg-gradient-to-br from-primary/20 via-background to-secondary/20"
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0" />
        <div className="text-center space-y-4 relative z-10 p-8 backdrop-blur-md bg-card/50 border border-border rounded-3xl max-w-md">
          <h1 className="text-2xl font-bold">Sim Not Found</h1>
          <p className="text-muted-foreground">This sim doesn't exist or has been deactivated.</p>
          <Button 
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // If sim_category is "Crypto Mail", validate x402 payment before showing contact form
  if (sim.sim_category === 'Crypto Mail') {
    // Check if x402 payment is required and no valid session
    if (sim.x402_enabled && sim.x402_price && sim.x402_wallet && !paymentSessionId) {
      return (
        <div className="h-screen flex flex-col">
          <Suspense fallback={null}>
            <X402PaymentModal
              isOpen={true}
              onClose={() => navigate('/')}
              onPaymentSuccess={(sessionId) => {
                console.log('Payment successful, session ID:', sessionId);
                setPaymentSessionId(sessionId);
                setShowPaymentModal(false);
              }}
              simName={sim.name}
              price={sim.x402_price || 0.01}
              walletAddress={sim.x402_wallet || ''}
            />
          </Suspense>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mb-6">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Payment Required</h3>
              <p className="text-base text-muted-foreground max-w-md mx-auto">
                This contact form requires a payment of {sim.x402_price} USDC to submit a message.
              </p>
            </div>
          </div>
        </div>
      );
    }
    // Valid session exists, show contact form
    return <ContactFormPage agent={sim} />;
  }

  // If this is an Autonomous Agent and user doesn't have access, show access required screen
  if (sim.sim_category === 'Autonomous Agent' && !hasAccess) {
    return (
      <>
        <div 
          className="flex items-center justify-center min-h-screen relative bg-gradient-to-br from-primary/20 via-background to-secondary/20"
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0" />
          <div className="text-center space-y-4 relative z-10 p-8 backdrop-blur-md bg-card/50 border border-border rounded-3xl max-w-md">
            <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Creator Code Required</h1>
            <p className="text-muted-foreground">
              This Autonomous Agent requires a creator code to access.
            </p>
            <Button 
              onClick={() => setShowCreatorCodeModal(true)}
              className="mt-4"
            >
              Enter Creator Code
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="mt-2 w-full"
            >
              Go Home
            </Button>
          </div>
        </div>

        {/* Creator Code Modal */}
        <Dialog open={showCreatorCodeModal} onOpenChange={setShowCreatorCodeModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enter Creator Code</DialogTitle>
              <DialogDescription>
                Enter the creator code to access this Autonomous Agent.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="creator-code">Creator Code</Label>
                <Input
                  id="creator-code"
                  type="text"
                  value={creatorCodeInput}
                  onChange={(e) => {
                    setCreatorCodeInput(e.target.value);
                    setCreatorCodeError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreatorCodeSubmit();
                    }
                  }}
                  placeholder="Enter code..."
                  className="h-11 bg-black text-white"
                />
                {creatorCodeError && (
                  <p className="text-sm text-destructive">{creatorCodeError}</p>
                )}
              </div>
              <Button
                onClick={handleCreatorCodeSubmit}
                className="w-full"
                disabled={!creatorCodeInput.trim()}
                style={{ backgroundColor: '#82f2aa', color: 'black' }}
              >
                Launch Sim
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // If this is an Autonomous Agent with valid access, show daily briefs with tabs
  if (sim.sim_category === 'Autonomous Agent' && hasAccess) {
    const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      
      try {
        const { error } = await supabase
          .from('advisors')
          .update({
            name: formData.get('name') as string,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            marketplace_category: formData.get('category') as string,
          })
          .eq('id', sim.id);

        if (error) throw error;

        toast({
          title: "Settings saved",
          description: "Your changes have been saved successfully"
        });

        // Refresh sim data
        fetchSim();
      } catch (error) {
        console.error('Error saving settings:', error);
        toast({
          title: "Error",
          description: "Failed to save settings",
          variant: "destructive"
        });
      }
    };

    return (
      <div className="h-screen flex items-center justify-center relative bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0" />
        
        <div className="relative z-10 w-full max-w-4xl mx-auto p-4 h-[90vh] flex flex-col">
          <div className="backdrop-blur-md bg-card/50 border border-border rounded-3xl shadow-xl h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-border">
                  <AvatarImage src={getAvatarUrl(sim.avatar)} alt={sim.name} className="object-cover" />
                  <AvatarFallback>{sim.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{sim.name}</h2>
                  {sim.title && <p className="text-sm text-muted-foreground">{sim.title}</p>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="briefs" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-6 mt-4">
                <TabsTrigger value="briefs">Daily Briefs</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="briefs" className="flex-1 overflow-y-auto p-6 mt-0">
                <DailyBriefsList advisorId={sim.id} />
              </TabsContent>

              <TabsContent value="settings" className="flex-1 overflow-y-auto p-6 mt-0">
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <Label htmlFor="name">Sim Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={sim.name}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={sim.title || ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={sim.description || ''}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      name="category"
                      defaultValue={(sim as any).marketplace_category || 'daily brief'}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                    >
                      <option value="daily brief">Daily Brief</option>
                      <option value="crypto">Crypto & Web3</option>
                      <option value="business">Business & Finance</option>
                      <option value="education">Education & Tutoring</option>
                      <option value="lifestyle">Lifestyle & Wellness</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full">
                    Save Settings
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary/20"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0" />

      {showChat ? (
        <div className="flex-1 flex flex-col relative z-10 h-full">
          {/* Only show header if not embedded or in chat-only mode */}
          {!isEmbedded && !isChatOnly && (
            <div className="border-b border-border px-4 py-3 flex items-center justify-between backdrop-blur-md bg-card/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-border">
                  <AvatarImage src={getAvatarUrl(sim.avatar)} alt={sim.name} className="object-cover" />
                  <AvatarFallback>{sim.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{sim.name}</p>
                  {sim.title && <p className="text-xs text-muted-foreground">{sim.title}</p>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!currentUser) {
                    navigate('/');
                  } else {
                    setShowChat(false);
                  }
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
          <div className="flex-1 h-full overflow-hidden">
            <PublicChatInterface agent={sim} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <div className="max-w-xl w-full">
            {/* Main Card */}
            <div className="backdrop-blur-xl bg-card/50 border-2 border-border rounded-3xl p-8 sm:p-12 shadow-2xl">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse" />
                  <Avatar className="relative h-28 w-28 sm:h-36 sm:w-36 border-4 border-border shadow-2xl">
                    <AvatarImage src={getAvatarUrl(sim.avatar)} alt={sim.name} className="object-cover" />
                    <AvatarFallback className="text-4xl sm:text-5xl">{sim.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Name and Title */}
              <div className="text-center space-y-2 mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{sim.name}</h1>
                {sim.title && (
                  <p className="text-lg sm:text-xl text-muted-foreground">{sim.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="mb-6 p-4 bg-accent/10 rounded-2xl border border-border">
                <p className="text-sm text-center leading-relaxed">
                  {getSimDescription()}
                </p>
              </div>

              {/* SOL Wallet Info */}
              {sim.crypto_wallet && (
                <div className="mb-6 p-4 bg-accent/10 rounded-2xl border border-border">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Wallet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs font-mono text-muted-foreground truncate">
                        {sim.crypto_wallet}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground flex-shrink-0">
                      {isLoadingBalance ? (
                        <span className="animate-pulse text-xs">Loading...</span>
                      ) : (
                        formatSolBalance(solBalance)
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Start Chatting Button */}
              <Button
                size="lg"
                variant="simPrimary"
                className="w-full h-14 text-base shadow-xl hover:shadow-2xl transition-all duration-300 mb-4 group"
                onClick={() => {
                  console.log('Launch Sim clicked. Current sim x402 settings:', {
                    x402_enabled: sim?.x402_enabled,
                    x402_price: sim?.x402_price,
                    x402_wallet: sim?.x402_wallet,
                    hasAllSettings: !!(sim?.x402_enabled && sim?.x402_price && sim?.x402_wallet)
                  });
                  
                  // Check if x402 payment is required
                  if (sim?.x402_enabled && sim?.x402_price && sim?.x402_wallet) {
                    const validSession = validateX402Session(sim.x402_wallet);
                    console.log('Checking for valid session:', validSession);
                    if (!validSession) {
                      console.log('No valid session - showing payment modal');
                      setShowPaymentModal(true);
                      return;
                    } else {
                      console.log('Valid x402 session found:', validSession);
                      setPaymentSessionId(validSession);
                    }
                  } else {
                    console.log('x402 not required or not properly configured');
                  }
                  setShowChat(true);
                }}
              >
                <MessageCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                {sim?.sim_category === 'Crypto Mail' ? 'Send Crypto Mail' : 'Launch Sim'}
              </Button>

              {/* Share Button */}
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 text-base font-semibold mb-3 group"
                onClick={handleShareLink}
              >
                {shareLinkCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Share Sim
                  </>
                )}
              </Button>

              {/* Embed Button */}
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 text-base font-semibold mb-6 group"
                onClick={() => setShowEmbedCode(!showEmbedCode)}
              >
                <svg className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                {showEmbedCode ? 'Hide Embed Code' : 'Embed on Your Site'}
              </Button>

              {/* Embed Code Section */}
              {showEmbedCode && (
                <div ref={embedCodeRef} className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">Embed Code</h3>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleCopyEmbedCode}
                      className="h-8"
                    >
                      {embedCodeCopied ? (
                        <>
                          <Check className="h-3 w-3 mr-1 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-background rounded border border-border p-3 mb-3 max-h-40 overflow-y-auto">
                    <code className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
                      {getEmbedCode()}
                    </code>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Copy the code above</li>
                      <li>Paste it before the closing &lt;/body&gt; tag in your HTML</li>
                      <li>The chat widget will appear on the bottom right of your site</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Social Links & Wallet */}
              {(sim.twitter_url || sim.website_url || sim.crypto_wallet) && (
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  {sim.twitter_url && (
                    <a
                      href={sim.twitter_url.startsWith('http') ? sim.twitter_url : `https://${sim.twitter_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl bg-accent/10 hover:bg-accent/20 border border-border hover:border-primary transition-all duration-300 group"
                    >
                      <svg className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span className="text-sm font-medium group-hover:text-foreground transition-colors">Follow on X</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors ml-auto flex-shrink-0" />
                    </a>
                  )}

                  {sim.website_url && (
                    <a
                      href={sim.website_url.startsWith('http') ? sim.website_url : `https://${sim.website_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl bg-accent/10 hover:bg-accent/20 border border-border hover:border-primary transition-all duration-300 group"
                    >
                      <Globe className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                      <span className="text-sm font-medium group-hover:text-foreground transition-colors">Visit Website</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors ml-auto flex-shrink-0" />
                    </a>
                  )}

                  {sim.crypto_wallet && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(sim.crypto_wallet || '');
                        setWalletCopied(true);
                        setTimeout(() => setWalletCopied(false), 2000);
                        toast({
                          title: "Copied!",
                          description: "Wallet address copied to clipboard"
                        });
                      }}
                      className="flex flex-col gap-2 w-full px-5 py-3.5 rounded-2xl bg-accent/10 hover:bg-accent/20 border border-border hover:border-primary transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Wallet className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">SOL Wallet</span>
                        </div>
                        {walletCopied ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center justify-between w-full pl-8">
                        <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors truncate">
                          {sim.crypto_wallet}
                        </span>
                        <span className="text-sm font-semibold text-foreground ml-3 flex-shrink-0">
                          {isLoadingBalance ? (
                            <span className="animate-pulse text-xs">Loading...</span>
                          ) : (
                            formatSolBalance(solBalance)
                          )}
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Powered by Sim branding */}
              <div className="flex items-center justify-center gap-2 pt-6 mt-6 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Powered by</span>
                <a 
                  href="https://simproject.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/sim-logo.png" 
                    alt="Sim" 
                    className="h-5 w-5 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />

      {/* x402 Payment Modal */}
      {sim && sim.x402_enabled && (
        <Suspense fallback={null}>
          <X402PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onPaymentSuccess={(sessionId) => {
              console.log('Payment successful, session ID:', sessionId);
              setPaymentSessionId(sessionId);
              setShowPaymentModal(false);
              setShowChat(true);
            }}
            simName={sim.name}
            price={sim.x402_price || 0.01}
            walletAddress={sim.x402_wallet || ''}
          />
        </Suspense>
      )}
    </div>
  );
};

export default PublicSimDetail;
