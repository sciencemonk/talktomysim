import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Share2, Sparkles, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { XOfferingPurchaseModal } from "@/components/XOfferingPurchaseModal";
import { useState, useEffect } from "react";
import { DigitalFileModal } from "@/components/DigitalFileModal";
import { AgentOfferingModal } from "@/components/AgentOfferingModal";
import { OfferingReceiptModal } from "@/components/OfferingReceiptModal";
import { updateMetaTags, resetMetaTags } from "@/lib/metaTags";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import solanaLogo from "@/assets/solana-logo.png";

interface PurchaseData {
  signature: string;
  amount: number;
  offeringTitle: string;
  offeringDescription: string;
  deliveryMethod: string;
  buyerInfo: Record<string, string>;
  timestamp: Date;
}

export default function OfferingDetail() {
  const { offeringId } = useParams();
  const navigate = useNavigate();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);
  const { theme, setTheme } = useTheme();

  // Set light mode as default on initial load only
  useEffect(() => {
    const hasThemePreference = localStorage.getItem('vite-ui-theme');
    if (!hasThemePreference) {
      setTheme('light');
    }
  }, []);

  const { data: offering, isLoading } = useQuery({
    queryKey: ['offering-detail', offeringId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('x_agent_offerings')
        .select(`
          *,
          agent:advisors!agent_id (
            id,
            name,
            avatar_url,
            social_links,
            x402_wallet,
            custom_url
          )
        `)
        .eq('id', offeringId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (offering?.title && offeringId) {
      const supabaseUrl = 'https://uovhemqkztmkoozlmqxq.supabase.co';
      // Use the /x402 route as the payment endpoint
      const x402Url = `${window.location.origin}/offering/${offeringId}/x402`;
      
      updateMetaTags({
        title: `SIM | ${offering.title}`,
        description: offering.description,
        image: offering.media_url,
        url: window.location.href,
      });

      // Add HTTP Link header equivalent as meta tag for x402 discovery
      let linkTag = document.querySelector('link[rel="payment"]');
      if (!linkTag) {
        linkTag = document.createElement('link');
        linkTag.setAttribute('rel', 'payment');
        document.head.appendChild(linkTag);
      }
      linkTag.setAttribute('href', x402Url);
      linkTag.setAttribute('type', 'application/json');

      // Also add as meta tag for broader compatibility
      let metaTag = document.querySelector('meta[name="x402"]');
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', 'x402');
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', x402Url);

      console.log('[OfferingDetail] Added x402 discovery tags:', x402Url);
    }

    return () => {
      resetMetaTags();
      document.querySelector('link[rel="payment"]')?.remove();
      document.querySelector('meta[name="x402"]')?.remove();
    };
  }, [offering, offeringId]);

  const handleShare = () => {
    const url = `https://solanainternetmarket.com/offering/${offeringId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handlePurchase = () => {
    if (offering?.offering_type === 'digital_file') {
      setShowFileModal(true);
    } else if (offering?.offering_type === 'agent') {
      setShowAgentModal(true);
    } else {
      setShowPurchaseModal(true);
    }
  };

  const handleAgentClick = () => {
    if (!offering?.agent) return;
    
    const socialLinks = offering.agent.social_links as any;
    
    // Try to get username from social_links
    let username = socialLinks?.x_username || '';
    
    // If no x_username, try to extract from x URL
    if (!username && socialLinks?.x) {
      const xUrl = socialLinks.x;
      username = xUrl.split('/').pop() || '';
    }
    
    // Fallback to custom_url if available
    if (!username) {
      // Query for the agent's custom_url
      supabase
        .from('advisors')
        .select('custom_url')
        .eq('id', offering.agent.id)
        .single()
        .then(({ data }) => {
          if (data?.custom_url) {
            navigate(`/${data.custom_url}`);
          }
        });
      return;
    }
    
    if (username) {
      navigate(`/${username}`);
    }
  };

  const getAvatarSrc = () => {
    const avatarUrl = offering?.agent?.avatar_url;
    if (!avatarUrl) return undefined;
    
    // If it's a Twitter/X image, proxy it through weserv for CORS
    if (avatarUrl.includes('pbs.twimg.com') || avatarUrl.includes('twimg.com')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}&w=100&h=100&fit=cover&default=404`;
    }
    
    return avatarUrl;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading offering...</div>
      </div>
    );
  }

  if (!offering) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Offering not found</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const getPrice = () => {
    if (offering.offering_type === 'agent' && offering.price_per_conversation) {
      return `${offering.price_per_conversation} USDC per conversation`;
    }
    if (offering.price === 0) return 'Free';
    return `${offering.price} USDC`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header with Logo, Sign In and Theme Toggle */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo on the left */}
            <button 
              onClick={() => navigate('/marketplace')}
              className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full backdrop-blur-sm transition-all cursor-pointer shadow-sm bg-primary/10 border border-primary/20 hover:bg-primary/20 whitespace-nowrap"
            >
              <img src={solanaLogo} alt="Solana" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-bold text-fg">Solana Internet Market</span>
            </button>
            
            {/* Theme Toggle and Create a Store on the right */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border border-fg text-fg hover:bg-fg/10 hover:text-fg text-xs sm:text-sm px-2 sm:px-4"
                onClick={() => navigate('/')}
              >
                Create a Store
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl mt-20">
        {/* Main Content */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1" />
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              {offering.media_url && (
                <div className="w-full aspect-square max-w-md mx-auto rounded-lg overflow-hidden">
                  {offering.media_url.includes('.mp4') || offering.media_url.includes('.webm') || offering.media_url.includes('.mov') ? (
                    <video 
                      src={offering.media_url} 
                      className={`w-full h-full object-cover ${offering.blur_preview ? 'blur-xl' : ''}`}
                    />
                  ) : (
                    <img 
                      src={offering.media_url} 
                      alt={offering.title}
                      className={`w-full h-full object-cover ${offering.blur_preview ? 'blur-xl' : ''}`}
                    />
                  )}
                </div>
              )}
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{offering.title}</CardTitle>
                <CardDescription className="text-base">{offering.description}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Price and Delivery in a row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Price</p>
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <DollarSign className="w-6 h-6" style={{ color: '#81f4aa' }} />
                  {getPrice()}
                </div>
              </div>

              {/* Delivery Method */}
              {offering.delivery_method && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Delivery</p>
                  <p className="text-base capitalize">{offering.delivery_method.replace('_', ' ')}</p>
                </div>
              )}
            </div>

            {/* Agent Info */}
            {offering.agent && (
              <div>
                <p className="text-sm text-muted-foreground mb-3">Offered by</p>
                <div 
                  className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary/70 transition-colors"
                  onClick={handleAgentClick}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage 
                      src={getAvatarSrc()}
                      alt={offering.agent.name}
                    />
                    <AvatarFallback>{offering.agent.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{offering.agent.name}</p>
                    <p className="text-sm text-muted-foreground">View store</p>
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Button */}
            <Button 
              onClick={handlePurchase}
              size="lg" 
              className="w-full mt-4"
              style={{ backgroundColor: '#635cff', color: '#fff' }}
            >
              {offering.price === 0 ? 'Get for Free' : 'Purchase Now'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showPurchaseModal && offering && (
        <XOfferingPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          offering={offering as any}
          agentId={offering.agent?.id || ''}
          agentName={offering.agent?.name || ''}
          walletAddress={offering.agent?.x402_wallet || ''}
          onPurchaseSuccess={(digitalFileUrl, signature, buyerInfo) => {
            setShowPurchaseModal(false);
            setPurchaseData({
              signature: signature || '',
              amount: offering.price,
              offeringTitle: offering.title,
              offeringDescription: offering.description,
              deliveryMethod: offering.delivery_method,
              buyerInfo: buyerInfo || {},
              timestamp: new Date(),
            });
            setShowReceiptModal(true);
          }}
        />
      )}

      {showReceiptModal && (
        <OfferingReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          purchaseData={purchaseData}
        />
      )}

      {showFileModal && offering && (
        <DigitalFileModal
          isOpen={showFileModal}
          onClose={() => setShowFileModal(false)}
          fileUrl={offering.digital_file_url || ''}
          fileName={offering.title}
          offeringTitle={offering.title}
        />
      )}

      {showAgentModal && offering && (
        <AgentOfferingModal
          isOpen={showAgentModal}
          onClose={() => setShowAgentModal(false)}
          offering={offering as any}
          agentData={{
            id: offering.agent?.id || '',
            name: offering.agent?.name || '',
            description: offering.description,
            avatar: offering.agent?.avatar_url || '',
            avatar_url: offering.agent?.avatar_url || '',
          }}
          pricePerConversation={offering.price_per_conversation || 0}
        />
      )}
    </div>
  );
}
