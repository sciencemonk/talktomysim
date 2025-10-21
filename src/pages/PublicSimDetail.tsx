import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Globe, Wallet, ExternalLink, Copy, Check, MessageCircle, X, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PublicChatInterface from "@/components/PublicChatInterface";
import AuthModal from "@/components/AuthModal";
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
  // Check if this is an embedded view or chat mode and show chat immediately
  const searchParams = new URLSearchParams(window.location.search);
  const isEmbedded = searchParams.get('embed') === 'true';
  const shouldShowChat = searchParams.get('chat') === 'true' || isEmbedded;
  const [showChat, setShowChat] = useState(shouldShowChat);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [walletCopied, setWalletCopied] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [embedCodeCopied, setEmbedCodeCopied] = useState(false);
  const embedCodeRef = useRef<HTMLDivElement>(null);

  // Calculate SOL equivalent (example rate: 1 $SimAI = 0.0001 SOL)
  const SIMAI_TO_SOL_RATE = 0.0001;

  const getSimDescription = () => {
    // ONLY use auto_description (never the system prompt in 'description' field)
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
    const simUrl = `${window.location.origin}/${simSlug}?embed=true`;
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
        twitter_url: data.twitter_url,
        website_url: data.website_url,
        crypto_wallet: data.crypto_wallet,
        background_image_url: data.background_image_url,
        price: data.price || 0,
        auto_description: data.auto_description
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
          {/* Only show header if not embedded */}
          {!isEmbedded && (
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
                onClick={() => setShowChat(true)}
              >
                <MessageCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Launch Sim
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
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
};

export default PublicSimDetail;
