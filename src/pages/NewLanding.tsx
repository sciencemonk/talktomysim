import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MatrixHeroSection } from "@/components/landing/MatrixHeroSection";
import AuthModal from "@/components/AuthModal";
import { UnifiedAgentCreation } from "@/components/UnifiedAgentCreation";
import { AgentType } from "@/types/agent";
import { HackathonAnnouncementModal } from "@/components/HackathonAnnouncementModal";
import { ScrollingSimsRows } from "@/components/landing/ScrollingSimsRows";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { ChevronRight, Bot, Search, TrendingUp, ChevronDown, Mail, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import pumpfunLogo from "@/assets/pumpfun-logo.png";
import xLogo from "@/assets/x-logo.png";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/hooks/useTheme";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PumpFunSimCardProps {
  sim: AgentType & { user_id?: string; like_count?: number; is_verified?: boolean };
  onSimClick: (sim: AgentType) => void;
}

const PumpFunSimCard = ({ sim, onSimClick }: PumpFunSimCardProps) => {
  const [marketCapData, setMarketCapData] = useState<{ marketCap?: number } | null>(null);
  const [isLoadingMarketCap, setIsLoadingMarketCap] = useState(false);
  const [xProfileData, setXProfileData] = useState<any>(null);
  
  const simCategoryType = (sim as any).sim_category;
  const isPumpFunAgent = simCategoryType === 'PumpFun Agent';
  const isCryptoMail = simCategoryType === 'Crypto Mail';
  const isVerified = (sim as any).is_verified || false;
  
  const contractAddress = isPumpFunAgent 
    ? (sim.social_links as any)?.contract_address 
    : undefined;

  const xUsername = isCryptoMail 
    ? (sim.social_links as any)?.x_username 
    : undefined;

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

  const formatMarketCap = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };
  
  let typeBadgeText = 'Chat';
  if (simCategoryType === 'Autonomous Agent') typeBadgeText = 'Autonomous Agent';
  else if (isCryptoMail) typeBadgeText = 'Crypto Mail';

  return (
    <button
      onClick={() => onSimClick(sim)}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-card hover:bg-muted border-2 hover:border-[#83f1aa] transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage 
            src={xProfileData?.profileImageUrl ? `https://images.weserv.nl/?url=${encodeURIComponent(xProfileData.profileImageUrl)}` : getAvatarUrl(sim.avatar)}
            alt={sim.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
          <AvatarFallback className="w-full h-full rounded-none bg-primary/10 flex items-center justify-center">
            <span className="text-5xl font-bold text-primary">
              {isCryptoMail ? '@' : (sim.name?.charAt(0)?.toUpperCase() || 'S')}
            </span>
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="w-full p-3 space-y-2">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-sm font-semibold line-clamp-2 leading-tight block">
            {sim.name}
          </span>
          {(sim as any).is_verified && (
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
            className="text-[9px] px-1.5 py-0 bg-primary/10 border-primary/30 text-primary whitespace-nowrap"
          >
            {typeBadgeText}
          </Badge>
          
          {isPumpFunAgent && (
            <Badge 
              variant="outline" 
              className="text-[9px] px-1.5 py-0 flex items-center gap-0.5"
            >
              <img src={pumpfunLogo} alt="PumpFun" className="h-3 w-3" />
              Agent
            </Badge>
          )}
        </div>

        {isPumpFunAgent && marketCapData?.marketCap && (
          <div className="pt-1 border-t border-border/50">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">Market Cap:</span>
              <span className="text-xs font-semibold text-primary">
                {formatMarketCap(marketCapData.marketCap)}
              </span>
            </div>
          </div>
        )}
        {isPumpFunAgent && isLoadingMarketCap && (
          <div className="pt-1 border-t border-border/50">
            <div className="text-[10px] text-muted-foreground text-center">Loading...</div>
          </div>
        )}
      </div>
    </button>
  );
};

const NewLanding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'x-agents': true,
    'pumpfun': true,
    'chat': true
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [simTypeFilter, setSimTypeFilter] = useState<'all' | 'Crypto Mail' | 'Chat' | 'PumpFun Agent'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'name'>('newest');
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  const scrollToAgents = () => {
    const agentsSection = document.getElementById('agents-section');
    if (agentsSection) {
      agentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Check for scrollToAgents state from navigation
  useEffect(() => {
    if (location.state?.scrollToAgents) {
      setTimeout(() => {
        scrollToAgents();
      }, 100);
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Check for create query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const createType = params.get('create');
    
    if (createType) {
      setShowCreateModal(true);
      // Clean up URL
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSimClick = (sim: AgentType) => {
    const simSlug = (sim as any).custom_url || generateSlug(sim.name);
    navigate(`/${simSlug}?chat=true`);
  };

  // Fetch all sims
  const { data: allSims } = useQuery({
    queryKey: ['all-sims-landing'],
    queryFn: async () => {
      const { data: advisorsData, error: advisorsError } = await supabase
        .from('advisors')
        .select('*')
        .eq('is_active', true)
        .neq('name', '$GRUTA');
      
      if (advisorsError) throw advisorsError;

      const { data: likeCounts, error: likesError } = await supabase
        .from('sim_likes')
        .select('sim_id');
      
      if (likesError) throw likesError;

      const likesMap = new Map<string, number>();
      likeCounts?.forEach(like => {
        const count = likesMap.get(like.sim_id) || 0;
        likesMap.set(like.sim_id, count + 1);
      });
      
      return (advisorsData || []).map(sim => {
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
          like_count: likeCount,
          social_links: sim.social_links as any,
          background_image_url: sim.background_image_url,
          crypto_wallet: sim.crypto_wallet,
          x402_enabled: sim.x402_enabled || false,
          x402_price: sim.x402_price || 0,
          x402_wallet: sim.x402_wallet,
          is_verified: sim.is_verified || false
        } as AgentType & { user_id?: string; marketplace_category?: string; like_count?: number; is_verified?: boolean };
      });
    },
  });

  // Filter and categorize sims
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

  const filteredSims = allSims
    ?.filter(sim => {
      const matchesSearch = !searchQuery ||
        sim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      const simCategory = (sim as any).sim_category;
      
      // Hide all Crypto Mail agents except @mrjethroknights
      if (simCategory === 'Crypto Mail') {
        const xUsername = (sim.social_links as any)?.x_username;
        if (xUsername?.toLowerCase() !== 'mrjethroknights') return false;
      }

      // Type filter
      if (simTypeFilter !== 'all') {
        if (simTypeFilter === 'Crypto Mail' && simCategory !== 'Crypto Mail') return false;
        if (simTypeFilter === 'PumpFun Agent' && simCategory !== 'PumpFun Agent') return false;
        if (simTypeFilter === 'Chat') {
          const isChat = simCategory === 'Chat' || !simCategory || simCategory === '';
          if (!isChat) return false;
        }
      }

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

  const xAgents = filteredSims?.filter(sim => {
    const simCategory = (sim as any).sim_category;
    if (simCategory === 'Crypto Mail') {
      const xUsername = (sim.social_links as any)?.x_username;
      return xUsername?.toLowerCase() === 'mrjethroknights';
    }
    return false;
  }) || [];

  const pumpfunAgents = filteredSims?.filter(sim => (sim as any).sim_category === 'PumpFun Agent') || [];

  const chatAgents = filteredSims?.filter(sim => {
    const simCategory = (sim as any).sim_category;
    return simCategory === 'Chat' || !simCategory || simCategory === '';
  }) || [];

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <HackathonAnnouncementModal />
      
      <div className="flex-1 overflow-hidden">
        <MatrixHeroSection 
          onCreateAgent={() => setShowCreateModal(true)} 
          onSimClick={handleSimClick}
          onViewAllAgents={scrollToAgents}
        />
      </div>

      <ScrollingSimsRows onSimClick={handleSimClick} />

      {/* Search and Filters Section */}
      <section id="agents-section" className="container mx-auto px-3 sm:px-4 py-8 border-b scroll-mt-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Type Filters */}
          <div className="flex justify-center">
            {isMobile ? (
              <Select value={simTypeFilter} onValueChange={(v) => {
                setSimTypeFilter(v as any);
                if (v !== 'Chat') setSelectedCategory('all');
              }}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-[100]">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Chat">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      Chat
                    </div>
                  </SelectItem>
                  <SelectItem value="PumpFun Agent">
                    <div className="flex items-center gap-2">
                      <img src={pumpfunLogo} alt="PumpFun" className="h-4 w-4" />
                      PumpFun
                    </div>
                  </SelectItem>
                  <SelectItem value="Crypto Mail">
                    <div className="flex items-center gap-2">
                      <img src={xLogo} alt="X" className="h-4 w-4" />
                      X Agents
                    </div>
                  </SelectItem>
                  <SelectItem value="Autonomous Agent" disabled>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Assistants
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 ml-2">
                        Coming Soon
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="bookie" disabled>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Bookie
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 ml-2">
                        Coming Soon
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="email" disabled>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 ml-2">
                        Coming Soon
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Tabs value={simTypeFilter} onValueChange={(v) => {
                setSimTypeFilter(v as any);
                if (v !== 'Chat') setSelectedCategory('all');
              }}>
                <TabsList>
                  <TabsTrigger value="all">All Types</TabsTrigger>
                  <TabsTrigger value="Chat" className="gap-2">
                    <Bot className="h-4 w-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="PumpFun Agent" className="gap-2">
                    <img src={pumpfunLogo} alt="PumpFun" className="h-4 w-4" />
                    PumpFun
                  </TabsTrigger>
                  <TabsTrigger value="Crypto Mail" className="gap-2">
                    <img src={xLogo} alt="X" className="h-4 w-4" />
                    X Agents
                  </TabsTrigger>
                  <TabsTrigger value="Autonomous Agent" disabled className="gap-2 opacity-50 cursor-not-allowed">
                    <Zap className="h-4 w-4" />
                    Assistants
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 ml-1">
                      Coming Soon
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="bookie" disabled className="gap-2 opacity-50 cursor-not-allowed">
                    <TrendingUp className="h-4 w-4" />
                    Bookie
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 ml-1">
                      Coming Soon
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="email" disabled className="gap-2 opacity-50 cursor-not-allowed">
                    <Mail className="h-4 w-4" />
                    Email
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 ml-1">
                      Coming Soon
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
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
            
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents by name, title, or description..."
                className="pl-12 h-12 text-base border-input"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgb(31, 41, 55)' : 'rgb(255, 255, 255)',
                  color: theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)'
                }}
              />
            </div>
          </div>

          {/* Category Filters - for chat agents */}
          {simTypeFilter === 'Chat' && (isMobile ? (
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
      </section>

      {/* Agent Directory Section */}
      <section className="container mx-auto px-3 sm:px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
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
        </div>
      </section>
      
      <LandingFooter />

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />

      <UnifiedAgentCreation
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default NewLanding;
