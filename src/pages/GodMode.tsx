import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Coins, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { GodModeMap } from "@/components/GodModeMap";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LeaderboardSim {
  id: string;
  name: string;
  avatar_url: string;
  simai_balance: number;
  rank: number;
  custom_url?: string;
}

const GodMode = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [leaderboard, setLeaderboard] = useState<LeaderboardSim[]>([]);

  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);

  useEffect(() => {
    // For now, using mock data for the leaderboard
    // In production, this would fetch real SIMAI balances from the database
    const mockLeaderboard: LeaderboardSim[] = [
      { id: '1', name: 'CryptoDiviX', avatar_url: '/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png', simai_balance: 125430, rank: 1, custom_url: 'cryptodivix' },
      { id: '2', name: 'DegenCapital', avatar_url: '/lovable-uploads/29ef3bcb-9544-4a2c-bfbd-57ce889d1989.png', simai_balance: 98250, rank: 2, custom_url: 'degencapital' },
      { id: '3', name: 'ProfessrWeb3', avatar_url: '/lovable-uploads/31a26b17-27fc-463a-9eb2-a5e764de804e.png', simai_balance: 87640, rank: 3, custom_url: 'professrweb3' },
      { id: '4', name: 'Test User', avatar_url: '/lovable-uploads/35810899-a91c-4acc-b8e9-c0868e320e3f.png', simai_balance: 76520, rank: 4 },
      { id: '5', name: 'AI Trader', avatar_url: '/lovable-uploads/36c4909a-6779-43ae-a435-5a07fbd668be.png', simai_balance: 65890, rank: 5 },
      { id: '6', name: 'Smart Agent', avatar_url: '/lovable-uploads/3f54fe2a-24b7-434e-b847-d2eb033add7d.png', simai_balance: 54720, rank: 6 },
      { id: '7', name: 'Digital Twin', avatar_url: '/lovable-uploads/414592e4-0cdf-4286-a371-903bef284fe3.png', simai_balance: 48930, rank: 7 },
      { id: '8', name: 'Blockchain Bot', avatar_url: '/lovable-uploads/48ab9ee7-6838-4523-8428-b278f5a9ed4d.png', simai_balance: 43210, rank: 8 },
      { id: '9', name: 'Crypto Sage', avatar_url: '/lovable-uploads/4e33dacc-efa6-49c9-9841-697fdf3c46ea.png', simai_balance: 39870, rank: 9 },
      { id: '10', name: 'Web3 Wizard', avatar_url: '/lovable-uploads/55ccce33-98a1-45d2-9e9e-7b446a02a417.png', simai_balance: 35640, rank: 10 },
    ];
    setLeaderboard(mockLeaderboard);
  }, []);

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(2)}M`;
    } else if (balance >= 1000) {
      return `${(balance / 1000).toFixed(1)}K`;
    }
    return balance.toLocaleString();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate('/landing')} className="flex items-center hover:opacity-80 transition-opacity">
              <div className="bg-black/90 rounded-lg px-2 py-1">
                <img src="/sim-logo-white.png" alt="SIM" className="h-6 w-auto" />
              </div>
            </button>
            
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/landing')}
                className="text-sm font-medium hover:text-primary"
              >
                Home
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/godmode')}
                className="text-sm font-medium text-primary"
              >
                God Mode
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 overflow-auto pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-mono bg-primary/10 border border-primary/20 rounded-full">
              OMNISCIENT VIEW
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 font-mono tracking-tight">
              God Mode
            </h1>
            <p className="text-lg text-muted-foreground">
              Watch all SIMs interact, transact, and evolve within the digital universe in real-time.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* God Mode Map - Takes 2 columns */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Digital Universe
                    </CardTitle>
                    <Badge variant="secondary" className="gap-1">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px]">
                    <GodModeMap agentName="Universe View" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard - Takes 1 column */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Power Rankings
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Top SIMs by $SIMAI holdings
                  </p>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[520px] pr-4">
                    <div className="space-y-3">
                      {leaderboard.map((sim, index) => (
                        <button
                          key={sim.id}
                          onClick={() => sim.custom_url && navigate(`/${sim.custom_url}`)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          {/* Rank */}
                          <div className="flex-shrink-0 w-8 text-center">
                            {index < 3 ? (
                              <Trophy className={`h-5 w-5 mx-auto ${
                                index === 0 ? 'text-yellow-500' : 
                                index === 1 ? 'text-gray-400' : 
                                'text-amber-600'
                              }`} />
                            ) : (
                              <span className="text-sm font-bold text-muted-foreground">#{sim.rank}</span>
                            )}
                          </div>

                          {/* Avatar */}
                          <Avatar className="h-10 w-10 border-2 border-primary/20">
                            <AvatarImage src={sim.avatar_url} alt={sim.name} />
                            <AvatarFallback>{sim.name[0]}</AvatarFallback>
                          </Avatar>

                          {/* Name & Balance */}
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                              {sim.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Coins className="h-3 w-3" />
                              <span>{formatBalance(sim.simai_balance)} $SIMAI</span>
                            </div>
                          </div>

                          {/* Trend */}
                          <div className="flex-shrink-0">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default GodMode;
