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
import { updateMetaTags, resetMetaTags } from "@/lib/metaTags";

export default function OfferingDetail() {
  const { offeringId } = useParams();
  const navigate = useNavigate();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);

  // Fetch x402 info on mount to make offering 402-compatible
  useEffect(() => {
    if (offeringId) {
      supabase.functions.invoke('x402-offering-info', {
        body: { offeringId }
      }).catch(err => console.log('x402 info fetch:', err));
    }
  }, [offeringId]);

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
    if (offering?.title) {
      updateMetaTags({
        title: `SIM | ${offering.title}`,
        description: offering.description,
        image: offering.media_url,
        url: window.location.href,
      });
    }

    return () => {
      resetMetaTags();
    };
  }, [offering]);

  const handleShare = () => {
    const url = window.location.href;
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Offering Details</h1>
          <Button variant="outline" size="icon" onClick={handleShare} className="ml-auto">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Content */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start gap-4">
              {offering.media_url && (
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
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
            {/* Price */}
            <div className="flex items-center gap-2 text-2xl font-bold">
              <DollarSign className="w-6 h-6" style={{ color: '#81f4aa' }} />
              {getPrice()}
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

            {/* Delivery Method */}
            {offering.delivery_method && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Delivery Method</p>
                <p className="text-base capitalize">{offering.delivery_method.replace('_', ' ')}</p>
              </div>
            )}

            {/* Purchase Button */}
            <Button 
              onClick={handlePurchase}
              size="lg" 
              className="w-full"
              style={{ backgroundColor: '#81f4aa', color: '#000' }}
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
          onPurchaseSuccess={() => {
            setShowPurchaseModal(false);
            toast.success("Purchase successful!");
          }}
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
