import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";

interface TrendingOffering {
  id: string;
  title: string;
  description: string;
  price: number;
  price_per_conversation: number | null;
  media_url: string | null;
  offering_type: string;
  agent: {
    id: string;
    name: string;
    avatar_url: string | null;
    social_links: any;
    custom_url: string | null;
  };
  purchase_count: number;
}

export const TrendingOfferingsSection = () => {
  const navigate = useNavigate();

  const { data: trendingOfferings, isLoading } = useQuery({
    queryKey: ['trending-offerings'],
    queryFn: async () => {
      // Get all active offerings with their agents
      const { data: offerings, error: offeringsError } = await supabase
        .from('x_agent_offerings')
        .select(`
          id,
          title,
          description,
          price,
          price_per_conversation,
          media_url,
          offering_type,
          agent:advisors!agent_id (
            id,
            name,
            avatar_url,
            social_links,
            custom_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (offeringsError) throw offeringsError;

      // Get purchase counts from payment_sessions
      const { data: paymentSessions, error: paymentsError } = await supabase
        .from('payment_sessions')
        .select('metadata');

      if (paymentsError) throw paymentsError;

      // Count purchases per offering
      const purchaseCounts = new Map<string, number>();
      paymentSessions?.forEach(session => {
        const metadata = session.metadata as any;
        const offeringId = metadata?.offering_id;
        if (offeringId) {
          purchaseCounts.set(offeringId, (purchaseCounts.get(offeringId) || 0) + 1);
        }
      });

      // Add purchase counts to offerings and sort by count
      const offeringsWithCounts = (offerings || []).map(offering => ({
        ...offering,
        purchase_count: purchaseCounts.get(offering.id) || 0
      }));

      // Sort by purchase count (descending)
      const sorted = offeringsWithCounts.sort((a, b) => b.purchase_count - a.purchase_count);

      // Filter to only one offering per agent, then take top 9
      const seenAgents = new Set<string>();
      const uniqueByAgent = sorted.filter(offering => {
        if (seenAgents.has(offering.agent.id)) {
          return false;
        }
        seenAgents.add(offering.agent.id);
        return true;
      });

      return uniqueByAgent.slice(0, 9) as TrendingOffering[];
    },
  });

  const getAvatarSrc = (avatarUrl: string | null) => {
    if (!avatarUrl) return undefined;
    
    // If it's a Twitter/X image, proxy it through weserv for CORS
    if (avatarUrl.includes('pbs.twimg.com') || avatarUrl.includes('twimg.com')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}&w=100&h=100&fit=cover&default=404`;
    }
    
    return avatarUrl;
  };

  const handleOfferingClick = (offering: TrendingOffering) => {
    navigate(`/offering/${offering.id}`);
  };

  const getPrice = (offering: TrendingOffering) => {
    if (offering.offering_type === 'agent' && offering.price_per_conversation) {
      return `${offering.price_per_conversation} USDC/chat`;
    }
    if (offering.price === 0) return 'Free';
    return `${offering.price} USDC`;
  };

  if (isLoading) {
    return (
      <section className="container mx-auto px-3 sm:px-4 py-20 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="animate-pulse text-muted-foreground">Loading trending offerings...</div>
          </div>
        </div>
      </section>
    );
  }

  if (!trendingOfferings || trendingOfferings.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-3 sm:px-4 py-20 border-b bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <TrendingUp className="w-8 h-8 text-[#83f1aa]" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Trending Now
          </h2>
        </div>
        <p className="text-center text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
          Discover the most popular offerings from our community of creators
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {trendingOfferings.map((offering, index) => (
            <Card 
              key={offering.id}
              className="group cursor-pointer hover:border-[#83f1aa] transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden"
              onClick={() => handleOfferingClick(offering)}
            >
              <CardContent className="p-4 space-y-3">
                {/* Rank Badge */}
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-bold"
                    style={{ 
                      backgroundColor: index < 3 ? '#83f1aa20' : undefined,
                      color: index < 3 ? '#83f1aa' : undefined
                    }}
                  >
                    #{index + 1}
                  </Badge>
                  {offering.purchase_count > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {offering.purchase_count} {offering.purchase_count === 1 ? 'sale' : 'sales'}
                    </Badge>
                  )}
                </div>


                {/* Offering Title */}
                <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
                  {offering.title}
                </h3>

                {/* Offering Type Badge */}
                <Badge variant="outline" className="text-xs border-border/60 hover:border-border">
                  {offering.offering_type === 'agent' ? 'AI Agent' : 
                   offering.offering_type === 'digital' ? 'Digital Good' : 
                   'Products & Services'}
                </Badge>

                {/* Agent Info */}
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage 
                      src={getAvatarSrc(offering.agent?.avatar_url)}
                      alt={offering.agent?.name}
                    />
                    <AvatarFallback className="text-xs">
                      {offering.agent?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">
                    {offering.agent?.name}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-bold text-[#83f1aa]">
                    {getPrice(offering)}
                  </span>
                  <Sparkles className="w-4 h-4 text-[#83f1aa] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
