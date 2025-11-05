import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface Offering {
  id: string;
  title: string;
  price: number;
  agent: {
    id: string;
    name: string;
    social_links: any;
  };
}

export const OfferingsTextScroll = () => {
  const navigate = useNavigate();

  const { data: offerings } = useQuery({
    queryKey: ['offerings-text-scroll'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('x_agent_offerings')
        .select(`
          id,
          title,
          price,
          agent:advisors!agent_id (
            id,
            name,
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
      navigate(`/${xUsername}`);
    }
  };

  if (!offerings || offerings.length === 0) {
    return null;
  }

  return (
    <div className="w-full border-b border-border/40 bg-card/50 backdrop-blur-sm py-2 overflow-hidden">
      <div className="relative">
        <div className="flex gap-3 animate-scroll-slow hover:pause-animation px-4">
          {/* First set */}
          {offerings.map((offering) => (
            <button
              key={`first-${offering.id}`}
              onClick={() => handleOfferingClick(offering)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-background/80 hover:bg-muted border border-border/50 hover:border-[#83f1aa]/50 transition-all duration-200 flex items-center gap-2 group"
            >
              <Sparkles className="h-3 w-3 text-[#83f1aa] flex-shrink-0" />
              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                {offering.title}
              </span>
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 ml-1"
                style={{ backgroundColor: 'rgba(131, 241, 170, 0.1)', color: '#83f1aa', borderColor: 'rgba(131, 241, 170, 0.3)' }}
              >
                ${offering.price}
              </Badge>
            </button>
          ))}
          {/* Duplicate set for seamless loop */}
          {offerings.map((offering) => (
            <button
              key={`second-${offering.id}`}
              onClick={() => handleOfferingClick(offering)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-background/80 hover:bg-muted border border-border/50 hover:border-[#83f1aa]/50 transition-all duration-200 flex items-center gap-2 group"
            >
              <Sparkles className="h-3 w-3 text-[#83f1aa] flex-shrink-0" />
              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                {offering.title}
              </span>
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 ml-1"
                style={{ backgroundColor: 'rgba(131, 241, 170, 0.1)', color: '#83f1aa', borderColor: 'rgba(131, 241, 170, 0.3)' }}
              >
                ${offering.price}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
