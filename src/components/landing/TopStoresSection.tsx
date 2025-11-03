import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Users, TrendingUp, Sparkles, Zap } from "lucide-react";

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

  // Determine rank styling
  const isTopRank = rank <= 3;
  const rankColor = rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : rank === 3 ? 'bg-orange-500' : 'bg-[#83f1aa]';

  return (
    <button
      onClick={onClick}
      className="group relative flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-card to-card/50 hover:from-card hover:to-muted border-2 border-border hover:border-[#83f1aa] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#83f1aa]/20 overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#83f1aa]/0 via-[#83f1aa]/5 to-[#83f1aa]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Rank badge with glow */}
      <div className="relative flex-shrink-0">
        <div className={`absolute inset-0 ${rankColor} blur-md opacity-50 group-hover:opacity-75 transition-opacity`} />
        <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${rankColor} text-black font-bold shadow-lg`}>
          {rank}
        </div>
      </div>

      {/* Avatar with animated ring */}
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-[#83f1aa] rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
        <Avatar className="relative h-16 w-16 border-2 border-[#83f1aa] ring-2 ring-[#83f1aa]/20 group-hover:ring-4 group-hover:ring-[#83f1aa]/40 transition-all duration-300">
          <AvatarImage 
            src={getAvatarSrc() || undefined} 
            alt={agent.name}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="group-hover:scale-110 transition-transform duration-300"
          />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-lg font-semibold">
            {agent.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isTopRank && (
          <div className="absolute -top-1 -right-1 z-10">
            <Sparkles className="h-4 w-4 text-[#83f1aa] animate-pulse" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="relative flex-1 min-w-0 text-left">
        <p className="text-lg font-semibold truncate mb-1 group-hover:text-[#83f1aa] transition-colors">
          {xUsername ? `@${xUsername}` : agent.name}
        </p>
        {followers > 0 && (
          <Badge 
            variant="outline" 
            className="text-xs flex items-center gap-1.5 w-fit group-hover:shadow-md transition-shadow"
            style={{ backgroundColor: 'rgba(131, 241, 170, 0.15)', color: '#83f1aa', borderColor: 'rgba(131, 241, 170, 0.3)' }}
          >
            <Users className="h-3.5 w-3.5" />
            {formatNumber(followers)}
          </Badge>
        )}
      </div>

      {/* Trending Icon with animation */}
      <div className="relative flex-shrink-0">
        <TrendingUp className="h-6 w-6 text-[#83f1aa] group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
        <Zap className="absolute inset-0 h-6 w-6 text-[#83f1aa] opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300" />
      </div>
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
        .limit(50);

      if (error) throw error;

      // Fetch follower counts for agents that don't have them or have outdated data
      const agentsToUpdate = (agents || []).filter(agent => {
        const xUsername = (agent.social_links as any)?.x_username;
        const followers = (agent.social_links as any)?.followers;
        const lastUpdated = (agent.social_links as any)?.last_updated;
        
        if (!xUsername) return false;
        if (!followers) return true;
        if (!lastUpdated) return true;
        
        // Update if data is older than 24 hours
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(lastUpdated) < dayAgo;
      });

      // Fetch follower data for agents that need updates (do this in parallel)
      if (agentsToUpdate.length > 0) {
        console.log(`Updating follower data for ${agentsToUpdate.length} agents`);
        await Promise.allSettled(
          agentsToUpdate.slice(0, 10).map(async (agent) => {
            const xUsername = (agent.social_links as any)?.x_username;
            try {
              await supabase.functions.invoke('fetch-x-followers', {
                body: { username: xUsername }
              });
            } catch (err) {
              console.error(`Failed to fetch followers for ${xUsername}:`, err);
            }
          })
        );

        // Refetch agents after updates
        const { data: updatedAgents } = await supabase
          .from('advisors')
          .select('id, name, avatar_url, social_links, description')
          .eq('is_active', true)
          .eq('sim_category', 'Crypto Mail')
          .limit(50);

        if (updatedAgents) {
          const agentsWithFollowers = updatedAgents.map(agent => ({
            ...agent,
            followers: (agent.social_links as any)?.followers || 0,
          }));

          return agentsWithFollowers
            .filter((agent): agent is XAgent & { followers: number } => agent !== null)
            .sort((a, b) => b.followers - a.followers)
            .slice(0, 10);
        }
      }

      // Return agents with their follower counts
      const agentsWithFollowers = (agents || []).map(agent => ({
        ...agent,
        followers: (agent.social_links as any)?.followers || 0,
      }));

      return agentsWithFollowers
        .filter((agent): agent is XAgent & { followers: number } => agent !== null)
        .sort((a, b) => b.followers - a.followers)
        .slice(0, 10);
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
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
    <section className="relative container mx-auto px-3 sm:px-4 py-16 border-b overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#83f1aa]/5 via-transparent to-transparent opacity-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#83f1aa]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#83f1aa]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#83f1aa]/10 border border-[#83f1aa]/30 mb-4">
            <Sparkles className="h-4 w-4 text-[#83f1aa] animate-pulse" />
            <span className="text-sm font-semibold text-[#83f1aa]">Trending Now</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-foreground via-foreground to-[#83f1aa] bg-clip-text text-transparent">
            Discover Agentic Stores
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore the most popular agentic storefronts with the largest X followings
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          {topStores.map((store, index) => (
            <div key={store.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <StoreCard
                agent={store}
                rank={index + 1}
                followers={store.followers}
                onClick={() => handleStoreClick(store)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
