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
  return <section className="relative min-h-[80vh] flex flex-col overflow-hidden bg-background pb-0">
      {/* Video Background */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="https://uovhemqkztmkoozlmqxq.supabase.co/storage/v1/object/sign/trimtab/7585041-hd_1920_1080_25fps.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDZlOGY2My1iYjgzLTQwOGQtYjc1Mi1mOWM0OTMxZjU3OGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0cmltdGFiLzc1ODUwNDEtaGRfMTkyMF8xMDgwXzI1ZnBzLm1wNCIsImlhdCI6MTc2MjMxNzcyNiwiZXhwIjoxNzkzODUzNzI2fQ.YazfV5ZLdQvHRutUaHvxn1i_Ok4gMX9AnCqw-TbuX_o" type="video/mp4" />
      </video>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Top Bar with Logo and Sign In Button */}
      <div className="absolute top-0 left-0 right-0 z-50 w-full px-4 py-6 flex items-center justify-between">
        <img src="/sim-logo-dark.png" alt="Sim Logo" className="h-10 w-10 object-contain" onError={e => {
        e.currentTarget.src = "/sim-logo.png";
      }} />
        <Button onClick={handleXSignIn} size="sm" className="bg-[#82f3aa] hover:bg-[#6dd991] text-black font-semibold px-6 py-2 transition-all duration-300 hover:scale-105">
          Sign In
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-24 text-center max-w-5xl mx-auto w-full">
        {/* $SIMAI badge */}
        <button onClick={handleCopyAddress} className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-all cursor-pointer">
          <img src={solanaLogo} alt="Solana" className="h-5 w-5" />
          <span className="text-xs sm:text-sm font-bold text-zinc-50">Solana Internet Market</span>
        </button>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold mb-4 tracking-tight text-foreground text-center w-full">
          Sell your{" "}
          <span key={currentWordIndex} className="inline-block text-[#82f3aa] animate-fade-in">
            {words[currentWordIndex]}
          </span>
        </h1>
        
        {/* Zero fees text */}
        <p className="text-sm sm:text-base text-[#82f3aa] font-semibold mb-3">
          Accept crypto payments instantly with zero fees
        </p>
        
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl leading-relaxed">
          No middlemen. No transaction fees. Just pure profit.
        </p>

        <Button onClick={handleXSignIn} size="lg" className="gap-2 font-bold px-8 py-5 text-base transition-all duration-300 bg-[#82f3aa] hover:bg-[#6dd991] text-black border-0 shadow-xl shadow-[#82f3aa]/30 hover:shadow-2xl hover:shadow-[#82f3aa]/40 hover:scale-105 whitespace-nowrap mb-4">
          Create Your Store with <img src={xIcon} alt="X" className="h-5 w-5 inline-block" />
        </Button>

        <button onClick={onViewAllAgents} className="text-sm text-muted-foreground hover:text-[#82f3aa] hover:underline transition-all duration-300 font-medium mb-16">
          Explore the Marketplace
        </button>
      </div>
    </section>;
};