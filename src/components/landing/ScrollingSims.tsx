import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { useEffect, useRef } from "react";

export const ScrollingSims = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: sims } = useQuery({
    queryKey: ['scrolling-sims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisors')
        .select('id, name, avatar_url')
        .eq('is_active', true)
        .limit(20);
      
      if (error) throw error;
      return data;
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
    <div className="relative w-full overflow-hidden py-4 border-b border-border/50">
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden"
        style={{ scrollBehavior: 'auto' }}
      >
        {duplicatedSims.map((sim, index) => (
          <div
            key={`${sim.id}-${index}`}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50"
          >
            <img
              src={getAvatarUrl(sim.avatar_url)}
              alt={sim.name}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${sim.name}`;
              }}
            />
            <span className="text-sm font-medium whitespace-nowrap">{sim.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
