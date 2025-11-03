import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
  const [xProfileData, setXProfileData] = useState<any>(null);
  const xUsername = (agent.social_links as any)?.x_username;

  useEffect(() => {
    const fetchXProfile = async () => {
      if (!xUsername) return;

      try {
        const { data, error } = await supabase.functions.invoke('x-intelligence', {
          body: { username: xUsername },
        });

        if (!error && data?.success && data?.report) {
          setXProfileData(data.report);
        } else if (error || !data?.success) {
          // Silently handle API credit errors - don't break the UI
          console.log('[StoreCard] X API temporarily unavailable for:', xUsername);
        }
      } catch (error) {
        // Gracefully handle errors without breaking the UI
        console.log('[StoreCard] Could not fetch X profile:', error);
      }
    };

    fetchXProfile();
  }, [xUsername]);

  const getAvatarSrc = () => {
    if (xProfileData?.profileImageUrl) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(xProfileData.profileImageUrl)}`;
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
        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
          {agent.description || 'X Agent Store'}
        </p>
        <Badge 
          variant="outline" 
          className="text-xs flex items-center gap-1 w-fit"
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

      // Fetch follower counts for each agent
      const agentsWithFollowers = await Promise.all(
        (agents || []).map(async (agent) => {
          const xUsername = (agent.social_links as any)?.x_username;
          if (!xUsername) {
            // Include agents without X usernames with 0 followers
            return { ...agent, followers: 0 };
          }

          try {
            const { data, error } = await supabase.functions.invoke('x-intelligence', {
              body: { username: xUsername },
            });

            if (!error && data?.success && data?.report) {
              return {
                ...agent,
                followers: data.report.metrics?.followers || 0,
              };
            }
          } catch (error) {
            console.log('[TopStoresSection] X API unavailable for:', xUsername);
          }

          // Return agent with 0 followers if API fails
          return { ...agent, followers: 0 };
        })
      );

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
