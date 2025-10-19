import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Wallet, ExternalLink, Copy, Check, MessageCircle, X, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AgentType } from "@/types/agent";
import { useToast } from "@/hooks/use-toast";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { toast as sonnerToast } from "sonner";

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
    const shareUrl = `${window.location.origin}/${(sim as any).custom_url || sim.id}`;
    navigator.clipboard.writeText(shareUrl);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2000);
    toast({
      title: "Link copied!",
      description: "Share this link with others to let them discover this Sim"
    });
  };

  const handleAddSim = async () => {
    if (!sim) return;
    
    setIsAddingSim(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAddingSim(false);
        if (onAuthRequired) {
          onAuthRequired();
        } else {
          sonnerToast.error('Please sign in to add sims');
        }
        return;
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
            is_anonymous: false
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary/20 border-2 [&>button]:hidden">
        <div className="backdrop-blur-xl bg-card/50 rounded-lg p-8 sm:p-12 relative">
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
              {simDescription}
            </p>
          </div>

          {/* Price */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Price:</span>
            <span className={`text-lg font-semibold ${priceInfo.isFree ? 'text-green-500' : 'text-primary'}`}>
              {priceInfo.display}
            </span>
          </div>

          {/* Add Sim Button */}
          <Button
            size="lg"
            className="w-full h-14 text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 mb-4 group"
            onClick={handleAddSim}
            disabled={isAddingSim}
          >
            <MessageCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            {isAddingSim ? 'Adding...' : 'Add Sim'}
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
      </DialogContent>
    </Dialog>
  );
};

export default SimDetailModal;
