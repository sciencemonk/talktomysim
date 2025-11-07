import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { Badge } from "@/components/ui/badge";
import { AgentType } from "@/types/agent";
import xIcon from "@/assets/x-icon.png";
import solanaLogo from "@/assets/solana-logo.png";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
interface MatrixHeroSectionProps {
  onCreateXAgent: () => void;
  onSimClick: (sim: AgentType) => void;
  onViewAllAgents: () => void;
}
export const MatrixHeroSection = ({
  onCreateXAgent,
  onSimClick,
  onViewAllAgents
}: MatrixHeroSectionProps) => {
  const {
    theme
  } = useTheme();
  const navigate = useNavigate();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = ["Products", "Services", "AI Agents", "Digital Goods"];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex(prev => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  const {
    data: topStores
  } = useQuery({
    queryKey: ['top-stores-hero'],
    queryFn: async () => {
      const {
        data: agents,
        error
      } = await supabase.from('advisors').select('id, name, avatar_url, social_links').eq('is_active', true).eq('sim_category', 'Crypto Mail').limit(100);
      if (error) throw error;
      const agentsWithFollowers = (agents || []).map(agent => ({
        ...agent,
        followers: (agent.social_links as any)?.followers || 0
      }));
      return agentsWithFollowers.filter(agent => agent.followers > 0).sort((a, b) => b.followers - a.followers).slice(0, 10);
    },
    staleTime: 1000 * 60 * 60
  });
  const getAvatarSrc = (avatarUrl: string | null) => {
    if (avatarUrl) {
      let processedUrl = avatarUrl;
      // If it's a Twitter image with _normal, upgrade to _400x400 for high resolution
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
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };
  const handleStoreClick = (agent: any) => {
    const xUsername = (agent.social_links as any)?.x_username;
    if (xUsername) {
      navigate(`/${xUsername}`);
    }
  };
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText("FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump");
      toast.success("Address copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };
  const handleXSignIn = async () => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const {
        data,
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false
        }
      });
      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Error signing in with X:', error);
      toast.error(error?.message || 'Failed to sign in with X');
    }
  };

  // Fetch X agents for the scroller
  const { data: xAgents } = useQuery({
    queryKey: ['x-agents-tiles'],
    queryFn: async () => {
      const { data: agents, error } = await supabase
        .from('advisors')
        .select('id, name, avatar_url, social_links, created_at')
        .eq('is_active', true)
        .eq('sim_category', 'Crypto Mail')
        .limit(100);

      if (error) throw error;

      const agentsWithFollowers = (agents || []).map(agent => ({
        ...agent,
        followers: (agent.social_links as any)?.followers || 0
      }));

      // Sort by followers (if available), then by creation date
      return agentsWithFollowers
        .sort((a, b) => {
          // First sort by follower count (descending)
          if (b.followers !== a.followers) {
            return b.followers - a.followers;
          }
          // If followers are equal (or both 0), sort by creation date (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
        .slice(0, 25);
    },
    staleTime: 1000 * 60 * 60
  });

  const handleAgentClick = (agent: any) => {
    const xUsername = (agent.social_links as any)?.x_username;
    if (xUsername) {
      navigate(`/${xUsername}`);
    }
  };
  return <section className="relative min-h-[80vh] flex flex-col overflow-hidden bg-background pb-0">
      {/* Video Background */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="https://kxsvyeirqimcydtkowga.supabase.co/storage/v1/object/sign/storage/5404707-uhd_3840_2160_25fps.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNDczMmYzNC1kYzc2LTRhNzgtOGNmOC05MDE5NTRhM2RkMjgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9yYWdlLzU0MDQ3MDctdWhkXzM4NDBfMjE2MF8yNWZwcy5tcDQiLCJpYXQiOjE3NjI0ODU3MDUsImV4cCI6MTc5NDAyMTcwNX0.Pytq982adrUXc9sNaK_Z0yivbwROhesiqMIjyWRe-ME" type="video/mp4" />
      </video>

      {/* Light overlay for text readability */}
      <div className="absolute inset-0 bg-white/85"></div>

      {/* Top Bar with Logo and Sign In Button */}
      <div className="absolute top-0 left-0 right-0 z-50 w-full px-4 py-6 flex items-center justify-between">
        <img src="/sim-logo-gradient.png" alt="Sim Logo" className="h-10 w-10 object-contain" />
        <Button onClick={handleXSignIn} size="sm" className="bg-[#635BFF] hover:bg-[#5046E5] text-white font-semibold px-6 py-2 transition-all duration-300 hover:scale-105">
          Sign In
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-24 text-center max-w-5xl mx-auto w-full">
        {/* $SIMAI badge */}
        <button onClick={handleCopyAddress} className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-300 hover:bg-white/90 transition-all cursor-pointer shadow-sm">
          <img src={solanaLogo} alt="Solana" className="h-5 w-5" />
          <span className="text-xs sm:text-sm font-bold text-gray-900">Solana Internet Market</span>
        </button>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold mb-4 tracking-tight text-gray-900 text-center w-full">
          Sell your{" "}
          <span key={currentWordIndex} className="inline-block text-[#635BFF] animate-fade-in">
            {words[currentWordIndex]}
          </span>
        </h1>
        
        {/* Zero fees text */}
        <p className="text-sm sm:text-base text-[#635BFF] font-semibold mb-3">
          Accept crypto payments instantly with zero fees
        </p>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-10 max-w-3xl leading-relaxed">
          No middlemen. No transaction fees. Just pure profit.
        </p>

        <Button onClick={handleXSignIn} size="lg" className="gap-2 font-bold px-8 py-5 text-base transition-all duration-300 bg-[#635BFF] hover:bg-[#5046E5] text-white border-0 shadow-xl hover:shadow-2xl hover:scale-105 whitespace-nowrap mb-24">
          Create Your Store with <img src={xIcon} alt="X" className="h-5 w-5 inline-block" />
        </Button>
      </div>

      {/* X Agents Scroller - positioned at bottom */}
      {xAgents && xAgents.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 w-full py-8 overflow-hidden">
          <div className="relative">
            <div className="flex gap-3 animate-scroll-mobile md:animate-scroll hover:pause-animation px-4">
              {/* First set */}
              {xAgents.map((agent) => (
                <button
                  key={`first-${agent.id}`}
                  onClick={() => handleAgentClick(agent)}
                  className="flex-shrink-0 transition-all duration-300 hover:scale-110 hover:opacity-80 cursor-pointer"
                >
                  <Avatar className="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-gray-200 hover:border-[#635BFF]/50 shadow-md">
                    <AvatarImage 
                      src={getAvatarSrc(agent.avatar_url)}
                      alt={agent.name}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="rounded-xl object-cover"
                    />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm rounded-xl">
                      {agent.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              ))}
              {/* Duplicate set for seamless loop */}
              {xAgents.map((agent) => (
                <button
                  key={`second-${agent.id}`}
                  onClick={() => handleAgentClick(agent)}
                  className="flex-shrink-0 transition-all duration-300 hover:scale-110 hover:opacity-80 cursor-pointer"
                >
                  <Avatar className="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-gray-200 hover:border-[#635BFF]/50 shadow-md">
                    <AvatarImage 
                      src={getAvatarSrc(agent.avatar_url)}
                      alt={agent.name}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="rounded-xl object-cover"
                    />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm rounded-xl">
                      {agent.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>;
};