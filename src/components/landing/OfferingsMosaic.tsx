import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Offering {
  id: string;
  title: string;
  description: string;
  price: number;
  media_url: string | null;
  agent: {
    id: string;
    name: string;
    avatar_url: string;
    social_links: any;
  };
}

interface OfferingCardProps {
  offering: Offering;
  onClick: () => void;
  onShare: (e: React.MouseEvent) => void;
}

const OfferingCard = ({ offering, onClick, onShare }: OfferingCardProps) => {
  const xUsername = (offering.agent.social_links as any)?.userName || (offering.agent.social_links as any)?.x_username;

  const getAvatarSrc = () => {
    // First try to get from avatar_url
    if (offering.agent.avatar_url) {
      // If it's a Twitter/X image, proxy it through weserv for CORS
      if (offering.agent.avatar_url.includes('pbs.twimg.com') || offering.agent.avatar_url.includes('twimg.com')) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(offering.agent.avatar_url)}`;
      }
      return offering.agent.avatar_url;
    }
    
    // Fallback: try to get profile image URL from social_links
    const profileImageUrl = offering.agent.social_links?.profileImageUrl || offering.agent.social_links?.profile_image_url;
    if (profileImageUrl) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(profileImageUrl)}`;
    }
    
    return undefined;
  };

  return (
    <button
      onClick={onClick}
      className="group relative flex-shrink-0 w-[280px] sm:w-[320px] flex flex-col overflow-hidden rounded-xl bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-[#635BFF] transition-all duration-300 hover:scale-105 hover:shadow-lg"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 bg-background/80"
        onClick={onShare}
      >
        <Share2 className="w-4 h-4" />
      </Button>
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Creator Info */}
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10 border-2 border-[#635BFF]">
            <AvatarImage 
              src={getAvatarSrc()} 
              alt={offering.agent.name}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {xUsername ? xUsername.charAt(0).toUpperCase() : offering.agent.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold truncate">
              {xUsername ? `@${xUsername}` : offering.agent.name}
            </p>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base line-clamp-2 leading-tight text-left">
          {offering.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3 text-left min-h-[60px]">
          {offering.description}
        </p>

        {/* Price */}
        <div className="pt-2 border-t border-gray-200">
          <Badge 
            variant="outline" 
            className="text-sm font-bold"
            style={{ backgroundColor: 'rgba(99, 91, 255, 0.15)', color: '#635BFF', borderColor: 'rgba(99, 91, 255, 0.3)' }}
          >
            ${offering.price % 1 === 0 ? offering.price : offering.price.toFixed(2)} USDC
          </Badge>
        </div>
      </div>
    </button>
  );
};

export const OfferingsMosaic = () => {
  const navigate = useNavigate();

  const { data: offerings, isLoading } = useQuery({
    queryKey: ['offerings-mosaic'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('x_agent_offerings')
        .select(`
          id,
          title,
          description,
          price,
          media_url,
          agent:advisors!agent_id (
            id,
            name,
            avatar_url,
            social_links
          )
        `)
        .eq('is_active', true)
        .limit(50);

      if (error) throw error;
      return data as unknown as Offering[];
    },
  });

  const handleOfferingClick = (offering: Offering) => {
    navigate(`/offering/${offering.id}`);
  };

  const handleShare = (offeringId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/offering/${offeringId}`;
    navigator.clipboard.writeText(url);
    toast.success("Offering link copied to clipboard!");
  };

  if (!offerings || offerings.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-8 overflow-hidden">
      {/* Scrolling Row */}
      <div className="relative">
        <div className="flex gap-4 animate-scroll-slow hover:pause-animation px-3">
          {/* First set */}
          {offerings.map((offering) => (
            <OfferingCard
              key={`first-${offering.id}`}
              offering={offering}
              onClick={() => handleOfferingClick(offering)}
              onShare={(e) => handleShare(offering.id, e)}
            />
          ))}
          {/* Duplicate set for seamless loop */}
          {offerings.map((offering) => (
            <OfferingCard
              key={`second-${offering.id}`}
              offering={offering}
              onClick={() => handleOfferingClick(offering)}
              onShare={(e) => handleShare(offering.id, e)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
