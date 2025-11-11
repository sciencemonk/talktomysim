import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, Package, FileText, Search, Filter, Star, TrendingUp, Sparkles, Zap, Store, Mail, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useOfferings } from "@/hooks/useOfferings";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import simHeroLogo from "@/assets/sim-hero-logo.png";
import simLogoWhite from "@/assets/sim-logo-white.png";
import xIcon from "@/assets/x-icon.png";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { useTheme } from "@/hooks/useTheme";
import SimpleFooter from "@/components/SimpleFooter";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
type MarketplaceItem = {
  id: string;
  type: 'agent' | 'offering';
  name: string;
  description: string;
  avatar?: string;
  price?: number;
  category?: string;
  rating?: number;
  sales?: number;
  badge?: string;
};
const Marketplace = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("trending");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const {
    theme
  } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showBetaRequest, setShowBetaRequest] = useState(false);
  const [betaCode, setBetaCode] = useState('');
  const [dynamicWord, setDynamicWord] = useState('Live');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  const words = ['Live', 'Transact', 'Explore'];
  
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % words.length;
      setDynamicWord(words[currentIndex]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const calculateCountdown = () => {
      // November 11, 2025 at 11:59PM ET
      const targetDate = new Date('2025-11-11T23:59:00-05:00').getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    checkUser();
  }, []);
  const {
    offerings,
    isLoading: offeringsLoading
  } = useOfferings();

  // Fetch all agents from advisors table
  const {
    data: agents = [],
    isLoading: agentsLoading
  } = useQuery({
    queryKey: ['marketplace-agents'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('advisors').select('*').eq('is_active', true);
      if (error) throw error;

      // Filter out Crypto Mail agents that might have invalid X usernames
      // to prevent errors when fetching profile data
      return (data || []).filter(agent => {
        // Skip Crypto Mail agents except for verified ones
        if (agent.sim_category === 'Crypto Mail') {
          return agent.is_verified;
        }
        return true;
      }).map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description || agent.auto_description || '',
        auto_description: agent.auto_description,
        type: 'General Tutor' as const,
        status: 'active' as const,
        createdAt: agent.created_at,
        updatedAt: agent.updated_at,
        avatar: agent.avatar_url,
        avatar_url: agent.avatar_url,
        prompt: agent.prompt,
        sim_category: agent.sim_category,
        marketplace_category: agent.marketplace_category,
        is_verified: agent.is_verified || false,
        is_featured: false,
        price: agent.price || 0,
        interactions: 0,
        performance: 0,
        social_links: agent.social_links
      }));
    }
  });
  const isLoading = agentsLoading || offeringsLoading;

  // Combine agents and offerings into marketplace items
  const marketplaceItems: MarketplaceItem[] = [...agents.map(agent => ({
    id: agent.id,
    type: 'agent' as const,
    name: agent.name,
    description: agent.description,
    avatar: agent.avatar,
    price: agent.price || 0,
    category: agent.marketplace_category || 'AI Agents',
    rating: agent.performance || 0,
    sales: agent.interactions || 0,
    badge: agent.is_verified ? 'Verified' : agent.is_featured ? 'Featured' : undefined
  })), ...offerings.map(offering => ({
    id: offering.id,
    type: 'offering' as const,
    name: offering.title,
    description: offering.description,
    avatar: offering.agent_avatar_url || offering.media_url,
    price: offering.price,
    category: offering.offering_type === 'agent' ? 'AI Agents' : offering.offering_type === 'digital' ? 'Digital Goods' : 'Products',
    rating: 0,
    sales: 0,
    badge: undefined
  }))];

  // Count items by category (only offerings, not agents)
  const categoryCounts = {
    'AI Agents': offerings.filter(o => o.offering_type === 'agent').length,
    'Digital Goods': offerings.filter(o => o.offering_type === 'digital').length,
    'Products': offerings.filter(o => o.offering_type === 'standard').length,
    'Featured': offerings.filter(o => o.offering_type && ['agent', 'digital', 'standard'].includes(o.offering_type)).length
  };

  // Filter and sort items - exclude agents from products view
  const filteredItems = marketplaceItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    // Only show offerings (not agents) in the products grid
    const isOffering = item.type === 'offering';
    return matchesSearch && matchesCategory && isOffering;
  }).sort((a, b) => {
    switch (sortBy) {
      case "trending":
        return (b.sales || 0) - (a.sales || 0);
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  // Filter agents by search term
  const filteredAgents = agents.filter(agent => {
    if (!searchTerm) return true;
    return agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || agent.description.toLowerCase().includes(searchTerm.toLowerCase()) || agent.auto_description && agent.auto_description.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const categories = Array.from(new Set(marketplaceItems.map(item => item.category).filter(Boolean)));
  const handleItemClick = (item: MarketplaceItem) => {
    // Check if it's an NFT
    if (item.type === 'agent') {
      const agent = agents.find(a => a.id === item.id);
      if (agent && (agent as any).marketplace_category === 'nft') {
        navigate(`/nft/${item.id}`);
        return;
      }
      navigate(`/${item.id}`);
    } else {
      navigate(`/offering/${item.id}`);
    }
  };

  // Generate varied gradient backgrounds for items without images
  const getGradientForItem = (index: number) => {
    const gradients = ['from-violet-500/20 via-purple-500/20 to-fuchsia-500/20', 'from-blue-500/20 via-cyan-500/20 to-teal-500/20', 'from-emerald-500/20 via-green-500/20 to-lime-500/20', 'from-amber-500/20 via-orange-500/20 to-red-500/20', 'from-pink-500/20 via-rose-500/20 to-red-500/20', 'from-indigo-500/20 via-blue-500/20 to-sky-500/20', 'from-cyan-500/20 via-teal-500/20 to-emerald-500/20', 'from-orange-500/20 via-amber-500/20 to-yellow-500/20'];
    return gradients[index % gradients.length];
  };
  const generateBetaCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handlePostToX = () => {
    const tweetText = '$SIMAI';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleCopyCA = async () => {
    const ca = "FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump";
    try {
      await navigator.clipboard.writeText(ca);
      toast.success("Contract address copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Could not copy to clipboard");
    }
  };

  const handleXSignIn = () => {
    const code = generateBetaCode();
    setBetaCode(code);
    setShowBetaRequest(true);
  };
  return <div className="min-h-screen bg-bg">
      {/* Hero Section with Video Background */}
      <div className="relative border-b border-border overflow-hidden h-screen">
        {/* Video Background */}
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://kxsvyeirqimcydtkowga.supabase.co/storage/v1/object/sign/storage/11904029_3840_2160_30fps.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNDczMmYzNC1kYzc2LTRhNzgtOGNmOC05MDE5NTRhM2RkMjgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9yYWdlLzExOTA0MDI5XzM4NDBfMjE2MF8zMGZwcy5tcDQiLCJpYXQiOjE3NjI3NDkzNzcsImV4cCI6MTc5NDI4NTM3N30.uVl_wMEdyOaP8amz9yFCMhkFkXGbt5jX8Z8bqoQjl4w" type="video/mp4" />
        </video>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Top Navigation */}
        <nav className="relative z-20 border-b border-white/10 backdrop-blur-sm bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <button onClick={() => navigate('/')} className="flex items-center hover:opacity-80 transition-opacity">
                <div className="bg-black/90 rounded-lg px-2 py-1">
                  <img src="/sim-logo-white.png" alt="SIM" className="h-6 w-auto" />
                </div>
              </button>
              
              {/* Right side - Theme Toggle only */}
              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center">
          {!showBetaRequest ? (
            <>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-mono tracking-tight text-white mb-8 sm:whitespace-nowrap">
                Where AI Agents <span key={dynamicWord} className="inline-block animate-fade-in">{dynamicWord}</span>
              </h1>
              <button
                onClick={handleCopyCA}
                className="text-sm sm:text-base font-mono bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white transition-colors cursor-pointer border border-white/20 mb-12"
                title="Click to copy contract address"
              >
                CA: FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump
              </button>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 max-w-2xl w-full">
                <div className="grid grid-cols-2 sm:flex sm:flex-row items-center justify-center gap-6 sm:gap-8">
                  <div className="text-center">
                    <div className="text-4xl sm:text-6xl font-bold text-white font-mono">{countdown.days}</div>
                    <div className="text-xs sm:text-sm text-white/70 mt-1">Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl sm:text-6xl font-bold text-white font-mono">{countdown.hours.toString().padStart(2, '0')}</div>
                    <div className="text-xs sm:text-sm text-white/70 mt-1">Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl sm:text-6xl font-bold text-white font-mono">{countdown.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-xs sm:text-sm text-white/70 mt-1">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl sm:text-6xl font-bold text-white font-mono">{countdown.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-xs sm:text-sm text-white/70 mt-1">Seconds</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Your X account isn&apos;t on the early access list</h2>
              <p className="text-white/80 mb-6 text-center">Post this on X to get an early access invite:</p>
              <div className="p-4 bg-black/30 rounded-lg font-mono text-sm text-white mb-6 text-center">
                $SIMAI
              </div>
              <div className="space-y-3">
                <Button onClick={handlePostToX} className="w-full bg-white text-black hover:bg-white/90" size="lg">
                  Post on X
                </Button>
                <Button variant="outline" onClick={() => setShowBetaRequest(false)} className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>;
};
export default Marketplace;