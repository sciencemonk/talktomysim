import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import XAgentPage from "@/pages/XAgentPage";
import { Globe, Wallet, ExternalLink, Copy, Check, MessageCircle, X, Lock, Sparkles, Clock } from "lucide-react";
import aiLoadingGif from "@/assets/ai-loading.gif";
import { ShareButton } from "@/components/ShareButton";
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
import { updateMetaTags, resetMetaTags } from "@/lib/metaTags";


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
  const [isXAgent, setIsXAgent] = useState<boolean | null>(null);
  
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


  // Check if this is an X agent first (before fetchSim)
  useEffect(() => {
    const checkIfXAgent = async () => {
      if (!customUrl) return;

      const { data: xAgents } = await supabase
        .from('advisors')
        .select('*')
        .eq('sim_category', 'Crypto Mail')
        .eq('is_active', true);

      if (xAgents) {
        const matchingXAgent = xAgents.find(agent => {
          const socialLinks = agent.social_links as { x_username?: string; userName?: string } | null;
          const storedUsername = (socialLinks?.x_username || socialLinks?.userName || '').toLowerCase();
          return storedUsername === customUrl?.toLowerCase();
        });

        if (matchingXAgent) {
          setIsXAgent(true);
          setIsLoading(false);
          return;
        }
      }
      
      // Not an X agent, proceed with normal sim fetch
      setIsXAgent(false);
      fetchSim();
    };

    checkUser();
    checkIfXAgent();
    
    // Cleanup: reset meta tags when component unmounts
    return () => {
      resetMetaTags();
    };
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
      // Explicitly exclude edit_code for security
      let query = supabase
        .from('advisors')
        .select('id, name, title, description, prompt, sim_category, x402_wallet, auto_description, full_description, avatar_url, response_length, conversation_style, personality_type, website_url, created_at, updated_at, is_verified, verification_status, date_of_birth, years_experience, interests, skills, sample_scenarios, completion_status, is_public, user_id, is_active, is_official, price, integrations, social_links, x402_price, x402_enabled, expertise_areas, target_audience, background_image_url, marketplace_category, background_content, knowledge_summary, url, full_name, professional_title, location, crypto_wallet, twitter_url, sim_type, owner_welcome_message, education, current_profession, areas_of_expertise, writing_sample, additional_background, custom_url, welcome_message')
        .eq('is_active', true);
      
      // Try custom_url first
      let { data, error } = await query
        .eq('custom_url', customUrl)
        .maybeSingle();

      // If not found by custom_url, try by id
      if (!data && !error) {
        const { data: dataById, error: errorById } = await supabase
          .from('advisors')
          .select('id, name, title, description, prompt, sim_category, x402_wallet, auto_description, full_description, avatar_url, response_length, conversation_style, personality_type, website_url, created_at, updated_at, is_verified, verification_status, date_of_birth, years_experience, interests, skills, sample_scenarios, completion_status, is_public, user_id, is_active, is_official, price, integrations, social_links, x402_price, x402_enabled, expertise_areas, target_audience, background_image_url, marketplace_category, background_content, knowledge_summary, url, full_name, professional_title, location, crypto_wallet, twitter_url, sim_type, owner_welcome_message, education, current_profession, areas_of_expertise, writing_sample, additional_background, custom_url, welcome_message')
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
          .select('id, name, title, description, prompt, sim_category, x402_wallet, auto_description, full_description, avatar_url, response_length, conversation_style, personality_type, website_url, created_at, updated_at, is_verified, verification_status, date_of_birth, years_experience, interests, skills, sample_scenarios, completion_status, is_public, user_id, is_active, is_official, price, integrations, social_links, x402_price, x402_enabled, expertise_areas, target_audience, background_image_url, marketplace_category, background_content, knowledge_summary, url, full_name, professional_title, location, crypto_wallet, twitter_url, sim_type, owner_welcome_message, education, current_profession, areas_of_expertise, writing_sample, additional_background, custom_url, welcome_message')
          .eq('is_active', true);
        
        if (!allError && allSims) {
          data = allSims.find(sim => generateSlug(sim.name) === customUrl) || null;
        }
      }
      
      // X agents are handled by the early check in useEffect - this shouldn't be reached

      if (error) throw error;

      if (!data) {
        // Only navigate to 404 if we've exhausted all options
        console.log('Agent/Sim not found for identifier:', customUrl);
        navigate('/', { replace: true }); // Go to home instead of 404 to prevent loops
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
        is_verified: data.is_verified || false
      } as any;

      console.log('Fetched sim with x402 settings:', {
        id: transformedSim.id,
        name: transformedSim.name,
        x402_enabled: transformedSim.x402_enabled,
        x402_price: transformedSim.x402_price,
        x402_wallet: transformedSim.x402_wallet
      });

      setSim(transformedSim);
      
      // Redirect PumpFun Agents to the dedicated token page
      if (transformedSim.sim_category === 'PumpFun Agent') {
        const socialLinks = transformedSim.social_links as { contract_address?: string } | null;
        const contractAddress = socialLinks?.contract_address;
        if (contractAddress) {
          navigate(`/token/${contractAddress}`, { replace: true });
          return;
        }
      }
      
      // Update meta tags for social sharing
      const simSlug = data.custom_url || generateSlug(transformedSim.name);
      const simUrl = `https://simproject.org/${simSlug}`;
      const simDescription = data.auto_description || 
        (transformedSim.sim_category === 'Crypto Mail' && transformedSim.description) || 
        `Chat with ${transformedSim.name}, your AI assistant.`;
      
      // Get the avatar URL and ensure it's a full URL for social sharing
      let avatarImageUrl = 'https://simproject.org/sim-logo.png?v=2'; // Default fallback
      
      if (data.avatar_url) {
        const avatarPath = getAvatarUrl(data.avatar_url);
        if (avatarPath) {
          if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
            avatarImageUrl = avatarPath;
          } else {
            // Ensure leading slash and convert to full URL
            const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
            avatarImageUrl = `https://simproject.org${cleanPath}`;
          }
        }
      }
      
      console.log('Setting meta tags with avatar:', avatarImageUrl);
      
      updateMetaTags({
        title: `${transformedSim.name} - Sim`,
        description: simDescription,
        image: avatarImageUrl,
        url: simUrl
      });
      
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
        <div className="bg-white rounded-2xl p-6 flex items-center justify-center relative z-10">
          <img 
            src={aiLoadingGif} 
            alt="Loading..." 
            className="h-32 w-32"
          />
        </div>
      </div>
    );
  }

  // If this is an X agent, render XAgentPage directly
  if (isXAgent === true) {
    return <XAgentPage />;
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
            onClick={() => navigate('/', { state: { scrollToAgents: true } })}
          >
            Back to Agents
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
              onClose={() => navigate('/', { state: { scrollToAgents: true } })}
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
              onClick={() => navigate('/', { state: { scrollToAgents: true } })}
              className="mt-2 w-full"
            >
              Back to Agents
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
        const email = formData.get('brief-email') as string;
        const socialLinks = (sim as any).social_links || {};
        
        // Update social_links with email if provided
        if (email?.trim()) {
          socialLinks.brief_email = email.trim();
        } else {
          delete socialLinks.brief_email;
        }

        const { error } = await supabase
          .from('advisors')
          .update({
            name: formData.get('name') as string,
            description: formData.get('brief-topic') as string,
            welcome_message: formData.get('brief-time') as string,
            social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
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

    const briefEmail = ((sim as any).social_links as any)?.brief_email || '';

    // Since we're inside the Autonomous Agent block, we know it's that type
    const marketplaceCategory = (sim as any).marketplace_category?.toLowerCase() || 'uncategorized';
    
    // Category mapping
    const categories = [
      { id: 'all', label: 'All Categories' },
      { id: 'crypto', label: 'Crypto & Web3' },
      { id: 'historical', label: 'Historical Figures' },
      { id: 'influencers', label: 'Influencers & Celebrities' },
      { id: 'fictional', label: 'Fictional Characters' },
      { id: 'education', label: 'Education & Tutoring' },
      { id: 'business', label: 'Business & Finance' },
      { id: 'lifestyle', label: 'Lifestyle & Wellness' },
      { id: 'entertainment', label: 'Entertainment & Games' },
      { id: 'spiritual', label: 'Spiritual & Philosophy' },
    ];
    
    const categoryLabel = categories.find(c => c.id === marketplaceCategory)?.label || marketplaceCategory;
    
    // Type badge is always "Autonomous Agent" since we're in this block
    const typeBadgeText = 'Autonomous Agent';
    
    // Determine second badge based on category
    const secondBadgeText = (marketplaceCategory === 'uncategorized' || marketplaceCategory === 'daily brief' || !marketplaceCategory)
      ? 'Daily Brief'
      : categoryLabel;

    return (
      <div className="h-screen flex items-center justify-center relative bg-gradient-to-br from-[#76da9a]/20 via-background to-[#76da9a]/10">
        <div className="absolute inset-0 bg-background/90 backdrop-blur-xl z-0" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#76da9a]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#76da9a]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 w-full max-w-5xl mx-auto p-4 h-[92vh] flex flex-col">
          <div className="backdrop-blur-2xl bg-gradient-to-br from-card/80 via-card/60 to-card/80 border border-border/50 rounded-2xl shadow-2xl h-full flex flex-col overflow-hidden">
            {/* Futuristic Header */}
            <div className="relative p-6 border-b border-border/50 flex items-center justify-between bg-[#76da9a]/5">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-[#76da9a]/50 shadow-lg shadow-[#76da9a]/20">
                  <AvatarImage src={getAvatarUrl(sim.avatar)} alt={sim.name} className="object-cover" />
                  <AvatarFallback>{sim.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {sim.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-[#76da9a]/20 text-[#76da9a] border border-[#76da9a]/30">
                      {typeBadgeText}
                    </span>
                    {secondBadgeText && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-[#76da9a]/20 text-[#76da9a] border border-[#76da9a]/30">
                        {secondBadgeText}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/', { state: { scrollToAgents: true } })}
                className="hover:bg-red-500/10 hover:text-red-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Futuristic Tabs */}
            <Tabs defaultValue="briefs" className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 pt-4">
                <TabsList className="w-full grid grid-cols-2 bg-background/50 backdrop-blur-sm">
                  <TabsTrigger 
                    value="briefs" 
                    className="data-[state=active]:bg-[#76da9a]/20 data-[state=active]:text-foreground data-[state=active]:border-[#76da9a]/50 data-[state=active]:border"
                  >
                    Daily Briefs
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings"
                    className="data-[state=active]:bg-[#76da9a]/20 data-[state=active]:text-foreground data-[state=active]:border-[#76da9a]/50 data-[state=active]:border"
                  >
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="briefs" className="flex-1 overflow-y-auto px-6 pb-6 mt-4">
                <DailyBriefsList advisorId={sim.id} />
              </TabsContent>

              <TabsContent value="settings" className="flex-1 px-6 pb-6 mt-4 overflow-hidden">
                <div className="h-full flex items-center justify-center">
                  <form onSubmit={handleSaveSettings} className="w-full max-w-2xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#76da9a]" />
                          Sim Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={sim.name}
                          placeholder="Enter sim name"
                          className="h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-[#76da9a]/50 transition-colors"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="brief-time" className="text-sm font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#76da9a]" />
                          Brief Time (UTC) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="brief-time"
                          name="brief-time"
                          type="time"
                          defaultValue={sim.welcome_message || '09:00'}
                          className="h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-[#76da9a]/50 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brief-topic" className="text-sm font-medium flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-[#76da9a]" />
                        What do you want a daily brief on? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="brief-topic"
                        name="brief-topic"
                        defaultValue={sim.description || ''}
                        placeholder="E.g., AI developments, cryptocurrency markets, climate change news..."
                        rows={3}
                        className="resize-none bg-background/50 backdrop-blur-sm border-border/50 focus:border-[#76da9a]/50 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brief-email" className="text-sm font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#76da9a]" />
                        Email <span className="text-muted-foreground text-xs">(Optional)</span>
                      </Label>
                      <Input
                        id="brief-email"
                        name="brief-email"
                        type="email"
                        defaultValue={briefEmail}
                        placeholder="your@email.com"
                        className="h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-[#76da9a]/50 transition-colors"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 font-semibold bg-[#82f2aa] hover:bg-[#6dd994] text-black shadow-lg transition-all"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Save Settings
                    </Button>
                  </form>
                </div>
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
              <div className="flex items-center gap-2">
                <ShareButton tutorId={sim.id} tutorName={sim.name} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (!currentUser) {
                      navigate('/', { state: { scrollToAgents: true } });
                    } else {
                      setShowChat(false);
                  }
                }}
              >
                <X className="h-5 w-5" />
              </Button>
              </div>
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
                className="w-full h-14 text-base shadow-xl hover:shadow-2xl transition-all duration-300 mb-4 group bg-[#83f1aa] hover:bg-[#6dd88f] text-black"
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
                {sim?.sim_category === 'Crypto Mail' ? 'Launch X Agent' : 'Launch Sim'}
              </Button>

              {/* Share Button - Using ShareButton component */}
              <div className="mb-4">
                <ShareButton tutorId={sim.id} tutorName={sim.name} className="w-full h-12 text-base font-semibold" />
              </div>


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
