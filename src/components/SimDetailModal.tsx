import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Wallet, ExternalLink, Copy, Check, MessageCircle, Share2, ArrowLeft, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { AgentType } from "@/types/agent";
import { useToast } from "@/hooks/use-toast";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { toast as sonnerToast } from "sonner";
import PublicChatInterface from "@/components/PublicChatInterface";
import EditSimModal from "@/components/EditSimModal";
import { fetchSolanaBalance, formatSolBalance } from "@/services/solanaBalanceService";
import { validateX402Session } from "@/utils/x402Session";

// Lazy load X402PaymentModal to avoid blocking app initialization with ethers.js
const X402PaymentModal = lazy(() => 
  import("@/components/X402PaymentModal").then(module => ({ default: module.X402PaymentModal }))
);

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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editCode, setEditCode] = useState("");
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [showEditSimModal, setShowEditSimModal] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const signedIn = !!session?.user;
      console.log('SimDetailModal auth check:', { signedIn, userId: session?.user?.id });
      setIsSignedIn(signedIn);
    };
    if (open) {
      checkAuth();
    }
  }, [open]);

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

    if (open && sim) {
      loadBalance();
    }
  }, [open, sim]);

  // Calculate SOL equivalent (1 $SimAI = 0.001 SOL)
  const SIMAI_TO_SOL_RATE = 0.001;
  
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
    const simUrl = `${window.location.origin}/${simSlug}?embed=chat-only`;
    const avatarUrl = getAvatarUrl(sim.avatar);
    const escapedName = sim.name.replace(/'/g, "\\'");
    const escapedWelcome = (sim.welcome_message || `Hi! I'm ${sim.name}. How can I help you today?`).replace(/'/g, "\\'").replace(/"/g, '\\"');
    
    return `<!-- ${sim.name} Chat Widget -->
<div id="sim-chat-widget"></div>
<script>
  (function() {
    'use strict';
    
    // Prevent duplicate loading
    if (window.__SIM_CHAT_LOADED__) {
      console.log('[SimChat] Already loaded');
      return;
    }
    window.__SIM_CHAT_LOADED__ = true;

    const simConfig = {
      name: '${escapedName}',
      avatar: '${avatarUrl}',
      simUrl: '${simUrl}'
    };
    
    // Create styles
    const style = document.createElement('style');
    style.id = 'sim-chat-widget-styles';
    style.textContent = '#sim-chat-bubble { position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 4px 12px rgba(0,0,0,0.15); cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 9999; transition: transform 0.3s ease; }' +
      '#sim-chat-bubble:hover { transform: scale(1.1); }' +
      '#sim-chat-bubble img { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; }' +
      '#sim-chat-window { position: fixed; bottom: 90px; right: 20px; width: 380px; height: 600px; max-width: calc(100vw - 40px); max-height: calc(100vh - 120px); border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); background: white; z-index: 9998; display: none; flex-direction: column; overflow: hidden; }' +
      '#sim-chat-window.active { display: flex; }' +
      '#sim-chat-header { padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; gap: 12px; }' +
      '#sim-chat-close { margin-left: auto; background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; }' +
      '#sim-chat-iframe { flex: 1; border: none; width: 100%; }';
    document.head.appendChild(style);
    
    // Create bubble
    const bubble = document.createElement('div');
    bubble.id = 'sim-chat-bubble';
    bubble.innerHTML = '<img src="' + simConfig.avatar + '" alt="' + simConfig.name + '" draggable="false">';
    document.body.appendChild(bubble);
    
    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'sim-chat-window';
    chatWindow.innerHTML = '<div id="sim-chat-header"><strong>' + simConfig.name + '</strong><button id="sim-chat-close">×</button></div><iframe id="sim-chat-iframe" src="' + simConfig.simUrl + '"></iframe>';
    document.body.appendChild(chatWindow);
    
    // Toggle chat window
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
    
    console.log('[SimChat] Widget loaded');
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
    
    console.log('Launch Sim clicked:', { 
      simName: sim.name, 
      isSignedIn, 
      customUrl: sim.custom_url,
      simId: sim.id,
      x402Enabled: sim.x402_enabled,
      x402Price: sim.x402_price
    });
    
    // Check if x402 payment is required
    if (sim.x402_enabled && sim.x402_price && sim.x402_wallet) {
      const validSession = validateX402Session(sim.x402_wallet);
      if (!validSession) {
        console.log('x402 payment required, showing payment modal');
        setShowPaymentModal(true);
        return;
      } else {
        console.log('Valid x402 session found:', validSession);
        setPaymentSessionId(validSession);
      }
    }
    
    // If user is not signed in, navigate to the public chat page with chat parameter
    if (!isSignedIn) {
      const simSlug = (sim as any).custom_url || generateSlug(sim.name);
      console.log('Navigating signed-out user to:', `/${simSlug}?chat=true`);
      onOpenChange(false); // Close the modal
      navigate(`/${simSlug}?chat=true`);
      return;
    }

    // If user is signed in, add the sim
    console.log('Adding sim for signed-in user');
    setIsAddingSim(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, requesting auth');
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

      console.log('Navigating signed-in user to:', `/home?sim=${sim.id}`);
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

  const handleEditClick = () => {
    setShowEditDialog(true);
    setEditCode("");
  };

  const handleValidateEditCode = async () => {
    if (!sim || !editCode) return;

    // Validate format (6 digits)
    if (!/^\d{6}$/.test(editCode)) {
      sonnerToast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsValidatingCode(true);
    try {
      // Fetch the sim's edit_code from the database
      const { data: simData, error } = await supabase
        .from('advisors')
        .select('edit_code')
        .eq('id', sim.id)
        .single();

      if (error) throw error;

      // Check if the code matches
      if (simData.edit_code === editCode) {
        sonnerToast.success("Access granted!");
        setShowEditDialog(false);
        // Open the edit sim modal
        setShowEditSimModal(true);
      } else {
        sonnerToast.error("Invalid edit code");
      }
    } catch (error) {
      console.error('Error validating edit code:', error);
      sonnerToast.error("Failed to validate code");
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handlePaymentSuccess = (sessionId: string) => {
    console.log('Payment successful, session ID:', sessionId);
    setPaymentSessionId(sessionId);
    setShowPaymentModal(false);
    
    // Now launch the sim
    if (!isSignedIn) {
      const simSlug = sim?.custom_url || generateSlug(sim?.name || '');
      onOpenChange(false);
      navigate(`/${simSlug}?chat=true`);
    } else {
      // For signed-in users, show chat interface
      setShowChat(true);
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
      <DialogContent className="max-w-xl p-0 overflow-hidden border-2 h-auto max-h-[95vh] w-full sm:w-auto">
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
          <div className="backdrop-blur-xl bg-card/50 rounded-lg p-6 overflow-y-auto relative">
          {/* Action Buttons - Top Right */}
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEditClick}
              className="h-8 w-8 rounded-full hover:bg-accent"
              title="Edit Sim"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
              <img 
                src={getAvatarUrl(sim.avatar)} 
                alt={sim.name} 
                className="relative w-full h-full object-cover rounded-2xl border-2 border-border shadow-2xl"
              />
            </div>
          </div>

          {/* Name and Description */}
          <div className="text-center space-y-2 mb-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{sim.name}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed px-2">
              {getSimDescription()}
            </p>
          </div>

          {/* SOL Wallet Info */}
          {(sim as any)?.crypto_wallet && (
            <div className="mb-3 p-3 bg-accent/10 rounded-xl border border-border">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Wallet className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs font-mono text-muted-foreground truncate">
                    {(sim as any).crypto_wallet}
                  </span>
                </div>
                <span className="text-xs font-semibold text-foreground flex-shrink-0">
                  {isLoadingBalance ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    formatSolBalance(solBalance)
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Launch/Add Sim Button */}
          <Button
            size="lg"
            className="w-full h-11 text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 mb-3 group bg-[#82f2aa] hover:bg-[#6dd994] text-black"
            onClick={handleLaunchSim}
            disabled={isAddingSim}
          >
            <MessageCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            {isAddingSim ? 'Adding...' : (isSignedIn ? 'Add Sim' : 'Launch Sim')}
          </Button>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button
              size="sm"
              variant="outline"
              className="h-10 text-sm font-medium group"
              onClick={handleShareLink}
            >
              {shareLinkCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 mr-1.5 group-hover:scale-110 transition-transform" />
                  Share
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-10 text-sm font-medium group"
              onClick={() => setShowEmbedCode(!showEmbedCode)}
            >
              <svg className="h-3.5 w-3.5 mr-1.5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Embed
            </Button>
          </div>

          {/* Embed Code Section */}
          {showEmbedCode && (
            <div ref={embedCodeRef} className="mb-3 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-xs">Embed Code</h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCopyEmbedCode}
                  className="h-7 text-xs"
                >
                  {embedCodeCopied ? (
                    <>
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-background rounded border border-border p-2 mb-2 max-h-32 overflow-y-auto">
                <code className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
                  {getEmbedCode()}
                </code>
              </div>
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Instructions:</p>
                <ol className="list-decimal list-inside space-y-0.5 ml-2 text-xs">
                  <li>Copy the code above</li>
                  <li>Paste before the closing &lt;/body&gt; tag</li>
                  <li>Widget appears on bottom right</li>
                </ol>
              </div>
            </div>
          )}

          {/* SOL Wallet Address */}
          {(sim as any)?.crypto_wallet && (
            <div className="flex flex-col gap-2 pt-3 border-t border-border">
              <button
                onClick={() => {
                  navigator.clipboard.writeText((sim as any).crypto_wallet || '');
                  setWalletCopied(true);
                  setTimeout(() => setWalletCopied(false), 2000);
                  sonnerToast.success('Wallet address copied to clipboard!');
                }}
                className="flex flex-col gap-1.5 w-full px-3 py-2.5 rounded-xl bg-accent/10 hover:bg-accent/20 border border-border hover:border-primary transition-all duration-300 group"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Wallet className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">SOL Wallet</span>
                  </div>
                  {walletCopied ? (
                    <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center justify-between w-full pl-6">
                  <span className="text-xs font-mono text-muted-foreground truncate">
                    {(sim as any).crypto_wallet}
                  </span>
                  <span className="text-xs font-medium text-foreground ml-2 flex-shrink-0">
                    {isLoadingBalance ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      formatSolBalance(solBalance)
                    )}
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Social Links */}
          {sim.social_links && (sim.social_links.x || sim.social_links.website || sim.social_links.telegram) && (
            <div className="flex flex-col gap-2 pt-3 border-t border-border">
              {sim.social_links.x && (
                <a
                  href={sim.social_links.x.startsWith('http') ? sim.social_links.x : `https://${sim.social_links.x}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-accent/10 hover:bg-accent/20 border border-border hover:border-primary transition-all duration-300 group"
                >
                  <svg className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26L24 21.75h-6.642l-5.214-6.817-5.956 6.817H3.29l7.73-8.835L3 2.25h6.826l4.712 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="text-sm font-medium group-hover:text-foreground transition-colors">Follow on X</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors ml-auto flex-shrink-0" />
                </a>
              )}

              {sim.social_links.website && (
                <a
                  href={sim.social_links.website.startsWith('http') ? sim.social_links.website : `https://${sim.social_links.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-accent/10 hover:bg-accent/20 border border-border hover:border-primary transition-all duration-300 group"
                >
                  <Globe className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  <span className="text-sm font-medium group-hover:text-foreground transition-colors">Visit Website</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors ml-auto flex-shrink-0" />
                </a>
              )}

              {sim.social_links.telegram && (
                <a
                  href={sim.social_links.telegram.startsWith('http') ? sim.social_links.telegram : `https://${sim.social_links.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-accent/10 hover:bg-accent/20 border border-border hover:border-primary transition-all duration-300 group"
                >
                  <svg className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="m12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                  <span className="text-sm font-medium group-hover:text-foreground transition-colors">Join Telegram</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors ml-auto flex-shrink-0" />
                </a>
              )}
            </div>
          )}
          </div>
        )}
      </DialogContent>

      {/* Edit Code Dialog */}
      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter Edit Code</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter the 6-digit edit code to modify this Sim.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={editCode}
              onChange={(e) => setEditCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-widest font-mono bg-background text-foreground"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && editCode.length === 6) {
                  handleValidateEditCode();
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isValidatingCode}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleValidateEditCode}
              disabled={editCode.length !== 6 || isValidatingCode}
            >
              {isValidatingCode ? "Validating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Sim Modal */}
      {sim && (
        <EditSimModal
          open={showEditSimModal}
          onOpenChange={(open) => {
            setShowEditSimModal(open);
            if (!open) {
              onOpenChange(false);
            }
          }}
          simId={sim.id}
        />
      )}

      {/* x402 Payment Modal */}
      {sim && sim.x402_enabled && (
        <Suspense fallback={null}>
          <X402PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onPaymentSuccess={handlePaymentSuccess}
            simName={sim.name}
            price={sim.x402_price || 0.01}
            walletAddress={sim.x402_wallet || ''}
          />
        </Suspense>
      )}
    </Dialog>
  );
};

export default SimDetailModal;
