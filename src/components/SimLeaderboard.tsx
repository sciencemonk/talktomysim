import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { Badge } from "@/components/ui/badge";

export const SimLeaderboard = () => {
  const [open, setOpen] = useState(false);

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['sim-leaderboard'],
    queryFn: async () => {
      // Get conversation counts per advisor (unique visitors)
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('tutor_id, advisor_id');

      if (convError) throw convError;

      // Count unique conversations per sim
      const countMap = new Map<string, number>();
      conversations?.forEach(conv => {
        const simId = conv.advisor_id || conv.tutor_id;
        if (simId) {
          countMap.set(simId, (countMap.get(simId) || 0) + 1);
        }
      });

      // Get top entries sorted by count
      const sortedEntries = Array.from(countMap.entries())
        .sort((a, b) => b[1] - a[1]);

      if (sortedEntries.length === 0) return [];

      // Fetch enough advisors to ensure we get 10 active ones
      const topSimIds = sortedEntries.slice(0, 30).map(([id]) => id);

      const { data: advisors, error: advisorsError } = await supabase
        .from('advisors')
        .select('id, name, avatar_url, marketplace_category, sim_category, custom_url')
        .in('id', topSimIds)
        .eq('is_active', true);

      if (advisorsError) throw advisorsError;

      // Combine data, sort by count, and limit to top 10
      return (advisors || [])
        .map(advisor => ({
          ...advisor,
          visitor_count: countMap.get(advisor.id) || 0
        }))
        .sort((a, b) => b.visitor_count - a.visitor_count)
        .slice(0, 10);
    },
    enabled: open
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
          style={{ backgroundColor: '#82f2aa', color: '#000' }}
        >
          <Trophy className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Top 10 Most Popular Sims
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard?.map((sim, index) => (
              <div
                key={sim.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                {/* Rank Badge */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'hsl(var(--muted))',
                    color: index < 3 ? '#000' : 'hsl(var(--foreground))'
                  }}
                >
                  {index + 1}
                </div>

                {/* Avatar */}
                <Avatar className="h-12 w-12 border-2 border-border">
                  <AvatarImage src={getAvatarUrl(sim.avatar_url)} alt={sim.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {sim.name?.charAt(0)?.toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{sim.name}</div>
                </div>

                {/* Category Badge */}
                {(() => {
                  const isContactMe = (sim as any).sim_category === 'Contact Me';
                  const displayCategory = isContactMe ? 'Contact Me' : sim.marketplace_category;
                  
                  return displayCategory && displayCategory !== 'uncategorized' && (
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {displayCategory}
                    </Badge>
                  );
                })()}
              </div>
            ))}

              {(!leaderboard || leaderboard.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No data available yet
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
