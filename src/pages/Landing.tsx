import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import SimpleFooter from "@/components/SimpleFooter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { AgentType } from "@/types/agent";
import { toast as sonnerToast } from "sonner";
import AuthModal from "@/components/AuthModal";
import { CreateSimModal } from "@/components/CreateSimModal";
import { CreateCABotModal } from "@/components/CreateCABotModal";
import pumpfunLogo from "@/assets/pumpfun-logo.png";
import { Search, TrendingUp, ChevronDown, Mail, Bot, Zap, Code, User, MessageCircle, LogOut, Plus } from "lucide-react";
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
import SimDetailModal from "@/components/SimDetailModal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/hooks/useTheme";
import { SimLeaderboard } from "@/components/SimLeaderboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimLikeButton } from "@/components/SimLikeButton";
import { HackathonAnnouncementModal } from "@/components/HackathonAnnouncementModal";

const Landing = () => {
  const navigate = useNavigate();
  const [selectedSim, setSelectedSim] = useState<AgentType | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [showCreateSimModal, setShowCreateSimModal] = useState(false);
  const [showCreateCABotModal, setShowCreateCABotModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [simTypeFilter, setSimTypeFilter] = useState<'all' | 'Crypto Mail' | 'Chat' | 'Autonomous Agent' | 'x402 API'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'name'>('newest');
  const isMobile = useIsMobile();
  const { theme } = useTheme();

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
  const { data: allSims } = useQuery({
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
          is_verified: sim.is_verified || false
        } as AgentType & { user_id?: string; marketplace_category?: string; user_count?: number; like_count?: number; is_verified?: boolean };
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
      if (simTypeFilter !== 'all') {
        if (simTypeFilter === 'Crypto Mail' && simCategory !== 'Crypto Mail') return false;
        if (simTypeFilter === 'Chat') {
          const isChat = simCategory === 'Chat' || !simCategory || simCategory === '';
          if (!isChat) return false;
          
          // Apply category filter for Chat type
          if (selectedCategory !== 'all') {
            const marketplaceCategory = (sim as any).marketplace_category?.toLowerCase() || 'uncategorized';
            if (marketplaceCategory !== selectedCategory) return false;
          }
        }
        if (simTypeFilter === 'Autonomous Agent' && simCategory !== 'Autonomous Agent') return false;
        if (simTypeFilter === 'x402 API') return false; // Coming soon
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

  const handleSimClick = (sim: AgentType) => {
    // Always open the detail modal for both signed-in and signed-out users
    setSelectedSim(sim);
    setIsSimModalOpen(true);
  };


  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      {/* Hackathon Announcement Modal */}
      <HackathonAnnouncementModal />
      
      {/* Integrated Header with Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left: Logo */}
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

            {/* Center: Type Filters */}
            <div className="flex-1 flex justify-center max-w-3xl mx-4">
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
                    <SelectItem value="Autonomous Agent">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Autonomous Agents
                      </div>
                    </SelectItem>
                    <SelectItem value="Chat">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        Chatbots
                      </div>
                    </SelectItem>
                    <SelectItem value="Crypto Mail">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Crypto Mail
                      </div>
                    </SelectItem>
                    <SelectItem value="x402 API" disabled>
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        x402 API
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
                    <TabsTrigger value="Autonomous Agent" className="gap-2">
                      <Zap className="h-4 w-4" />
                      Autonomous Agents
                    </TabsTrigger>
                    <TabsTrigger value="Chat" className="gap-2">
                      <Bot className="h-4 w-4" />
                      Chatbots
                    </TabsTrigger>
                    <TabsTrigger value="Crypto Mail" className="gap-2">
                      <Mail className="h-4 w-4" />
                      Crypto Mail
                    </TabsTrigger>
                    <TabsTrigger value="x402 API" disabled className="gap-2 opacity-50 cursor-not-allowed">
                      <Code className="h-4 w-4" />
                      x402 API
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 ml-1">
                        Coming Soon
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
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
      
      <div className="flex-1">
        {/* Sim Directory Section */}
        <section className="container mx-auto px-3 sm:px-4 py-8 flex-1">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">

            {/* Sort and Search with Create button - responsive layout */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Create + Sort on same line */}
              <div className="flex gap-3">
                {/* Create Sim Button */}
                <Button
                  onClick={() => setShowCreateSimModal(true)}
                  style={{ backgroundColor: '#83f1aa' }}
                  className="gap-2 font-semibold text-black hover:opacity-90 h-12 px-4 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Create Sim
                </Button>
                
                {/* Create CA Bot Button */}
                <Button
                  onClick={() => setShowCreateCABotModal(true)}
                  variant="outline"
                  className="gap-2 font-semibold h-12 px-4 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Create <img src={pumpfunLogo} alt="PumpFun" className="h-4 w-4 inline-block mx-1" /> Agent
                </Button>

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

          {/* Sims Grid */}
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
                // For autonomous agents, always show properly capitalized category
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
              
              return (
                <button
                  key={sim.id}
                  onClick={() => handleSimClick(sim)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-card hover:bg-muted border-2 hover:border-[#83f1aa] transition-all duration-300 hover:scale-105 hover:shadow-xl"
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

          {filteredSims?.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-lg mb-2">No sims found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
            </Card>
          )}
        </div>
      </section>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />

      <SimDetailModal
        sim={selectedSim}
        open={isSimModalOpen}
        onOpenChange={setIsSimModalOpen}
        onAuthRequired={() => {
          setAuthModalOpen(true);
          setTimeout(() => setIsSimModalOpen(false), 100);
        }}
      />

      {showCreateSimModal && (
        <CreateSimModal
          open={showCreateSimModal}
          onOpenChange={setShowCreateSimModal}
          onAuthRequired={() => {
            setShowCreateSimModal(false);
            setAuthModalOpen(true);
          }}
          onSuccess={async () => {
            if (currentUser) {
              await queryClient.invalidateQueries({ queryKey: ['user-sims', currentUser.id] });
              await queryClient.invalidateQueries({ queryKey: ['all-sims-landing'] });
            }
          }}
        />
      )}

      {showCreateCABotModal && (
        <CreateCABotModal
          open={showCreateCABotModal}
          onOpenChange={setShowCreateCABotModal}
          onSuccess={async () => {
            if (currentUser) {
              await queryClient.invalidateQueries({ queryKey: ['user-sims', currentUser.id] });
              await queryClient.invalidateQueries({ queryKey: ['all-sims-landing'] });
            }
          }}
        />
      )}

      <SimLeaderboard />

        <SimpleFooter />
      </div>
    </div>
  );
};

export default Landing;
