import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { AgentType } from "@/types/agent";
import { toast as sonnerToast } from "sonner";
import AuthModal from "@/components/AuthModal";
import { UnifiedAgentCreation } from "@/components/UnifiedAgentCreation";
import { CreateCABotModal } from "@/components/CreateCABotModal";
import pumpfunLogo from "@/assets/pumpfun-logo.png";
import xLogo from "@/assets/x-logo.png";
import { Search, TrendingUp, ChevronDown, Mail, Bot, Zap, Code, User, MessageCircle, LogOut, Plus, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/hooks/useTheme";
import { SimLeaderboard } from "@/components/SimLeaderboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimLikeButton } from "@/components/SimLikeButton";
import { HackathonAnnouncementModal } from "@/components/HackathonAnnouncementModal";
import { PendingAgentModal } from "@/components/PendingAgentModal";

interface PumpFunSimCardProps {
  sim: AgentType & { user_id?: string; like_count?: number; is_verified?: boolean };
  onSimClick: (sim: AgentType) => void;
  categories: Array<{ id: string; label: string; count: number }>;
}

const PumpFunSimCard = ({ sim, onSimClick, categories }: PumpFunSimCardProps) => {
  const [marketCapData, setMarketCapData] = useState<{ marketCap?: number } | null>(null);
  const [isLoadingMarketCap, setIsLoadingMarketCap] = useState(false);
  const [xProfileData, setXProfileData] = useState<any>(null);
  
  const simCategoryType = (sim as any).sim_category;
  const isPumpFunAgent = simCategoryType === 'PumpFun Agent';
  const isAutonomousAgent = simCategoryType === 'Autonomous Agent';
  const isCryptoMail = simCategoryType === 'Crypto Mail';
  const isVerified = (sim as any).is_verified || false;
  const marketplaceCategory = (sim as any).marketplace_category?.toLowerCase() || 'uncategorized';
  const categoryLabel = categories.find(c => c.id === marketplaceCategory)?.label || marketplaceCategory;
  
  const contractAddress = isPumpFunAgent 
    ? (sim.social_links as any)?.contract_address 
    : undefined;

  const xUsername = isCryptoMail 
    ? (sim.social_links as any)?.x_username 
    : undefined;

  // Approved X agents that are clickable
  const approvedXAgents = ['mrjethroknights', 'cryptodivix'];
  const isPending = isCryptoMail && !approvedXAgents.includes(xUsername?.toLowerCase() || '');

  useEffect(() => {
    const fetchMarketCap = async () => {
      if (!isPumpFunAgent || !contractAddress) return;
      
      setIsLoadingMarketCap(true);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-pumpfun-token', {
          body: { tokenAddress: contractAddress },
        });

        if (!error && data?.success && data?.tokenData) {
          setMarketCapData({ marketCap: data.tokenData.usd_market_cap });
        }
      } catch (error) {
        console.error('[PumpFunSimCard] Error fetching market cap:', error);
      } finally {
        setIsLoadingMarketCap(false);
      }
    };

    fetchMarketCap();
  }, [isPumpFunAgent, contractAddress]);

  // Fetch X profile data for Crypto Mail agents
  useEffect(() => {
    const fetchXProfile = async () => {
      if (!isCryptoMail || !xUsername) return;

      try {
        const { data, error } = await supabase.functions.invoke('x-intelligence', {
          body: { username: xUsername },
        });

        if (!error && data?.success && data?.report) {
          setXProfileData(data.report);
        }
      } catch (error) {
        console.error('[PumpFunSimCard] Error fetching X profile:', error);
      }
    };

    fetchXProfile();
  }, [isCryptoMail, xUsername]);

  const getAvatarSrc = () => {
    // For X agents (Crypto Mail), use X profile image with proxy
    if (isCryptoMail && xProfileData?.profileImageUrl) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(xProfileData.profileImageUrl)}`;
    }
    // For PumpFun agents with external URLs, proxy them
    const avatarUrl = getAvatarUrl(sim.avatar);
    if (avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}`;
    }
    // For local images, use the avatar URL directly
    return avatarUrl;
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };
  
  // Determine type badge
  let typeBadgeText = 'Chat';
  if (isAutonomousAgent) typeBadgeText = 'Autonomous Agent';
  else if (isCryptoMail) typeBadgeText = 'Crypto Mail';
  
  // Determine second badge - skip for PumpFun agents
  let secondBadgeText = '';
  if (!isPumpFunAgent) {
    if (isAutonomousAgent) {
      if (marketplaceCategory === 'uncategorized' || marketplaceCategory === 'daily brief' || !marketplaceCategory) {
        secondBadgeText = 'Daily Brief';
      } else {
        secondBadgeText = categoryLabel;
      }
    } else if (isCryptoMail) {
      secondBadgeText = isVerified ? 'Verified' : 'Unverified';
    } else {
      secondBadgeText = categoryLabel;
    }
  }

  return (
    <button
      onClick={() => !isPending && onSimClick(sim)}
      disabled={isPending}
      className={`group relative flex flex-col overflow-hidden rounded-lg bg-card hover:bg-muted border hover:border-[#83f1aa] transition-all duration-300 ${
        isPending ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 hover:shadow-md'
      }`}
    >
      {/* Image container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage 
            src={getAvatarSrc()}
            alt={sim.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
          <AvatarFallback className="w-full h-full rounded-none bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">
              {isCryptoMail ? '@' : (sim.name?.charAt(0)?.toUpperCase() || 'S')}
            </span>
          </AvatarFallback>
        </Avatar>
        {isPending && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge className="bg-yellow-500 text-black font-semibold px-2 py-0.5 text-xs">
              Pending
            </Badge>
          </div>
        )}
      </div>
      
      {/* Content section */}
      <div className="w-full p-1.5 space-y-1">
        <div className="flex items-center justify-center gap-0.5">
          <span className="text-[10px] font-semibold line-clamp-2 leading-tight block">
            {sim.name}
          </span>
          {(sim as any).is_verified && (
            <div className="group/verified relative flex-shrink-0">
              <img 
                src="/lovable-uploads/verified-badge.png" 
                alt="Verified"
                className="w-2.5 h-2.5"
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-popover text-popover-foreground text-[8px] rounded shadow-lg opacity-0 group-hover/verified:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border">
                This Sim has been verified through their X account.
              </div>
            </div>
          )}
        </div>
        
        {/* Badges */}
        <div className="flex flex-wrap gap-0.5 justify-center">
          <Badge 
            variant="outline" 
            className="text-[7px] px-0.5 py-0 bg-primary/10 border-primary/30 text-primary whitespace-nowrap leading-none h-3"
          >
            {typeBadgeText}
          </Badge>
          
          {isPumpFunAgent ? (
            <Badge 
              variant="outline" 
              className="text-[7px] px-0.5 py-0 flex items-center gap-0.5 leading-none h-3"
            >
              <img src={pumpfunLogo} alt="PumpFun" className="h-2 w-2" />
              Agent
            </Badge>
          ) : secondBadgeText && secondBadgeText !== 'uncategorized' && (
            <Badge 
              variant="outline" 
              className={`text-[7px] px-0.5 py-0 whitespace-nowrap leading-none h-3 ${
                isCryptoMail && isVerified 
                  ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
                  : isCryptoMail && !isVerified
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400'
                  : 'bg-muted/50 border-muted-foreground/20 text-muted-foreground'
              }`}
            >
              {secondBadgeText}
            </Badge>
          )}
        </div>

        {/* Market Cap for PumpFun agents */}
        {isPumpFunAgent && marketCapData?.marketCap && (
          <div className="pt-0.5 border-t border-border/50">
            <div className="flex items-center justify-center gap-0.5">
              <span className="text-[7px] text-muted-foreground">Market Cap:</span>
              <span className="text-[8px] font-semibold text-primary">
                {formatMarketCap(marketCapData.marketCap)}
              </span>
            </div>
          </div>
        )}
        {isPumpFunAgent && isLoadingMarketCap && (
          <div className="pt-0.5 border-t border-border/50">
            <div className="text-[7px] text-muted-foreground text-center">Loading...</div>
          </div>
        )}
      </div>
    </button>
  );
};

const AgentsDirectory = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateCABotModal, setShowCreateCABotModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'name'>('newest');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'x-agents': true,
    'pumpfun': true,
    'chat': true
  });
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [pendingAgentModal, setPendingAgentModal] = useState<{
    open: boolean;
    agentName: string;
    agentId: string;
    customUrl: string;
  }>({
    open: false,
    agentName: '',
    agentId: '',
    customUrl: ''
  });

  // Check for signin query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('signin') === 'true') {
      setAuthModalOpen(true);
      // Clean up the URL
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Check auth state without redirecting
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user's sim if signed in
  const { data: userSim } = useQuery({
    queryKey: ['user-sim', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        auto_description: data.auto_description,
        type: 'General Tutor' as const,
        status: 'active' as const,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        avatar: data.avatar_url,
        prompt: data.prompt,
        title: data.title,
        sim_type: data.sim_type as 'historical' | 'living',
        sim_category: data.sim_category,
        custom_url: data.custom_url,
        is_featured: false,
        is_official: data.is_official,
        model: 'GPT-4',
        interactions: 0,
        studentsSaved: 0,
        helpfulnessScore: 0,
        avmScore: 0,
        csat: 0,
        performance: 0,
        channels: [],
        channelConfigs: {},
        isPersonal: false,
        voiceTraits: [],
        social_links: data.social_links as any,
        background_image_url: data.background_image_url,
        crypto_wallet: data.crypto_wallet,
        x402_enabled: data.x402_enabled || false,
        x402_price: data.x402_price || 0,
        x402_wallet: data.x402_wallet
      } as AgentType;
    },
    enabled: !!currentUser
  });

  // Fetch all sims (both historical and living) with user count and like count
  const { data: allSims, isLoading } = useQuery({
    queryKey: ['all-sims-landing'],
    queryFn: async () => {
      // Get all advisors (excluding $GRUTA)
      const { data: advisorsData, error: advisorsError } = await supabase
        .from('advisors')
        .select('*')
        .eq('is_active', true)
        .neq('name', '$GRUTA');
      
      if (advisorsError) throw advisorsError;

      // Get user counts for each advisor
      const { data: userCounts, error: countsError } = await supabase
        .from('user_advisors')
        .select('advisor_id');
      
      if (countsError) throw countsError;

      // Get like counts for each advisor
      const { data: likeCounts, error: likesError } = await supabase
        .from('sim_likes')
        .select('sim_id');
      
      if (likesError) throw likesError;

      // Count how many times each advisor appears in user_advisors
      const countMap = new Map<string, number>();
      userCounts?.forEach(ua => {
        const count = countMap.get(ua.advisor_id) || 0;
        countMap.set(ua.advisor_id, count + 1);
      });

      // Count likes for each advisor
      const likesMap = new Map<string, number>();
      likeCounts?.forEach(like => {
        const count = likesMap.get(like.sim_id) || 0;
        likesMap.set(like.sim_id, count + 1);
      });
      
      return (advisorsData || []).map(sim => {
        const userCount = countMap.get(sim.id) || 0;
        const likeCount = likesMap.get(sim.id) || 0;
        
        return {
          id: sim.id,
          name: sim.name,
          description: sim.description || '',
          auto_description: sim.auto_description,
          type: 'General Tutor' as const,
          status: 'active' as const,
          createdAt: sim.created_at,
          updatedAt: sim.updated_at,
          avatar: sim.avatar_url,
          prompt: sim.prompt,
          welcome_message: sim.welcome_message,
          title: sim.title,
          sim_type: sim.sim_type as 'historical' | 'living',
          sim_category: sim.sim_category,
          custom_url: sim.custom_url,
          is_featured: false,
          is_official: sim.is_official,
          model: 'GPT-4',
          interactions: 0,
          studentsSaved: 0,
          helpfulnessScore: 0,
          avmScore: 0,
          csat: 0,
          performance: 0,
          channels: [],
          channelConfigs: {},
          isPersonal: false,
          voiceTraits: [],
          price: sim.price || 0,
          marketplace_category: sim.marketplace_category || (!sim.user_id ? 'historical' : 'uncategorized'),
          user_id: sim.user_id,
          user_count: userCount,
          like_count: likeCount,
          social_links: sim.social_links as any,
          background_image_url: sim.background_image_url,
          crypto_wallet: sim.crypto_wallet,
          x402_enabled: sim.x402_enabled || false,
          x402_price: sim.x402_price || 0,
          x402_wallet: sim.x402_wallet,
          is_verified: sim.is_verified || false,
          verification_status: sim.verification_status
        } as AgentType & { user_id?: string; marketplace_category?: string; user_count?: number; like_count?: number; is_verified?: boolean; verification_status?: string };
      });
    },
  });

  const categories = [
    { id: 'all', label: 'All Categories', count: 0 },
    { id: 'crypto', label: 'Crypto & Web3', count: 0 },
    { id: 'historical', label: 'Historical Figures', count: 0 },
    { id: 'influencers', label: 'Influencers & Celebrities', count: 0 },
    { id: 'fictional', label: 'Fictional Characters', count: 0 },
    { id: 'education', label: 'Education & Tutoring', count: 0 },
    { id: 'business', label: 'Business & Finance', count: 0 },
    { id: 'lifestyle', label: 'Lifestyle & Wellness', count: 0 },
    { id: 'entertainment', label: 'Entertainment & Games', count: 0 },
    { id: 'spiritual', label: 'Spiritual & Philosophy', count: 0 },
  ];

  // Apply filters and sorting
  const filteredSims = allSims
    ?.filter(sim => {
      const matchesSearch = !searchQuery ||
        sim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // Type filter
      const simCategory = (sim as any).sim_category;

      // Apply category filter for Chat type
      if (selectedCategory !== 'all') {
        const isChat = simCategory === 'Chat' || !simCategory || simCategory === '';
        if (isChat) {
          const marketplaceCategory = (sim as any).marketplace_category?.toLowerCase() || 'uncategorized';
          if (marketplaceCategory !== selectedCategory) return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        const aCount = (a as any).like_count || 0;
        const bCount = (b as any).like_count || 0;
        return bCount - aCount;
      } else if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  const categoryCounts = categories.map(cat => {
    if (cat.id === 'all') {
      return { ...cat, count: allSims?.length || 0 };
    }
    const count = allSims?.filter(sim => {
      const marketplaceCategory = (sim as any).marketplace_category?.toLowerCase() || 'uncategorized';
      return marketplaceCategory === cat.id;
    }).length || 0;
    return { ...cat, count };
  });

  // Group sims by category
  const xAgents = (filteredSims?.filter(sim => (sim as any).sim_category === 'Crypto Mail') || []).sort((a, b) => {
    // Sort: active agents first, then pending ones
    const approvedXAgents = ['mrjethroknights', 'cryptodivix'];
    const aUsername = (a.social_links as any)?.x_username?.toLowerCase() || '';
    const bUsername = (b.social_links as any)?.x_username?.toLowerCase() || '';
    const aIsActive = approvedXAgents.includes(aUsername);
    const bIsActive = approvedXAgents.includes(bUsername);
    
    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;
    
    // Among active agents, cryptodivix first, then mrjethroknights
    if (aIsActive && bIsActive) {
      if (aUsername === 'cryptodivix') return -1;
      if (bUsername === 'cryptodivix') return 1;
    }
    
    return 0;
  });
  const pumpfunAgents = filteredSims?.filter(sim => (sim as any).sim_category === 'PumpFun Agent') || [];
  const chatAgents = filteredSims?.filter(sim => {
    const simCategory = (sim as any).sim_category;
    return simCategory === 'Chat' || !simCategory || simCategory === '';
  }) || [];

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSimClick = (sim: AgentType) => {
    const verificationStatus = (sim as any).verification_status;
    const simSlug = (sim as any).custom_url || generateSlug(sim.name);
    
    console.log('Sim clicked:', sim.name, 'verification_status:', verificationStatus);
    
    // If agent is pending verification, show pending modal
    if (verificationStatus === 'pending') {
      console.log('Showing pending modal for agent:', sim.name);
      setPendingAgentModal({
        open: true,
        agentName: sim.name,
        agentId: sim.id,
        customUrl: simSlug
      });
      return;
    }
    
    console.log('Navigating to chat:', simSlug);
    window.scrollTo(0, 0);
    navigate(`/${simSlug}?chat=true`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex h-16 items-center justify-between gap-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10" />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      {/* Hackathon Announcement Modal */}
      <HackathonAnnouncementModal />
      
      {/* Integrated Header with Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left: Logo - navigates back to landing */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center hover:opacity-80 transition-opacity shrink-0"
            >
              <img 
                src={theme === "dark" ? "/sim-logo-dark.png" : "/sim-logo-light-final.png"}
                alt="Sim Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/sim-logo.png";
                }}
              />
            </button>

            {/* Center: Title */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-xl sm:text-2xl font-bold">Agent Directory</h1>
            </div>

            {/* Right: Theme Toggle + User Menu */}
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />

              {currentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                        <AvatarImage src={getAvatarUrl(currentUser?.user_metadata?.avatar_url)} />
                        <AvatarFallback>
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/home')}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      My Sims
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      await supabase.auth.signOut();
                      setCurrentUser(null);
                      navigate('/');
                    }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Sim Directory Section */}
        <section className="container mx-auto px-3 sm:px-4 py-8 flex-1">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">

            {/* Sort and Search - responsive layout */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Sort on same line */}
              <div className="flex gap-3">

                {/* Sort dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 h-12 px-4">
                      {sortBy === 'newest' && 'Newest'}
                      {sortBy === 'popular' && (
                        <>
                          <TrendingUp className="h-4 w-4" />
                          Popular
                        </>
                      )}
                      {sortBy === 'name' && 'A-Z'}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-background border-border z-50">
                    <DropdownMenuItem onClick={() => setSortBy('newest')} className="text-foreground hover:bg-muted">
                      Newest
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('popular')} className="text-foreground hover:bg-muted">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Popular
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('name')} className="text-foreground hover:bg-muted">
                      A-Z
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Search on separate line on mobile, same line on desktop */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sims by name, title, or description..."
                  className="pl-12 h-12 text-base border-input"
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgb(31, 41, 55)' : 'rgb(255, 255, 255)',
                    color: theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)'
                  }}
                />
              </div>
            </div>

            {/* Category Filters - for chat agents */}
            {(isMobile ? (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full h-12 bg-background">
                  <SelectValue placeholder="Select category">
                    <div className="flex items-center justify-between w-full">
                      <span>{categoryCounts.find(c => c.id === selectedCategory)?.label || 'All Categories'}</span>
                      <Badge variant="secondary" className="ml-2 px-1.5">
                        {categoryCounts.find(c => c.id === selectedCategory)?.count || 0}
                      </Badge>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-[100] max-h-[300px]">
                  {categoryCounts.map((cat) => (
                    <SelectItem 
                      key={cat.id} 
                      value={cat.id}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full gap-3">
                        <span>{cat.label}</span>
                        <Badge variant="secondary" className="px-1.5 shrink-0">
                          {cat.count}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categoryCounts.map((cat) => (
                  <Button
                    key={cat.id}
                    variant="outline"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`gap-1.5 h-8 text-xs sm:h-10 sm:text-sm sm:gap-2 ${
                      selectedCategory === cat.id 
                        ? 'border-[#83f1aa] hover:bg-[#83f1aa]/90' 
                        : ''
                    }`}
                    style={selectedCategory === cat.id ? { backgroundColor: '#83f1aa', color: '#000' } : {}}
                  >
                    <span className="whitespace-nowrap">{cat.label}</span>
                    <Badge 
                      variant="outline"
                      className={`px-1 text-[10px] sm:px-1.5 sm:text-xs ${
                        selectedCategory === cat.id 
                          ? 'bg-white text-black border-white' 
                          : 'bg-transparent text-gray-500 border-gray-300'
                      }`}
                    >
                      {cat.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            ))}
          </div>

          {/* Categorized Sims */}
          <div className="space-y-8">
            {/* X Agents Section */}
            {xAgents.length > 0 && (
              <div>
                <button
                  onClick={() => toggleCategory('x-agents')}
                  className="flex items-center gap-2 mb-4 group"
                >
                  <ChevronRight 
                    className={`h-5 w-5 transition-transform ${expandedCategories['x-agents'] ? 'rotate-90' : ''}`}
                  />
                  <div className="flex items-center gap-2">
                    <img src={xLogo} alt="X" className="h-5 w-5" />
                    <h2 className="text-xl font-bold">X Agents</h2>
                    <Badge variant="secondary">{xAgents.length}</Badge>
                  </div>
                </button>
                {expandedCategories['x-agents'] && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {xAgents.slice(0, expandedCategories['x-agents'] === true ? 10 : xAgents.length).map((sim) => (
                        <PumpFunSimCard
                          key={sim.id}
                          sim={sim}
                          onSimClick={handleSimClick}
                          categories={categories}
                        />
                      ))}
                    </div>
                    {xAgents.length > 10 && expandedCategories['x-agents'] === true && (
                      <Button
                        variant="outline"
                        onClick={() => setExpandedCategories(prev => ({ ...prev, 'x-agents': 'all' as any }))}
                        className="mt-4 w-full"
                      >
                        Show All ({xAgents.length - 10} more)
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* PumpFun Agents Section */}
            {pumpfunAgents.length > 0 && (
              <div>
                <button
                  onClick={() => toggleCategory('pumpfun')}
                  className="flex items-center gap-2 mb-4 group"
                >
                  <ChevronRight 
                    className={`h-5 w-5 transition-transform ${expandedCategories['pumpfun'] ? 'rotate-90' : ''}`}
                  />
                  <div className="flex items-center gap-2">
                    <img src={pumpfunLogo} alt="PumpFun" className="h-5 w-5" />
                    <h2 className="text-xl font-bold">PumpFun Agents</h2>
                    <Badge variant="secondary">{pumpfunAgents.length}</Badge>
                  </div>
                </button>
                {expandedCategories['pumpfun'] && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {pumpfunAgents.slice(0, expandedCategories['pumpfun'] === true ? 10 : pumpfunAgents.length).map((sim) => (
                        <PumpFunSimCard
                          key={sim.id}
                          sim={sim}
                          onSimClick={handleSimClick}
                          categories={categories}
                        />
                      ))}
                    </div>
                    {pumpfunAgents.length > 10 && expandedCategories['pumpfun'] === true && (
                      <Button
                        variant="outline"
                        onClick={() => setExpandedCategories(prev => ({ ...prev, 'pumpfun': 'all' as any }))}
                        className="mt-4 w-full"
                      >
                        Show All ({pumpfunAgents.length - 10} more)
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Chat Agents Section */}
            {chatAgents.length > 0 && (
              <div>
                <button
                  onClick={() => toggleCategory('chat')}
                  className="flex items-center gap-2 mb-4 group"
                >
                  <ChevronRight 
                    className={`h-5 w-5 transition-transform ${expandedCategories['chat'] ? 'rotate-90' : ''}`}
                  />
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <h2 className="text-xl font-bold">Chat Agents</h2>
                    <Badge variant="secondary">{chatAgents.length}</Badge>
                  </div>
                </button>
                {expandedCategories['chat'] && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {chatAgents.slice(0, expandedCategories['chat'] === true ? 10 : chatAgents.length).map((sim) => (
                        <PumpFunSimCard
                          key={sim.id}
                          sim={sim}
                          onSimClick={handleSimClick}
                          categories={categories}
                        />
                      ))}
                    </div>
                    {chatAgents.length > 10 && expandedCategories['chat'] === true && (
                      <Button
                        variant="outline"
                        onClick={() => setExpandedCategories(prev => ({ ...prev, 'chat': 'all' as any }))}
                        className="mt-4 w-full"
                      >
                        Show All ({chatAgents.length - 10} more)
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}

            {xAgents.length === 0 && pumpfunAgents.length === 0 && chatAgents.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-lg mb-2">No agents found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search query</p>
              </Card>
            )}
          </div>
        </div>
      </section>
      </div>

      <AuthModal
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />

      {showCreateModal && (
        <UnifiedAgentCreation
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={async (createdAgent) => {
            if (currentUser) {
              await queryClient.invalidateQueries({ queryKey: ['user-sims', currentUser.id] });
              await queryClient.invalidateQueries({ queryKey: ['all-sims-landing'] });
            }
            if (createdAgent?.custom_url) {
              navigate(`/${createdAgent.custom_url}?chat=true`);
            } else if (createdAgent?.name) {
              const slug = createdAgent.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
              navigate(`/${slug}?chat=true`);
            }
          }}
        />
      )}

      {showCreateCABotModal && (
        <CreateCABotModal
          open={showCreateCABotModal}
          onOpenChange={setShowCreateCABotModal}
          onSuccess={async (createdAgent) => {
            if (currentUser) {
              await queryClient.invalidateQueries({ queryKey: ['user-sims', currentUser.id] });
              await queryClient.invalidateQueries({ queryKey: ['all-sims-landing'] });
            }
            if (createdAgent?.custom_url) {
              navigate(`/${createdAgent.custom_url}?chat=true`);
            } else if (createdAgent?.name) {
              const slug = createdAgent.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
              navigate(`/${slug}?chat=true`);
            }
          }}
        />
      )}

      <Button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 h-14 px-6 gap-2 font-semibold text-base transition-all duration-300 bg-[#82f3aa] hover:bg-[#6dd991] text-black border-0 rounded-lg shadow-lg hover:shadow-xl z-50"
      >
        <Plus className="h-4 w-4" />
        Create Agent
      </Button>

      <PendingAgentModal
        open={pendingAgentModal.open}
        onOpenChange={(open) => setPendingAgentModal(prev => ({ ...prev, open }))}
        agentName={pendingAgentModal.agentName}
        agentId={pendingAgentModal.agentId}
        customUrl={pendingAgentModal.customUrl}
      />

      <LandingFooter />
    </div>
  );
};

export default AgentsDirectory;
