import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { ChevronRight, Bot } from "lucide-react";
import { Card } from "@/components/ui/card";
import pumpfunLogo from "@/assets/pumpfun-logo.png";
import xLogo from "@/assets/x-logo.png";

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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'x-agents': true,
    'pumpfun': true,
    'chat': true
  });

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
  const xAgents = allSims?.filter(sim => {
    const simCategory = (sim as any).sim_category;
    if (simCategory === 'Crypto Mail') {
      const xUsername = (sim.social_links as any)?.x_username;
      return xUsername?.toLowerCase() === 'mrjethroknights';
    }
    return false;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

  const pumpfunAgents = allSims?.filter(sim => (sim as any).sim_category === 'PumpFun Agent')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

  const chatAgents = allSims?.filter(sim => {
    const simCategory = (sim as any).sim_category;
    return simCategory === 'Chat' || !simCategory || simCategory === '';
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

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
          onViewAllAgents={() => navigate('/agents')}
        />
      </div>

      <ScrollingSimsRows onSimClick={handleSimClick} />

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
