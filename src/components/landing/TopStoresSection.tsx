import { useState } from "react";
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

interface XAgentWithFollowers extends XAgent {
  followers: number;
}

interface StoreCardProps {
  agent: XAgentWithFollowers;
  rank: number;
  onClick: () => void;
}

const StoreCard = ({ agent, rank, onClick }: StoreCardProps) => {
  const xUsername = (agent.social_links as any)?.x_username;

  const getAvatarSrc = () => {
    if (agent.avatar_url) {
      let avatarUrl = agent.avatar_url;
      // If it's a Twitter image with _normal, upgrade to _400x400 for high resolution
      if (avatarUrl.includes('pbs.twimg.com') && avatarUrl.includes('_normal')) {
        avatarUrl = avatarUrl.replace('_normal', '_400x400');
      }
      if (avatarUrl.includes('pbs.twimg.com')) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}`;
      }
      return avatarUrl;
    }
    return null;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-lg bg-card hover:bg-muted border hover:border-[#83f1aa] transition-all duration-300 hover:scale-105 hover:shadow-md"
    >
      {/* Image container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage 
            src={getAvatarSrc() || undefined}
            alt={agent.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
          <AvatarFallback className="w-full h-full rounded-none bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">
              {agent.name?.charAt(0)?.toUpperCase() || 'S'}
            </span>
          </AvatarFallback>
        </Avatar>
      </div>
      
      {/* Content section */}
      <div className="w-full p-3 space-y-2">
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm font-semibold line-clamp-1 text-center">
            {xUsername ? `@${xUsername}` : agent.name}
          </span>
        </div>
        
        {/* Follower count badge */}
        {agent.followers > 0 && (
          <div className="flex justify-center">
            <Badge 
              variant="outline" 
              className="text-xs px-2 py-0.5 bg-primary/10 border-primary/30 text-primary flex items-center gap-1"
            >
              <Users className="h-3 w-3" />
              {formatNumber(agent.followers)}
            </Badge>
          </div>
        )}
      </div>
    </button>
  );
};

export const TopStoresSection = () => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(9);

  const { data: topStores, isLoading } = useQuery({
    queryKey: ['top-stores'],
    queryFn: async () => {
      // Get all X agents (Crypto Mail category)
      const { data: agents, error } = await supabase
        .from('advisors')
        .select('id, name, avatar_url, social_links, description')
        .eq('is_active', true)
        .eq('sim_category', 'Crypto Mail')
        .limit(100);

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

      // Fetch follower data for agents that need updates (rate limited to avoid 429 errors)
      if (agentsToUpdate.length > 0) {
        console.log(`Updating follower data for ${Math.min(agentsToUpdate.length, 3)} agents`);
        // Process sequentially with delay to respect rate limits
        for (const agent of agentsToUpdate.slice(0, 3)) {
          const xUsername = (agent.social_links as any)?.x_username;
          try {
            await supabase.functions.invoke('fetch-x-followers', {
              body: { username: xUsername }
            });
            // Wait 2 seconds before next request
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (err: any) {
            console.error(`Failed to fetch followers for ${xUsername}:`, err);
            // Stop if we hit rate limit
            if (err?.message?.includes('429')) {
              console.log('Rate limit reached, stopping updates');
              break;
            }
          }
        }

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
        .slice(0, 20);
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const handleStoreClick = (agent: XAgent) => {
    const xUsername = (agent.social_links as any)?.x_username;
    if (xUsername) {
      navigate(`/${xUsername}`);
    }
  };

  if (isLoading) {
    return (
      <section className="container mx-auto px-3 sm:px-4 py-12 border-b">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-center">
            Discover Agentic Stores
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
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
    <section className="relative py-16 px-4 bg-background border-b">
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Discover <span className="text-gradient bg-gradient-to-r from-[#83f1aa] to-[#2DD4BF] bg-clip-text text-transparent">Agentic Stores</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse the top trending AI agents accepting x402 payments
          </p>
        </div>

        {/* Stores grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {topStores.slice(0, visibleCount).map((store, index) => (
            <StoreCard
              key={store.id}
              agent={store}
              rank={index + 1}
              onClick={() => handleStoreClick(store)}
            />
          ))}
        </div>

        {/* Show More link */}
        {visibleCount < topStores.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setVisibleCount(prev => prev + 9)}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
