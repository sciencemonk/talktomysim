import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { AgentType } from "@/types/agent";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { Badge } from "@/components/ui/badge";

interface MarketplacePreviewProps {
  sims?: (AgentType & { like_count?: number })[];
  onSimClick: (sim: AgentType) => void;
  onViewAll: () => void;
}

export const MarketplacePreview = ({ sims = [], onSimClick, onViewAll }: MarketplacePreviewProps) => {
  // Get top 6 sims by likes
  const topSims = [...sims]
    .sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
    .slice(0, 6);

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <Badge variant="outline" className="text-sm">
                Live Marketplace
              </Badge>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Trending <span className="text-primary">Sims</span>
            </h2>
            <p className="text-xl text-muted-foreground mt-2">
              Explore the most popular AI agents created by our community
            </p>
          </div>
          <Button
            onClick={onViewAll}
            variant="outline"
            size="lg"
            className="hidden md:flex border-2"
          >
            View All Sims
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {topSims.map((sim) => (
            <Card
              key={sim.id}
              className="group cursor-pointer overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
              onClick={() => onSimClick(sim)}
            >
              <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
                {sim.avatar ? (
                  <img
                    src={getAvatarUrl(sim.avatar)}
                    alt={sim.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <span className="text-4xl font-bold text-primary">
                      {sim.name?.charAt(0)?.toUpperCase() || 'S'}
                    </span>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-lg line-clamp-1">{sim.name}</h3>
                  {sim.like_count ? (
                    <Badge variant="secondary" className="flex-shrink-0">
                      ❤️ {sim.like_count}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {sim.description || sim.auto_description || 'No description available'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center md:hidden">
          <Button
            onClick={onViewAll}
            variant="outline"
            size="lg"
            className="border-2"
          >
            View All Sims
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
