import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { useEffect, useRef } from "react";
import { AgentType } from "@/types/agent";

interface ScrollingSimsProps {
  onSimClick: (sim: AgentType) => void;
}

export const ScrollingSims = ({ onSimClick }: ScrollingSimsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: sims } = useQuery({
    queryKey: ['scrolling-sims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('is_active', true)
        .limit(20);
      
      if (error) throw error;
      return data?.map(sim => ({
        id: sim.id,
        name: sim.name,
        description: sim.description || '',
        auto_description: sim.auto_description,
        type: 'General Tutor' as const,
        status: 'active' as const,
        createdAt: sim.created_at,
        updatedAt: sim.updated_at,
        avatar: sim.avatar_url,
        prompt: sim.prompt,
        title: sim.title,
        sim_type: sim.sim_type as 'historical' | 'living',
        sim_category: sim.sim_category,
        custom_url: sim.custom_url,
        is_featured: false,
        is_official: sim.is_official,
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
        social_links: sim.social_links as any,
        background_image_url: sim.background_image_url,
        crypto_wallet: sim.crypto_wallet,
        x402_enabled: sim.x402_enabled || false,
        x402_price: sim.x402_price || 0,
        x402_wallet: sim.x402_wallet
      } as AgentType));
    },
  });

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || !sims || sims.length === 0) return;

    let scrollPosition = 0;
    const scroll = () => {
      scrollPosition += 1;
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
    };

    const interval = setInterval(scroll, 30);
    return () => clearInterval(interval);
  }, [sims]);

  if (!sims || sims.length === 0) return null;

  // Duplicate the array to create seamless loop
  const duplicatedSims = [...sims, ...sims];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 w-full overflow-hidden py-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden"
        style={{ scrollBehavior: 'auto' }}
      >
        {duplicatedSims.map((sim, index) => (
          <button
            key={`${sim.id}-${index}`}
            onClick={() => onSimClick(sim)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 hover:border-[#83f1aa] transition-all hover:scale-105"
          >
            <img
              src={getAvatarUrl(sim.avatar)}
              alt={sim.name}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${sim.name}`;
              }}
            />
            <span className="text-sm font-medium whitespace-nowrap">{sim.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
