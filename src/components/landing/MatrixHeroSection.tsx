import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AgentType } from "@/types/agent";
import xLogo from "@/assets/x-logo.png";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface MatrixHeroSectionProps {
  onCreateXAgent: () => void;
  onSimClick: (sim: AgentType) => void;
  onViewAllAgents: () => void;
}

export const MatrixHeroSection = ({ onCreateXAgent, onSimClick, onViewAllAgents }: MatrixHeroSectionProps) => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const { data: topStores } = useQuery({
    queryKey: ['top-stores-hero'],
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
        followers: (agent.social_links as any)?.followers || 0,
      }));

      return agentsWithFollowers
        .filter(agent => agent.followers > 0)
        .sort((a, b) => b.followers - a.followers)
        .slice(0, 15);
    },
    staleTime: 1000 * 60 * 60,
  });

  const getAvatarSrc = (avatarUrl: string | null) => {
    if (avatarUrl && avatarUrl.includes('pbs.twimg.com')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}`;
    }
    return avatarUrl;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const handleStoreClick = (agent: any) => {
    const xUsername = (agent.social_links as any)?.x_username;
    if (xUsername) {
      navigate(`/x/${xUsername}`);
    }
  };

  return (
    <section className="relative min-h-[80vh] flex flex-col overflow-hidden bg-background pb-0">
      {/* Top Bar with Logo and Theme Toggle */}
      <div className="absolute top-0 left-0 right-0 z-50 w-full px-4 py-6 flex items-center justify-between">
        <img
          src={theme === "dark" ? "/sim-logo-dark.png" : "/sim-logo-light-final.png"}
          alt="Sim Logo"
          className="h-10 w-10 object-contain"
          onError={(e) => {
            e.currentTarget.src = "/sim-logo.png";
          }}
        />
        <ThemeToggle />
      </div>

      {/* Matrix-style grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background"></div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center max-w-5xl mx-auto w-full">
        {/* Powered by badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50">
          <span className="text-xs sm:text-sm text-muted-foreground font-medium">Powered by</span>
          <span className="text-xs sm:text-sm font-bold text-foreground">x402</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold mb-4 tracking-tight text-foreground text-center w-full">
          Agentic Payments
        </h1>
        
        {/* Zero fees text */}
        <p className="text-sm sm:text-base text-[#82f3aa] font-semibold mb-3">
          Accept crypto payments instantly with zero fees — powered by x402
        </p>
        
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl leading-relaxed">
          Create an autonomous storefront that accepts payments directly from your customers. No middlemen. No platform fees. Just pure revenue.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-10 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#82f3aa] text-black font-bold text-base shrink-0 shadow-lg shadow-[#82f3aa]/20 transition-transform group-hover:scale-110">
              1
            </div>
            <p className="text-sm sm:text-base text-foreground font-semibold">Verify X account</p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[#82f3aa]">
            <div className="w-8 h-0.5 bg-[#82f3aa]/30"></div>
            <span className="text-lg">→</span>
            <div className="w-8 h-0.5 bg-[#82f3aa]/30"></div>
          </div>

          <div className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#82f3aa] text-black font-bold text-base shrink-0 shadow-lg shadow-[#82f3aa]/20 transition-transform group-hover:scale-110">
              2
            </div>
            <p className="text-sm sm:text-base text-foreground font-semibold">Create storefront</p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[#82f3aa]">
            <div className="w-8 h-0.5 bg-[#82f3aa]/30"></div>
            <span className="text-lg">→</span>
            <div className="w-8 h-0.5 bg-[#82f3aa]/30"></div>
          </div>

          <div className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#82f3aa] text-black font-bold text-base shrink-0 shadow-lg shadow-[#82f3aa]/20 transition-transform group-hover:scale-110">
              3
            </div>
            <p className="text-sm sm:text-base text-foreground font-semibold">Start selling</p>
          </div>
        </div>

        <Button
          onClick={onCreateXAgent}
          size="lg"
          className="gap-2 font-bold px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl transition-all duration-300 mb-4 bg-[#82f3aa] hover:bg-[#6dd991] text-black border-0 shadow-xl shadow-[#82f3aa]/30 hover:shadow-2xl hover:shadow-[#82f3aa]/40 hover:scale-105"
        >
          Generate with <img src={xLogo} alt="X" className="h-5 w-5 inline-block" />
        </Button>

        <button
          onClick={onViewAllAgents}
          className="text-sm text-muted-foreground hover:text-[#82f3aa] hover:underline transition-all duration-300 font-medium"
        >
          Learn More
        </button>
      </div>

      {/* Auto-scrolling stores at bottom */}
      {topStores && topStores.length > 0 && (
        <div className="relative z-10 pb-8 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-4 justify-center">
              <h3 className="text-sm font-semibold text-muted-foreground">Trending Stores</h3>
            </div>
            
            {/* Scrolling container */}
            <div className="relative overflow-hidden">
              <div className="flex gap-4 animate-scroll-left">
                {/* Duplicate the stores array for seamless loop */}
                {[...topStores, ...topStores].map((store, index) => {
                  const xUsername = (store.social_links as any)?.x_username;
                  return (
                    <button
                      key={`${store.id}-${index}`}
                      onClick={() => handleStoreClick(store)}
                      className="group flex-shrink-0 w-32 flex flex-col items-center gap-2 p-3 rounded-lg bg-card/50 hover:bg-card border border-border/50 hover:border-[#83f1aa]/50 transition-all duration-300 hover:scale-105"
                    >
                      <Avatar className="h-16 w-16 border-2 border-border">
                        <AvatarImage 
                          src={getAvatarSrc(store.avatar_url) || undefined}
                          alt={store.name}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {store.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center w-full">
                        <p className="text-xs font-semibold truncate">
                          {xUsername ? `@${xUsername}` : store.name}
                        </p>
                        {store.followers > 0 && (
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-1.5 py-0 mt-1 bg-primary/10 border-primary/30 text-primary flex items-center gap-1 w-fit mx-auto"
                          >
                            <Users className="h-2.5 w-2.5" />
                            {formatNumber(store.followers)}
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
