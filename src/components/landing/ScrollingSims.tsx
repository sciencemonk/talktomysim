import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { useEffect, useRef, useState } from "react";
import { AgentType } from "@/types/agent";
import { Badge } from "@/components/ui/badge";
import pumpfunLogo from "@/assets/pumpfun-logo.png";

interface ScrollingSimsProps {
  onSimClick: (sim: AgentType) => void;
}

export const ScrollingSims = ({ onSimClick }: ScrollingSimsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [marketCapData, setMarketCapData] = useState<Record<string, number>>({});

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
  ];

  const { data: sims } = useQuery({
    queryKey: ['scrolling-sims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('is_active', true)
        .limit(20);
      
      if (error) throw error;
      return data?.map(sim => ({
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
        social_links: sim.social_links as any,
        background_image_url: sim.background_image_url,
        crypto_wallet: sim.crypto_wallet,
        x402_enabled: sim.x402_enabled || false,
        x402_price: sim.x402_price || 0,
        x402_wallet: sim.x402_wallet,
        is_verified: sim.is_verified || false,
        marketplace_category: sim.marketplace_category
      } as AgentType));
    },
  });

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || !sims || sims.length === 0) return;

    let scrollPosition = 0;
    const scroll = () => {
      scrollPosition += 1;
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
    };

    const interval = setInterval(scroll, 30);
    return () => clearInterval(interval);
  }, [sims]);

  useEffect(() => {
    const fetchMarketCaps = async () => {
      if (!sims) return;
      
      const pumpFunSims = sims.filter(sim => 
        (sim as any).sim_category === 'PumpFun Agent' && 
        (sim.social_links as any)?.contract_address
      );

      for (const sim of pumpFunSims) {
        const contractAddress = (sim.social_links as any).contract_address;
        try {
          const { data, error } = await supabase.functions.invoke('analyze-pumpfun-token', {
            body: { tokenAddress: contractAddress },
          });

          if (!error && data?.success && data?.tokenData) {
            setMarketCapData(prev => ({
              ...prev,
              [sim.id]: data.tokenData.usd_market_cap
            }));
          }
        } catch (error) {
          console.error('[ScrollingSims] Error fetching market cap:', error);
        }
      }
    };

    fetchMarketCaps();
  }, [sims]);

  if (!sims || sims.length === 0) return null;

  const formatMarketCap = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  // Duplicate the array to create seamless loop
  const duplicatedSims = [...sims, ...sims];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 w-full overflow-hidden py-6 border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-hidden px-4"
        style={{ scrollBehavior: 'auto' }}
      >
        {duplicatedSims.map((sim, index) => {
          const simCategoryType = (sim as any).sim_category;
          const isPumpFunAgent = simCategoryType === 'PumpFun Agent';
          const isAutonomousAgent = simCategoryType === 'Autonomous Agent';
          const isCryptoMail = simCategoryType === 'Crypto Mail';
          const isVerified = (sim as any).is_verified || false;
          const marketCap = marketCapData[sim.id];
          const marketplaceCategory = (sim as any).marketplace_category?.toLowerCase() || 'uncategorized';
          const categoryLabel = categories.find(c => c.id === marketplaceCategory)?.label || marketplaceCategory;

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
              key={`${sim.id}-${index}`}
              onClick={() => onSimClick(sim)}
              className="flex-shrink-0 w-72 flex flex-col overflow-hidden rounded-2xl bg-card hover:bg-muted border-2 hover:border-[#83f1aa] transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              {/* Image container */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
                {sim.avatar ? (
                  <img
                    src={getAvatarUrl(sim.avatar)} 
                    alt={sim.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${sim.name}`;
                    }}
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
                  <span className="text-sm font-semibold line-clamp-2 leading-tight">
                    {sim.name}
                  </span>
                  {isVerified && (
                    <div className="flex-shrink-0">
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
                    variant="outline" 
                    className="text-[9px] px-1.5 py-0 bg-primary/10 border-primary/30 text-primary whitespace-nowrap"
                  >
                    {typeBadgeText}
                  </Badge>
                  
                  {isPumpFunAgent ? (
                    <Badge 
                      variant="outline" 
                      className="text-[9px] px-1.5 py-0 flex items-center gap-0.5"
                    >
                      <img src={pumpfunLogo} alt="PumpFun" className="h-3 w-3" />
                      Agent
                    </Badge>
                  ) : secondBadgeText && secondBadgeText !== 'uncategorized' && (
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

                {/* Market Cap for PumpFun agents */}
                {isPumpFunAgent && marketCap && (
                  <div className="pt-1 border-t border-border/50">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">Market Cap:</span>
                      <span className="text-xs font-semibold text-primary">
                        {formatMarketCap(marketCap)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
