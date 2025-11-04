import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Award, Menu, TrendingUp, DollarSign, Gift, Mail, Bot, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AgentType } from '@/types/agent';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarUrl } from '@/lib/avatarUtils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import pumpLogo from '@/assets/pumpfun-logo.png';
import AuthModal from '@/components/AuthModal';
import { PendingAgentModal } from '@/components/PendingAgentModal';

type FilterType = 'all' | 'free' | 'paid';
type SortType = 'popular' | 'newest' | 'name';

interface PumpFunSimCardProps {
  sim: AgentType & { user_id?: string; user_count?: number; is_verified?: boolean };
  onSimClick: (sim: AgentType) => void;
  categories: typeof categories;
}

const PumpFunSimCard = ({ sim, onSimClick, categories }: PumpFunSimCardProps) => {
  const [marketCapData, setMarketCapData] = useState<{ marketCap?: number } | null>(null);
  const [isLoadingMarketCap, setIsLoadingMarketCap] = useState(false);
  
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
      onClick={() => onSimClick(sim)}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-card hover:bg-muted border-2 hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      {/* Image container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage 
            src={getAvatarUrl(sim.avatar)} 
            alt={sim.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <AvatarFallback className="w-full h-full rounded-none bg-primary/10 flex items-center justify-center">
            <span className="text-5xl font-bold text-primary">
              {isCryptoMail ? '@' : (sim.name?.charAt(0)?.toUpperCase() || 'S')}
            </span>
          </AvatarFallback>
        </Avatar>
      </div>
      
      {/* Content section */}
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
        
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          <Badge 
            variant="secondary" 
            className="text-[10px] px-1.5 py-0.5 h-5"
          >
            {typeBadgeText}
          </Badge>
          
          {isPumpFunAgent ? (
            <Badge 
              variant="outline" 
              className="text-[10px] px-1.5 py-0.5 h-5 flex items-center gap-1"
            >
              <img src={pumpLogo} alt="PumpFun" className="h-3 w-3" />
              Agent
            </Badge>
          ) : secondBadgeText && (
            <Badge 
              variant="outline" 
              className="text-[10px] px-1.5 py-0.5 h-5 capitalize"
            >
              {secondBadgeText}
            </Badge>
          )}
        </div>

        {/* Market Cap for PumpFun agents */}
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
  { id: 'adult', label: 'Adult', count: 0 },
];

const SimDirectory = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<FilterType>('all');
  const [simTypeFilter, setSimTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [authModalOpen, setAuthModalOpen] = useState(false);
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

  const { data: allSims, isLoading } = useQuery({
    queryKey: ['all-sims-directory'],
    queryFn: async () => {
      // Get all advisors - exclude edit_code for security
      const { data: advisorsData, error: advisorsError } = await supabase
        .from('advisors')
        .select('id, name, title, description, prompt, sim_category, x402_wallet, auto_description, full_description, avatar_url, response_length, conversation_style, personality_type, website_url, created_at, updated_at, is_verified, verification_status, date_of_birth, years_experience, interests, skills, sample_scenarios, completion_status, is_public, user_id, is_active, is_official, price, integrations, social_links, x402_price, x402_enabled, expertise_areas, target_audience, background_image_url, marketplace_category, background_content, knowledge_summary, url, full_name, professional_title, location, crypto_wallet, twitter_url, sim_type, owner_welcome_message, education, current_profession, areas_of_expertise, writing_sample, additional_background, custom_url, welcome_message')
        .eq('is_active', true)
        .neq('verification_status', 'pending');
      
      if (advisorsError) throw advisorsError;

      // Get user counts for each advisor
      const { data: userCounts, error: countsError } = await supabase
        .from('user_advisors')
        .select('advisor_id');
      
      if (countsError) throw countsError;

      // Count how many times each advisor appears in user_advisors
      const countMap = new Map<string, number>();
      userCounts?.forEach(ua => {
        const count = countMap.get(ua.advisor_id) || 0;
        countMap.set(ua.advisor_id, count + 1);
      });
      
      return (advisorsData || []).map(sim => {
        const userCount = countMap.get(sim.id) || 0;
        
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
        social_links: sim.social_links as any,
        background_image_url: sim.background_image_url,
        crypto_wallet: sim.crypto_wallet,
        x402_enabled: sim.x402_enabled || false,
        x402_price: sim.x402_price || 0,
        x402_wallet: sim.x402_wallet,
        is_verified: sim.is_verified || false,
        verification_status: (sim as any).verification_status
      } as AgentType & { user_id?: string; user_count?: number; is_verified?: boolean; verification_status?: string };
      });
    },
  });

  // Apply filters and sorting
  const filteredSims = allSims
    ?.filter(sim => {
      // Search filter
      const matchesSearch = 
        sim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // Price filter
      if (priceFilter === 'free' && sim.price && sim.price > 0) return false;
      if (priceFilter === 'paid' && (!sim.price || sim.price === 0)) return false;

      // Type filter
      const simCategory = (sim as any).sim_category;
      
      // Hide all Crypto Mail agents except @mrjethroknights
      if (simCategory === 'Crypto Mail') {
        const xUsername = (sim.social_links as any)?.x_username;
        if (xUsername?.toLowerCase() !== 'mrjethroknights') return false;
      }
      
      if (simTypeFilter !== 'all') {
        if (simTypeFilter === 'Crypto Mail' && simCategory !== 'Crypto Mail') return false;
        if (simTypeFilter === 'Chat' && simCategory !== 'Chat' && simCategory) return false;
        if (simTypeFilter === 'Autonomous Agent' && simCategory !== 'Autonomous Agent') return false;
      }

      // Category filter (only applies to Chat type)
      if (simTypeFilter === 'Chat' && selectedCategory !== 'all') {
        const marketplaceCategory = (sim as any).marketplace_category?.toLowerCase() || 'uncategorized';
        if (marketplaceCategory !== selectedCategory) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        const aCount = (a as any).user_count || 0;
        const bCount = (b as any).user_count || 0;
        return bCount - aCount;
      } else if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  // Calculate category counts - show immediately even while loading
  const categoryCounts = categories.map(cat => {
    if (cat.id === 'all') {
      return { ...cat, count: allSims?.length || 0 };
    }
    const count = allSims?.filter(sim => {
      const simCategory = (sim as any).marketplace_category?.toLowerCase() || 'uncategorized';
      return simCategory === cat.id;
    }).length || 0;
    return { ...cat, count };
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSimClick = (sim: AgentType) => {
    const verificationStatus = (sim as any).verification_status;
    const simSlug = (sim as any).custom_url || generateSlug(sim.name);
    
    // If agent is pending verification, show pending modal
    if (verificationStatus === 'pending') {
      setPendingAgentModal({
        open: true,
        agentName: sim.name,
        agentId: sim.id,
        customUrl: simSlug
      });
      return;
    }
    
    navigate(`/${simSlug}?chat=true`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header with Menu */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
          <div className="flex items-center justify-between p-3">
            <SidebarTrigger className="h-10 w-10">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <button 
              onClick={() => navigate('/home')}
              className="hover:opacity-80 transition-opacity"
            >
              <img 
                src="/sim-logo.png" 
                alt="Sim Logo" 
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </button>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className={`h-full p-8 ${isMobile ? 'pt-[73px]' : ''}`}>
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
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

          {/* Filters */}
          <div className="mb-6 space-y-4">
            {/* Type Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <Tabs value={simTypeFilter} onValueChange={(v) => {
                setSimTypeFilter(v as any);
                if (v !== 'Chat') setSelectedCategory('all');
              }}>
                <TabsList>
                  <TabsTrigger value="all">All Types</TabsTrigger>
                  <TabsTrigger value="Crypto Mail" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Crypto Mail
                  </TabsTrigger>
                  <TabsTrigger value="Chat" className="gap-2">
                    <Bot className="h-4 w-4" />
                    Chatbots
                  </TabsTrigger>
                  <TabsTrigger value="Autonomous Agent" className="gap-2">
                    <Zap className="h-4 w-4" />
                    Autonomous Agent
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Price & Sort Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
              <Tabs value={priceFilter} onValueChange={(v) => setPriceFilter(v as FilterType)} className="w-full sm:w-auto">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="all" className="gap-2 flex-1 sm:flex-none">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="free" className="gap-2 flex-1 sm:flex-none">
                    <Gift className="h-4 w-4" />
                    Free
                  </TabsTrigger>
                  <TabsTrigger value="paid" className="gap-2 flex-1 sm:flex-none">
                    <DollarSign className="h-4 w-4" />
                    Paid
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="hidden sm:block h-8 w-px bg-border" />

              <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as SortType)} className="w-full sm:w-auto">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="newest" className="flex-1 sm:flex-none">
                    Newest
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="gap-2 flex-1 sm:flex-none">
                    <TrendingUp className="h-4 w-4" />
                    Popular
                  </TabsTrigger>
                  <TabsTrigger value="name" className="flex-1 sm:flex-none">
                    A-Z
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Category Filters - only show when Chatbots is selected */}
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
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className="gap-2"
                  >
                    {cat.label}
                    <Badge variant="secondary" className="ml-1 px-1.5">
                      {cat.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            ))}
          </div>

          {/* Sims Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex flex-col overflow-hidden rounded-2xl bg-card border-2">
                  <div className="w-full aspect-[4/3] bg-muted animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4 mx-auto" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredSims?.map((sim) => (
              <PumpFunSimCard 
                key={sim.id}
                sim={sim}
                onSimClick={handleSimClick}
                categories={categories}
              />
            ))}
            </div>
          )}

          {!isLoading && filteredSims?.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg mb-2">No sims found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
            </Card>
          )}
        </div>
      </div>

      <AuthModal
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />
      
      <PendingAgentModal
        open={pendingAgentModal.open}
        onOpenChange={(open) => setPendingAgentModal(prev => ({ ...prev, open }))}
        agentName={pendingAgentModal.agentName}
        agentId={pendingAgentModal.agentId}
        customUrl={pendingAgentModal.customUrl}
      />
    </div>
  );
};

export default SimDirectory;
