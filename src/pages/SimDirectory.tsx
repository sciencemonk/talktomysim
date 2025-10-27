import { useState } from 'react';
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
import SimDetailModal from '@/components/SimDetailModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

type FilterType = 'all' | 'free' | 'paid';
type SortType = 'popular' | 'newest' | 'name';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSim, setSelectedSim] = useState<AgentType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState<FilterType>('all');
  const [simTypeFilter, setSimTypeFilter] = useState<'all' | 'Crypto Mail' | 'Chat' | 'Autonomous Agent'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { data: allSims, isLoading } = useQuery({
    queryKey: ['all-sims-directory'],
    queryFn: async () => {
      // Get all advisors
      const { data: advisorsData, error: advisorsError } = await supabase
        .from('advisors')
        .select('*')
        .eq('is_active', true);
      
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
        is_verified: sim.is_verified || false
      } as AgentType & { user_id?: string; user_count?: number; is_verified?: boolean };
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

  const handleSimClick = (sim: AgentType) => {
    setSelectedSim(sim);
    setIsModalOpen(true);
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
            <div className="flex flex-wrap gap-3 items-center">
              <Tabs value={priceFilter} onValueChange={(v) => setPriceFilter(v as FilterType)}>
                <TabsList>
                  <TabsTrigger value="all" className="gap-2">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="free" className="gap-2">
                    <Gift className="h-4 w-4" />
                    Free
                  </TabsTrigger>
                  <TabsTrigger value="paid" className="gap-2">
                    <DollarSign className="h-4 w-4" />
                    Paid
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="h-8 w-px bg-border" />

              <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
                <TabsList>
                  <TabsTrigger value="newest">
                    Newest
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Popular
                  </TabsTrigger>
                  <TabsTrigger value="name">
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
            {filteredSims?.map((sim) => {
              const simCategoryType = (sim as any).sim_category;
              const isAutonomousAgent = simCategoryType === 'Autonomous Agent';
              const isCryptoMail = simCategoryType === 'Crypto Mail';
              const isVerified = (sim as any).is_verified || false;
              const marketplaceCategory = (sim as any).marketplace_category?.toLowerCase() || 'uncategorized';
              const categoryLabel = categories.find(c => c.id === marketplaceCategory)?.label || marketplaceCategory;
              
              // Determine type badge
              let typeBadgeText = 'Chat';
              if (isAutonomousAgent) typeBadgeText = 'Autonomous Agent';
              else if (isCryptoMail) typeBadgeText = 'Crypto Mail';
              
              // Determine second badge
              let secondBadgeText = '';
              if (isAutonomousAgent) {
                secondBadgeText = marketplaceCategory === 'uncategorized' ? 'Daily Brief' : categoryLabel;
              } else if (isCryptoMail) {
                secondBadgeText = isVerified ? 'Verified' : 'Unverified';
              } else {
                secondBadgeText = categoryLabel;
              }
              
              return (
                <button
                  key={sim.id}
                  onClick={() => handleSimClick(sim)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-card hover:bg-muted border-2 hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  {/* Image container - fills top portion */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
                    {sim.avatar ? (
                      <img
                        src={getAvatarUrl(sim.avatar)} 
                        alt={sim.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="text-5xl font-bold text-primary">
                          {sim.name?.charAt(0)?.toUpperCase() || 'S'}
                        </span>
                      </div>
                    )}
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
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg opacity-0 group-hover/verified:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border">
                            This Sim has been verified through their X account.
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Type and Category badges */}
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-primary/10 border-primary/30 text-primary whitespace-nowrap">
                        {typeBadgeText}
                      </Badge>
                      {secondBadgeText !== 'uncategorized' && (
                        <Badge 
                          variant="outline" 
                          className={`text-[9px] px-1.5 py-0 whitespace-nowrap ${
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
                  </div>
                </button>
              );
            })}
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

      {/* Sim Detail Modal */}
      <SimDetailModal
        sim={selectedSim}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default SimDirectory;
