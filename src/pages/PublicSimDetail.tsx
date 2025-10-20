import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Globe, Wallet, ExternalLink, Copy, Check, MessageCircle, X, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PublicChatInterface from "@/components/PublicChatInterface";
import AuthModal from "@/components/AuthModal";
import SimPublicFooter from "@/components/SimPublicFooter";
import { AgentType } from "@/types/agent";
import { useToast } from "@/hooks/use-toast";
import landingBackground from "@/assets/landing-background.jpg";
import { getAvatarUrl } from "@/lib/avatarUtils";

const PublicSimDetail = () => {
  const { customUrl } = useParams<{ customUrl: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sim, setSim] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [walletCopied, setWalletCopied] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  // Calculate SOL equivalent (example rate: 1 $SimAI = 0.0001 SOL)
  const SIMAI_TO_SOL_RATE = 0.0001;

  const getSimDescription = () => {
    if (sim?.description) {
      return sim.description;
    }
    // Default description for sims without custom descriptions
    if (sim?.title) {
      return `Chat with this Sim who brings expertise as a ${sim.title}.`;
    }
    return 'An AI Sim ready to assist you with insights and guidance.';
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

  const handleShareLink = () => {
    if (!sim) return;
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2000);
    toast({
      title: "Link copied!",
      description: "Share this link with others to let them discover this Sim"
    });
  };

  useEffect(() => {
    checkUser();
    if (customUrl) {
      fetchSim();
    }
  }, [customUrl]);

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
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('custom_url', customUrl)
        .eq('is_active', true)
        .maybeSingle();

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
        twitter_url: data.twitter_url,
        website_url: data.website_url,
        crypto_wallet: data.crypto_wallet,
        background_image_url: data.background_image_url,
        price: data.price || 0
      };

      setSim(transformedSim);
    } catch (error) {
      console.error('Error fetching sim:', error);
      navigate('/404');
    } finally {
      setIsLoading(false);
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

  return (
    <div 
      className="h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary/20"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0" />

      {showChat ? (
        <div className="flex-1 flex flex-col relative z-10 h-full">
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
              onClick={() => setShowChat(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
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

              {/* Price */}
              <div className="mb-6 flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">Price:</span>
                <span className={`text-lg font-semibold ${getSimPrice().isFree ? 'text-green-500' : 'text-primary'}`}>
                  {getSimPrice().display}
                </span>
              </div>

              {/* Start Chatting Button */}
              <Button
                size="lg"
                className="w-full h-14 text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 mb-4 group"
                onClick={async () => {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) {
                    navigate('/?signin=true');
                  } else {
                    setShowChat(true);
                  }
                }}
              >
                <MessageCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Add Sim
              </Button>

              {/* Share Button */}
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 text-base font-semibold mb-6 group"
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
                      className="flex items-center justify-between gap-3 w-full px-5 py-3.5 rounded-2xl bg-accent/10 hover:bg-accent/20 border border-border hover:border-primary transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Wallet className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                        <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors truncate">
                          {sim.crypto_wallet}
                        </span>
                      </div>
                      {walletCopied ? (
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <SimPublicFooter />
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
};

export default PublicSimDetail;
