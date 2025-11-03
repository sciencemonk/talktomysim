import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Users, TrendingUp } from "lucide-react";

interface XAgent {
  id: string;
  name: string;
  avatar_url: string;
  social_links: any;
  description: string;
}

interface StoreCardProps {
  agent: XAgent;
  rank: number;
  followers: number;
  onClick: () => void;
}

const StoreCard = ({ agent, rank, followers, onClick }: StoreCardProps) => {
  const xUsername = (agent.social_links as any)?.x_username;

  const getAvatarSrc = () => {
    // Use the avatar_url directly from the database
    if (agent.avatar_url) {
      // If it's a Twitter/X image, proxy it through weserv
      if (agent.avatar_url.includes('pbs.twimg.com')) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(agent.avatar_url)}`;
      }
      return agent.avatar_url;
    }
    return null;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <button
      onClick={onClick}
      className="group relative flex items-center gap-4 p-6 rounded-xl bg-card hover:bg-muted border-2 hover:border-[#83f1aa] transition-all duration-300 hover:scale-105 hover:shadow-lg"
    >
      {/* Avatar */}
      <Avatar className="h-16 w-16 border-2 border-[#83f1aa] flex-shrink-0">
        <AvatarImage 
          src={getAvatarSrc() || undefined} 
          alt={agent.name}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
        />
        <AvatarFallback className="bg-primary/10 text-primary text-lg">
          {agent.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <p className="text-lg font-semibold truncate mb-1">
          {xUsername ? `@${xUsername}` : agent.name}
        </p>
        <Badge 
          variant="outline" 
          className="text-sm flex items-center gap-1 w-fit"
          style={{ backgroundColor: 'rgba(131, 241, 170, 0.15)', color: '#83f1aa', borderColor: 'rgba(131, 241, 170, 0.3)' }}
        >
          <Users className="h-3 w-3" />
          {formatNumber(followers)} Followers
        </Badge>
      </div>

      {/* Trending Icon */}
      <TrendingUp className="h-6 w-6 text-[#83f1aa] flex-shrink-0" />
    </button>
  );
};

export const TopStoresSection = () => {
  const navigate = useNavigate();

  const { data: topStores, isLoading } = useQuery({
    queryKey: ['top-stores'],
    queryFn: async () => {
      // Get all X agents (Crypto Mail category)
      const { data: agents, error } = await supabase
        .from('advisors')
        .select('id, name, avatar_url, social_links, description')
        .eq('is_active', true)
        .eq('sim_category', 'Crypto Mail')
        .limit(10);

      if (error) throw error;

      // Get agents with their stored follower data
      const agentsWithFollowers = (agents || []).map((agent) => {
        const xUsername = (agent.social_links as any)?.x_username;
        // Try to get followers from social_links if available
        const storedFollowers = (agent.social_links as any)?.followers || 0;
        
        return {
          ...agent,
          followers: storedFollowers,
        };
      });

      // Sort by followers (agents with follower data will be first)
      const validAgents = agentsWithFollowers
        .filter((agent): agent is XAgent & { followers: number } => agent !== null)
        .sort((a, b) => b.followers - a.followers)
        .slice(0, 10);

      return validAgents;
    },
  });

  const handleStoreClick = (agent: XAgent) => {
    const xUsername = (agent.social_links as any)?.x_username;
    if (xUsername) {
      navigate(`/x/${xUsername}`);
    }
  };

  if (isLoading) {
    return (
      <section className="container mx-auto px-3 sm:px-4 py-16 border-b">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
            Discover Agentic Stores
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!topStores || topStores.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-3 sm:px-4 py-16 border-b">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-center">
          Discover Agentic Stores
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Explore the most popular agentic storefronts with the largest X followings
        </p>
        
        <div className="grid sm:grid-cols-2 gap-4">
          {topStores.map((store, index) => (
            <StoreCard
              key={store.id}
              agent={store}
              rank={index + 1}
              followers={store.followers}
              onClick={() => handleStoreClick(store)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
