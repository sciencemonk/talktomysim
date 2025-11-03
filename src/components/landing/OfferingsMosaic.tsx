import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarUtils";
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

  if (isLoading) {
    return (
      <section className="container mx-auto px-3 sm:px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
            Agentic Services & Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!offerings || offerings.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-3 sm:px-4 py-12 border-b">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
          Agentic Services & Products
        </h2>
        <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
          Zero fees compared to Stripe's 2.9%. Browse services and content from verified creators.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {offerings.map((offering) => {
            const xUsername = offering.agent.social_links?.x_username;
            const avatarSrc = getAvatarUrl(offering.agent.avatar_url);

            return (
              <button
                key={offering.id}
                onClick={() => handleOfferingClick(offering)}
                className="group relative flex flex-col overflow-hidden rounded-xl bg-card hover:bg-muted border-2 hover:border-[#83f1aa] transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                {/* Media Preview */}
                <div className="relative w-full aspect-square overflow-hidden bg-muted">
                  {offering.media_url ? (
                    offering.media_url.match(/\.(mp4|webm|mov)$/i) ? (
                      <video
                        src={offering.media_url}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={offering.media_url}
                        alt={offering.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <span className="text-4xl font-bold text-primary">
                        {offering.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Creator Info */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border-2 border-[#83f1aa]">
                      <AvatarImage src={avatarSrc} alt={offering.agent.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {offering.agent.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
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
                  <p className="text-sm text-muted-foreground line-clamp-2 text-left">
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
          })}
        </div>
      </div>
    </section>
  );
};
