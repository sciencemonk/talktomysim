import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AgentType } from "@/types/agent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface XAgentsShowcaseProps {
  agents: (AgentType & { user_id?: string; like_count?: number; is_verified?: boolean })[];
}

interface XAgentCardProps {
  agent: AgentType & { user_id?: string; like_count?: number; is_verified?: boolean };
  onAgentClick: (agent: AgentType) => void;
}

const XAgentCard = ({ agent, onAgentClick }: XAgentCardProps) => {
  const [xProfileData, setXProfileData] = useState<any>(null);
  const xUsername = (agent.social_links as any)?.x_username;
  const isVerified = (agent as any).is_verified || false;

  useEffect(() => {
    const fetchXProfile = async () => {
      if (!xUsername) return;

      try {
        const { data, error } = await supabase.functions.invoke('x-intelligence', {
          body: { username: xUsername },
        });

        if (!error && data?.success && data?.report) {
          setXProfileData(data.report);
        }
      } catch (error) {
        console.error('[XAgentCard] Error fetching X profile:', error);
      }
    };

    fetchXProfile();
  }, [xUsername]);

  const getAvatarSrc = () => {
    if (xProfileData?.profileImageUrl) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(xProfileData.profileImageUrl)}`;
    }
    const avatarUrl = getAvatarUrl(agent.avatar);
    if (avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}`;
    }
    return avatarUrl;
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <button
      onClick={() => onAgentClick(agent)}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-card hover:bg-muted border-2 hover:border-[#83f1aa] transition-all duration-300 hover:scale-105 hover:shadow-lg"
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage 
            src={getAvatarSrc()}
            alt={agent.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
          <AvatarFallback className="w-full h-full rounded-none bg-primary/10 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary">
              {agent.name?.replace(/^@/, '').charAt(0)?.toUpperCase() || 'X'}
            </span>
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="w-full p-3 space-y-2.5">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-base font-semibold line-clamp-2 leading-tight block">
            {agent.name.replace(/^@/, '')}
          </span>
          {isVerified && (
            <div className="group/verified relative flex-shrink-0">
              <img 
                src="/lovable-uploads/verified-badge.png" 
                alt="Verified"
                className="w-4 h-4"
              />
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1.5 justify-center">
          <Badge 
            variant="outline" 
            className="text-[10px] px-2 py-0.5 flex items-center gap-0.5"
            style={{ backgroundColor: 'rgba(129, 244, 170, 0.15)', color: '#81f4aa', borderColor: 'rgba(129, 244, 170, 0.3)' }}
          >
            <Users className="h-3 w-3" />
            {formatNumber(xProfileData?.metrics?.followers || 0)} Followers
          </Badge>
        </div>
      </div>
    </button>
  );
};

export const XAgentsShowcase = ({ agents }: XAgentsShowcaseProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'followers' | 'newest' | 'name'>('followers');
  const [visibleCount, setVisibleCount] = useState(42);

  const handleAgentClick = (agent: AgentType) => {
    const xUsername = (agent.social_links as any)?.x_username;
    if (xUsername) {
      window.scrollTo(0, 0);
      navigate(`/x/${xUsername}`);
    }
  };

  // Filter only verified X agents
  const xAgents = agents.filter(agent => {
    const simCategory = (agent as any).sim_category;
    return simCategory === 'Crypto Mail' && (agent as any).is_verified;
  });

  // Apply search filter
  const filteredAgents = xAgents.filter(agent => {
    if (!searchQuery) return true;
    return agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           agent.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sort agents
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    if (sortBy === 'followers') {
      const aCount = (a as any).like_count || 0;
      const bCount = (b as any).like_count || 0;
      return bCount - aCount;
    } else if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  const visibleAgents = sortedAgents.slice(0, visibleCount);
  const hasMore = sortedAgents.length > visibleCount;

  return (
    <section className="w-full py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            X Agents Marketplace
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover verified AI agents from X creators. Message them directly and pay with crypto.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search X agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="followers">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Followers
                  </div>
                </SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Agent count */}
        <div className="text-center text-sm text-muted-foreground">
          Showing {visibleAgents.length} of {sortedAgents.length} agents
        </div>

        {/* Agents grid */}
        {visibleAgents.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {visibleAgents.map((agent) => (
              <XAgentCard
                key={agent.id}
                agent={agent}
                onAgentClick={handleAgentClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No X agents found matching your criteria.</p>
          </div>
        )}

        {/* Show more button */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setVisibleCount(prev => prev + 42)}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              Show More Agents
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
