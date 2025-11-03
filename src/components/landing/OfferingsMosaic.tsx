import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

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
}

const OfferingCard = ({ offering, onClick }: OfferingCardProps) => {
  const xUsername = offering.agent.social_links?.x_username;

  const getAvatarSrc = () => {
    // Use the avatar_url directly from the database
    if (offering.agent.avatar_url) {
      // If it's a Twitter/X image, proxy it through weserv
      if (offering.agent.avatar_url.includes('pbs.twimg.com')) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(offering.agent.avatar_url)}`;
      }
      return offering.agent.avatar_url;
    }
    return null;
  };

  return (
    <button
      onClick={onClick}
      className="group flex-shrink-0 w-[280px] sm:w-[320px] flex flex-col overflow-hidden rounded-xl bg-card hover:bg-muted border-2 hover:border-[#83f1aa] transition-all duration-300 hover:scale-105 hover:shadow-lg"
    >
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Creator Info */}
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10 border-2 border-[#83f1aa]">
            <AvatarImage 
              src={getAvatarSrc() || undefined} 
              alt={offering.agent.name}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {offering.agent.name.charAt(0).toUpperCase()}
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
        <div className="pt-2 border-t border-border/50">
          <Badge 
            variant="outline" 
            className="text-sm font-bold"
            style={{ backgroundColor: 'rgba(131, 241, 170, 0.15)', color: '#83f1aa', borderColor: 'rgba(131, 241, 170, 0.3)' }}
          >
            {offering.price} SOL
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
    const xUsername = offering.agent.social_links?.x_username;
    if (xUsername) {
      navigate(`/x/${xUsername}`);
    }
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
            />
          ))}
          {/* Duplicate set for seamless loop */}
          {offerings.map((offering) => (
            <OfferingCard
              key={`second-${offering.id}`}
              offering={offering}
              onClick={() => handleOfferingClick(offering)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
