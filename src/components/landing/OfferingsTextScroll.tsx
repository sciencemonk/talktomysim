import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface XAgent {
  id: string;
  name: string;
  avatar_url: string | null;
  social_links: any;
  followers: number;
}

export const OfferingsTextScroll = () => {
  const navigate = useNavigate();

  const { data: xAgents } = useQuery({
    queryKey: ['x-agents-tiles'],
    queryFn: async () => {
      const { data: agents, error } = await supabase
        .from('advisors')
        .select('id, name, avatar_url, social_links')
        .eq('is_active', true)
        .eq('sim_category', 'Crypto Mail')
        .limit(100);

      if (error) throw error;

      const agentsWithFollowers = (agents || []).map(agent => ({
        ...agent,
        followers: (agent.social_links as any)?.followers || 0
      }));

      return agentsWithFollowers
        .filter(agent => agent.followers > 0)
        .sort((a, b) => b.followers - a.followers)
        .slice(0, 8) as XAgent[];
    },
    staleTime: 1000 * 60 * 60
  });

  const handleAgentClick = (agent: XAgent) => {
    const xUsername = (agent.social_links as any)?.userName || (agent.social_links as any)?.x_username;
    console.log('[OfferingsTextScroll] Clicking agent:', agent.name, 'username:', xUsername);
    if (xUsername) {
      window.scrollTo(0, 0);
      navigate(`/${xUsername}`);
    }
  };

  const getAvatarSrc = (avatarUrl: string | null) => {
    if (avatarUrl) {
      let processedUrl = avatarUrl;
      if (processedUrl.includes('pbs.twimg.com') && processedUrl.includes('_normal')) {
        processedUrl = processedUrl.replace('_normal', '_400x400');
      }
      if (processedUrl.includes('pbs.twimg.com')) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(processedUrl)}`;
      }
      return processedUrl;
    }
    return avatarUrl;
  };

  if (!xAgents || xAgents.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-8 overflow-hidden bg-transparent">
      <div className="relative">
        <div className="flex gap-4 animate-scroll hover:pause-animation px-4">
          {/* First set */}
          {xAgents.map((agent) => (
            <button
              key={`first-${agent.id}`}
              onClick={() => handleAgentClick(agent)}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl bg-card/30 backdrop-blur-sm border border-border/30 hover:border-[#83f1aa]/50 hover:bg-card/50 transition-all duration-300 hover:scale-105 w-24"
            >
              <Avatar className="w-16 h-16 border-2 border-[#83f1aa]/30">
                <AvatarImage 
                  src={getAvatarSrc(agent.avatar_url)}
                  alt={agent.name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {agent.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-foreground truncate w-full text-center">
                {agent.name.replace(/^@/, '')}
              </span>
            </button>
          ))}
          {/* Duplicate set for seamless loop */}
          {xAgents.map((agent) => (
            <button
              key={`second-${agent.id}`}
              onClick={() => handleAgentClick(agent)}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl bg-card/30 backdrop-blur-sm border border-border/30 hover:border-[#83f1aa]/50 hover:bg-card/50 transition-all duration-300 hover:scale-105 w-24"
            >
              <Avatar className="w-16 h-16 border-2 border-[#83f1aa]/30">
                <AvatarImage 
                  src={getAvatarSrc(agent.avatar_url)}
                  alt={agent.name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {agent.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-foreground truncate w-full text-center">
                {agent.name.replace(/^@/, '')}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
