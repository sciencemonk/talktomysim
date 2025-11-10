import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MatrixHeroSection } from "@/components/landing/MatrixHeroSection";
import AuthModal from "@/components/AuthModal";
import { UnifiedAgentCreation } from "@/components/UnifiedAgentCreation";
import { CreateXAgentModal } from "@/components/CreateXAgentModal";
import { AgentType } from "@/types/agent";
import { HackathonAnnouncementModal } from "@/components/HackathonAnnouncementModal";
import { OfferingsMosaic } from "@/components/landing/OfferingsMosaic";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { Whyx402Section } from "@/components/landing/Whyx402Section";
import { SignUpCTASection } from "@/components/landing/SignUpCTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SimVsStripeSection } from "@/components/landing/SimVsStripeSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { ChevronRight, Bot, Search, TrendingUp, ChevronDown, Mail, Zap, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import pumpfunLogo from "@/assets/pumpfun-logo.png";
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
import { PendingAgentModal } from "@/components/PendingAgentModal";
import { WelcomeModal } from "@/components/WelcomeModal";

interface PumpFunSimCardProps {
  sim: AgentType & { user_id?: string; like_count?: number; is_verified?: boolean };
  onSimClick: (sim: AgentType) => void;
}

const formatNumber = (num: number | undefined) => {
  if (!num) return '0';
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

const PumpFunSimCard = ({ sim, onSimClick }: PumpFunSimCardProps) => {
  const [marketCapData, setMarketCapData] = useState<{ marketCap?: number } | null>(null);
  const [isLoadingMarketCap, setIsLoadingMarketCap] = useState(false);
  const [xProfileData, setXProfileData] = useState<any>(null);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  
  const simCategoryType = (sim as any).sim_category;
  const isPumpFunAgent = simCategoryType === 'PumpFun Agent';
  const isCryptoMail = simCategoryType === 'Crypto Mail';
  const isVerified = (sim as any).is_verified || false;
  
  const contractAddress = isPumpFunAgent 
    ? (sim.social_links as any)?.contract_address 
    : undefined;

  const xUsername = isCryptoMail 
    ? ((sim.social_links as any)?.userName || (sim.social_links as any)?.x_username)
    : undefined;
  
  // Check verification status from database (false = pending, true = verified)
  const isPending = !(sim as any).verification_status;

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

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!isCryptoMail) return;

      try {
        const { data, error } = await supabase
          .from('x_agent_purchases')
          .select('payment_amount')
          .eq('agent_id', sim.id);

        if (error) throw error;

        const total = data?.reduce((sum, msg) => sum + Number(msg.payment_amount), 0) || 0;
        setTotalEarnings(total);
      } catch (error) {
        console.error('[PumpFunSimCard] Error fetching earnings:', error);
      }
    };

    fetchEarnings();
  }, [isCryptoMail, sim.id]);

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
  
  let typeBadgeText = 'Chat';
  if (simCategoryType === 'Autonomous Agent') typeBadgeText = 'Autonomous Agent';
  else if (isCryptoMail) typeBadgeText = 'Crypto Mail';

  return (
    <button
      onClick={() => onSimClick(sim)}
      className={`group relative flex flex-col overflow-hidden rounded-xl bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-[#635BFF] transition-all duration-300 ${
        isPending ? 'opacity-90' : 'hover:scale-105'
      } hover:shadow-lg`}
    >
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
            <span className="text-4xl font-bold text-primary">
              {isCryptoMail ? (sim.name?.replace(/^@/, '').charAt(0)?.toUpperCase() || 'X') : (sim.name?.charAt(0)?.toUpperCase() || 'S')}
            </span>
          </AvatarFallback>
        </Avatar>
        {isPending && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge className="bg-yellow-500 text-black font-semibold px-3 py-1">
              Pending
            </Badge>
          </div>
        )}
      </div>
      
      <div className="w-full p-3 space-y-2.5">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-base font-semibold line-clamp-2 leading-tight block">
            {isCryptoMail ? sim.name.replace(/^@/, '') : sim.name}
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
          {isCryptoMail ? (
            <Badge 
              variant="outline" 
              className="text-[10px] px-2 py-0.5 flex items-center gap-0.5"
              style={{ backgroundColor: 'rgba(129, 244, 170, 0.15)', color: '#81f4aa', borderColor: 'rgba(129, 244, 170, 0.3)' }}
            >
              <Users className="h-3 w-3" />
              {formatNumber(xProfileData?.metrics?.followers || 0)} Followers
            </Badge>
          ) : isPumpFunAgent ? (
            <>
              <Badge 
                variant="outline" 
                className="text-[10px] px-2 py-0.5 bg-primary/10 border-primary/30 text-primary whitespace-nowrap"
              >
                {typeBadgeText}
              </Badge>
              <Badge 
                variant="outline" 
                className="text-[10px] px-2 py-0.5 flex items-center gap-0.5"
              >
                <img src={pumpfunLogo} alt="PumpFun" className="h-3 w-3" />
                Agent
              </Badge>
            </>
          ) : (
            <Badge 
              variant="outline" 
              className="text-[10px] px-2 py-0.5 bg-primary/10 border-primary/30 text-primary whitespace-nowrap"
            >
              {typeBadgeText}
            </Badge>
          )}
        </div>

        {isPumpFunAgent && marketCapData?.marketCap && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">Market Cap:</span>
              <span className="text-[11px] font-semibold text-primary">
                {formatMarketCap(marketCapData.marketCap)}
              </span>
            </div>
          </div>
        )}
        {isPumpFunAgent && isLoadingMarketCap && (
          <div className="pt-1.5 border-t border-border/50">
            <div className="text-[9px] text-muted-foreground text-center">Loading...</div>
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
  const [showXAgentModal, setShowXAgentModal] = useState(false);
  const [createXAgentModalOpen, setCreateXAgentModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'pumpfun': true,
    'chat': true
  });
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
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({
    'x-agents': 32,
    'pumpfun': 32,
    'chat': 32
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [simTypeFilter, setSimTypeFilter] = useState<'all' | 'Crypto Mail' | 'Chat' | 'PumpFun Agent'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'name'>('newest');
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  const scrollToLearnMore = () => {
    const learnMoreSection = document.getElementById('learn-more-section');
    if (learnMoreSection) {
      learnMoreSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToAgents = () => {
    const agentsSection = document.getElementById('agents-showcase-section');
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

  // Redirect authenticated users to their creator page
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get X username from user metadata (this is what XAgentCreatorView uses for authorization)
        const userMetadata = session.user.user_metadata;
        const xUsername = userMetadata?.user_name || userMetadata?.preferred_username;
        
        if (xUsername) {
          // Redirect to creator page using the X username from auth metadata
          window.location.href = `/${xUsername}/creator`;
        }
      }
    };
    
    checkAuthAndRedirect();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSimClick = (sim: AgentType) => {
    const simCategoryType = (sim as any).sim_category;
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
    
    // For X agents, navigate to /:username
    if (simCategoryType === 'Crypto Mail') {
      const xUsername = (sim.social_links as any)?.userName || (sim.social_links as any)?.x_username;
      if (xUsername) {
        window.scrollTo(0, 0);
        navigate(`/${xUsername}`);
        return;
      }
    }
    
    // For PumpFun agents, navigate to /token/:contractAddress
    if (simCategoryType === 'PumpFun Agent') {
      const contractAddress = (sim.social_links as any)?.contract_address;
      if (contractAddress) {
        window.scrollTo(0, 0);
        navigate(`/token/${contractAddress}`);
        return;
      }
    }
    
    // For regular chat agents, navigate to slug with chat=true
    window.scrollTo(0, 0);
    navigate(`/${simSlug}?chat=true`);
  };

  // Fetch all sims
  const { data: allSims } = useQuery({
    queryKey: ['all-sims-landing'],
    queryFn: async () => {
      // Exclude edit_code for security
      const { data: advisorsData, error: advisorsError } = await supabase
        .from('advisors')
        .select('id, name, title, description, prompt, sim_category, x402_wallet, auto_description, full_description, avatar_url, response_length, conversation_style, personality_type, website_url, created_at, updated_at, is_verified, verification_status, date_of_birth, years_experience, interests, skills, sample_scenarios, completion_status, is_public, user_id, is_active, is_official, price, integrations, social_links, x402_price, x402_enabled, expertise_areas, target_audience, background_image_url, marketplace_category, background_content, knowledge_summary, url, full_name, professional_title, location, crypto_wallet, twitter_url, sim_type, owner_welcome_message, education, current_profession, areas_of_expertise, writing_sample, additional_background, custom_url, welcome_message')
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
          is_verified: sim.is_verified || false,
          verification_status: sim.verification_status
        } as AgentType & { user_id?: string; marketplace_category?: string; like_count?: number; is_verified?: boolean; verification_status?: string };
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

  const xAgents = (filteredSims?.filter(sim => {
    const simCategory = (sim as any).sim_category;
    if (simCategory === 'Crypto Mail') {
      const xUsername = ((sim.social_links as any)?.userName || (sim.social_links as any)?.x_username)?.toLowerCase();
      // Show all X agents
      return ['degencapitalllc', 'cryptodivix', 'professrweb3'].includes(xUsername || '');
    }
    return false;
  }) || []).sort((a, b) => {
    // Sort: active agents first, then pending ones
    const approvedXAgents = ['cryptodivix'];
    const aUsername = ((a.social_links as any)?.userName || (a.social_links as any)?.x_username)?.toLowerCase() || '';
    const bUsername = ((b.social_links as any)?.userName || (b.social_links as any)?.x_username)?.toLowerCase() || '';
    const aIsActive = approvedXAgents.includes(aUsername);
    const bIsActive = approvedXAgents.includes(bUsername);
    
    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;
    
    // Among active agents, prioritize cryptodivix
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

  const showMore = (category: string) => {
    setVisibleCounts(prev => ({ ...prev, [category]: prev[category] + 32 }));
  };

  const handleXSignIn = () => {
    setCreateXAgentModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <WelcomeModal />
      <HackathonAnnouncementModal />
      
      <div className="flex-1 overflow-hidden">
      <MatrixHeroSection 
        onCreateXAgent={handleXSignIn}
        onSimClick={handleSimClick}
        onViewAllAgents={scrollToLearnMore}
      />
      </div>

      <div id="learn-more-section" className="scroll-mt-4">
        <HowItWorksSection />
      </div>

      <SimVsStripeSection />

      <div id="why-crypto" className="scroll-mt-4">
        <Whyx402Section />
      </div>

      <SignUpCTASection onSignUp={handleXSignIn} />
      
      <LandingFooter />

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />

      <UnifiedAgentCreation
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={(createdAgent) => {
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

      <UnifiedAgentCreation
        open={showXAgentModal}
        onOpenChange={setShowXAgentModal}
        initialAgentType="crypto-mail"
        hideBackButton={true}
        showVerificationFlow={true}
      />

      <CreateXAgentModal 
        open={createXAgentModalOpen}
        onOpenChange={setCreateXAgentModalOpen}
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

export default NewLanding;
