import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Wallet, ExternalLink, Copy, Check, MessageCircle, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AgentType } from "@/types/agent";
import { useToast } from "@/hooks/use-toast";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { toast as sonnerToast } from "sonner";
import PublicChatInterface from "@/components/PublicChatInterface";

interface SimDetailModalProps {
  sim: AgentType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthRequired?: () => void;
}

const SimDetailModal = ({ sim, open, onOpenChange, onAuthRequired }: SimDetailModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [walletCopied, setWalletCopied] = useState(false);
  const [isAddingSim, setIsAddingSim] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [embedCodeCopied, setEmbedCodeCopied] = useState(false);
  const embedCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsSignedIn(!!user);
    };
    checkAuth();
  }, [open]);

  // Calculate SOL equivalent (1 $SimAI = 0.001 SOL)
  const SIMAI_TO_SOL_RATE = 0.001;
  
  const getSimDescription = () => {
    // Prioritize auto_description, then fall back to description, then defaults
    if ((sim as any)?.auto_description) {
      return (sim as any).auto_description;
    }
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
    const simConfig = {
      name: "${sim.name}",
      avatar: "${avatarUrl}",
      simUrl: "${simUrl}",
      welcomeMessage: "${(sim.welcome_message || `Hi! I'm ${sim.name}. How can I help you today?`).replace(/"/g, '\\"')}"
    };
    
    // Create widget styles
    const style = document.createElement('style');
    style.textContent = \`
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
      #sim-chat-header img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
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
    \`;
    document.head.appendChild(style);
    
    // Create bubble
    const bubble = document.createElement('div');
    bubble.id = 'sim-chat-bubble';
    bubble.innerHTML = '<img src="' + simConfig.avatar + '" alt="' + simConfig.name + '">';
    document.body.appendChild(bubble);
    
    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'sim-chat-window';
    chatWindow.innerHTML = \`
      <div id="sim-chat-header">
        <img src="\${simConfig.avatar}" alt="\${simConfig.name}">
        <strong>\${simConfig.name}</strong>
        <button id="sim-chat-close">×</button>
      </div>
      <iframe id="sim-chat-iframe" src="\${simConfig.simUrl}"></iframe>
    \`;
    document.body.appendChild(chatWindow);
    
    // Toggle chat
    bubble.addEventListener('click', () => {
      chatWindow.classList.toggle('active');
    });
    
    document.getElementById('sim-chat-close').addEventListener('click', (e) => {
      e.stopPropagation();
      chatWindow.classList.remove('active');
    });
  })();
</script>`;
  };

  const handleCopyEmbedCode = () => {
    const code = getEmbedCode();
    navigator.clipboard.writeText(code);
    setEmbedCodeCopied(true);
    setTimeout(() => setEmbedCodeCopied(false), 2000);
    sonnerToast.success('Embed code copied to clipboard!');
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

  const handleLaunchSim = async () => {
    if (!sim) return;
    
    // If user is not signed in, show chat in modal
    if (!isSignedIn) {
      setShowChat(true);
      return;
    }

    // If user is signed in, add the sim
    setIsAddingSim(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAddingSim(false);
        if (onAuthRequired) {
          onAuthRequired();
        } else {
          navigate('/?signin=true');
        }
        return;
      }

      // Add the sim to user_advisors (cast as any to avoid TS errors)
      const { error: userAdvisorError } = await (supabase
        .from('user_advisors') as any)
        .upsert({
          user_id: user.id,
          advisor_id: sim.id,
        }, {
          onConflict: 'user_id,advisor_id',
          ignoreDuplicates: true
        });

      if (userAdvisorError && userAdvisorError.code !== '23505') {
        console.error('Error adding to user_advisors:', userAdvisorError);
      }

      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('tutor_id', sim.id)
        .maybeSingle();

      if (!existingConv) {
        // Create a new conversation
        const { error: convError } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            tutor_id: sim.id,
            is_anonymous: false,
          });

        if (convError) throw convError;
      }

      sonnerToast.success(`${sim.name} added to your sims!`);
      onOpenChange(false);
      navigate(`/home?sim=${sim.id}`);
    } catch (error) {
      console.error('Error adding sim:', error);
      sonnerToast.error('Failed to add sim');
    } finally {
      setIsAddingSim(false);
    }
  };

  if (!sim) return null;

  const simDescription = getSimDescription();
  const priceInfo = getSimPrice();

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) setShowChat(false); // Reset chat when modal closes
    }}>
      <DialogContent className="max-w-xl p-0 overflow-hidden [&>button]:hidden border-2 h-[100dvh] max-h-[100dvh] sm:h-[90vh] sm:max-h-[90vh] w-full sm:w-auto">
        {showChat ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(false)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h2 className="font-semibold text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{sim.name}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <PublicChatInterface agent={sim} />
            </div>
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-card/50 rounded-lg p-8 sm:p-12 max-h-[80vh] overflow-y-auto">
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

          {/* Name and Description */}
          <div className="text-center space-y-3 mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{sim.name}</h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2">
              {getSimDescription()}
            </p>
          </div>

          {/* Price */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Price:</span>
            <span className={`text-lg font-semibold ${priceInfo.isFree ? 'text-green-500' : 'text-primary'}`}>
              {priceInfo.display}
            </span>
          </div>

          {/* Launch/Add Sim Button */}
          <Button
            size="lg"
            className="w-full h-14 text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 mb-4 group"
            onClick={handleLaunchSim}
            disabled={isAddingSim}
          >
            <MessageCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            {isAddingSim ? 'Adding...' : (isSignedIn ? 'Add Sim' : 'Launch Sim')}
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

          {/* Close Button */}
          <Button
            variant="outline"
            className="w-full h-10 text-sm font-medium"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>

          {/* Social Links & Wallet */}
          {(sim.twitter_url || sim.website_url || sim.crypto_wallet) && (
            <div className="flex flex-col gap-3 pt-4 border-t border-border mt-4">
              {sim.twitter_url && (
                <a
                  href={sim.twitter_url.startsWith('http') ? sim.twitter_url : `https://${sim.twitter_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl bg-accent/10 hover:bg-accent/20 border border-border hover:border-primary transition-all duration-300 group"
                >
                  <svg className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26L24 21.75h-6.642l-5.214-6.817-5.956 6.817H3.29l7.73-8.835L3 2.25h6.826l4.712 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SimDetailModal;
