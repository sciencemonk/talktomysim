import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import SimpleFooter from "@/components/SimpleFooter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { AgentType } from "@/types/agent";
import phantomIcon from "@/assets/phantom-icon.png";
import solflareIcon from "@/assets/solflare-icon.png";
import { toast as sonnerToast } from "sonner";
import bs58 from "bs58";
import AuthModal from "@/components/AuthModal";
import { LogOut, Search, DollarSign, Gift, TrendingUp, Plus, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarUtils";
import SimDetailModal from "@/components/SimDetailModal";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Landing = () => {
  const navigate = useNavigate();
  const [selectedSim, setSelectedSim] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'name'>('popular');
  const isMobile = useIsMobile();

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
        type: 'General Tutor' as const,
        status: 'active' as const,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        avatar: data.avatar_url,
        prompt: data.prompt,
        title: data.title,
        sim_type: data.sim_type as 'historical' | 'living',
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
        twitter_url: data.twitter_url,
        website_url: data.website_url,
        crypto_wallet: data.crypto_wallet,
        background_image_url: data.background_image_url
      } as AgentType;
    },
    enabled: !!currentUser
  });

  // Fetch all sims (both historical and living)
  const { data: allSims } = useQuery({
    queryKey: ['all-sims-landing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(sim => ({
        id: sim.id,
        name: sim.name,
        description: sim.description || '',
        type: 'General Tutor' as const,
        status: 'active' as const,
        createdAt: sim.created_at,
        updatedAt: sim.updated_at,
        avatar: sim.avatar_url,
        prompt: sim.prompt,
        title: sim.title,
        sim_type: sim.sim_type as 'historical' | 'living',
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
        category: sim.category || (!sim.user_id ? 'historical' : 'uncategorized'),
        user_id: sim.user_id,
      } as AgentType & { user_id?: string; category?: string }));
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
    { id: 'adult', label: 'Adult', count: 0 },
  ];

  // Apply filters and sorting
  const filteredSims = allSims
    ?.filter(sim => {
      const matchesSearch = 
        sim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (priceFilter === 'free' && sim.price && sim.price > 0) return false;
      if (priceFilter === 'paid' && (!sim.price || sim.price === 0)) return false;

      const simCategory = (sim as any).category?.toLowerCase() || 'uncategorized';
      if (selectedCategory !== 'all' && simCategory !== selectedCategory) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.interactions || 0) - (a.interactions || 0);
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
      const simCategory = (sim as any).category?.toLowerCase() || 'uncategorized';
      return simCategory === cat.id;
    }).length || 0;
    return { ...cat, count };
  });

  const handleSimClick = (sim: AgentType) => {
    // Always open the detail modal for both signed-in and signed-out users
    setSelectedSim(sim);
    setIsSimModalOpen(true);
  };

  const handleAddSim = () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    navigate('/home');
  };

  const handleWalletSignIn = async (walletType: 'phantom' | 'solflare') => {
    setIsLoading(walletType);
    try {
      let wallet;
      
      if (walletType === 'phantom') {
        wallet = (window as any).solana;
        if (!wallet?.isPhantom) {
          sonnerToast.error('Please install Phantom wallet');
          setIsLoading(null);
          return;
        }
      } else {
        wallet = (window as any).solflare;
        if (!wallet) {
          sonnerToast.error('Please install Solflare wallet');
          setIsLoading(null);
          return;
        }
      }

      await wallet.connect();
      const publicKey = wallet.publicKey.toString();
      const message = `Sign in to Sim\n\nWallet: ${publicKey}\nTimestamp: ${new Date().toISOString()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await wallet.signMessage(encodedMessage, 'utf8');
      const signature = bs58.encode(signedMessage.signature);

      const { data, error } = await supabase.functions.invoke('solana-auth', {
        body: { publicKey, signature, message }
      });

      if (error) throw error;
      
      if (data?.access_token && data?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        
        sonnerToast.success('Connected successfully!');
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Error signing in with Solana:', error);
      sonnerToast.error(error?.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    sonnerToast.success('Signed out successfully');
    window.location.reload();
  };


  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full flex bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Mobile Header with Menu */}
          {isMobile && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
              <div className="flex items-center justify-between p-3">
                <SidebarTrigger className="h-10 w-10">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <img 
                  src="/sim-logo.png" 
                  alt="Sim Logo" 
                  className="h-8 w-8 object-contain"
                />
                <div className="w-10" /> {/* Spacer for centering */}
              </div>
            </div>
          )}

          {/* Sim Directory Section */}
          <section className={`container mx-auto px-3 sm:px-4 pb-12 flex-1 ${isMobile ? 'pt-20' : 'pt-8'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sims by name, title, or description..."
                className="pl-12 h-12 text-base"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <Tabs value={priceFilter} onValueChange={(v) => setPriceFilter(v as any)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
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

              <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <TabsList>
                  <TabsTrigger value="popular" className="gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Popular
                  </TabsTrigger>
                  <TabsTrigger value="newest">Newest</TabsTrigger>
                  <TabsTrigger value="name">A-Z</TabsTrigger>
                </TabsList>
              </Tabs>

            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categoryCounts.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.label}
                  <Badge variant="secondary" className="ml-2 px-1.5">
                    {cat.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-muted-foreground">
            {filteredSims?.length || 0} Sims found
          </div>

          {/* Sims Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredSims?.map((sim) => {
              const simCategory = (sim as any).category?.toLowerCase() || 'uncategorized';
              const categoryLabel = categories.find(c => c.id === simCategory)?.label || simCategory;
              const price = sim.price || 0;
              
              return (
                <button
                  key={sim.id}
                  onClick={() => handleSimClick(sim)}
                  className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl bg-card hover:bg-muted border-2 hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <Avatar className="w-24 h-24 border-3 border-border shadow-lg group-hover:shadow-2xl transition-shadow">
                    <AvatarImage
                      src={getAvatarUrl(sim.avatar)} 
                      alt={sim.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                      {sim.name?.charAt(0)?.toUpperCase() || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="w-full text-center space-y-1">
                    <span className="text-sm font-semibold line-clamp-2 leading-tight">
                      {sim.name}
                    </span>
                    
                    {/* Category and Price badges at bottom */}
                    <div className="flex flex-wrap gap-1.5 justify-center mt-2 pt-2 border-t border-border/50">
                      {simCategory !== 'uncategorized' && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-muted/50 border-muted-foreground/20 text-muted-foreground whitespace-nowrap">
                          {categoryLabel}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-muted/50 border-muted-foreground/20 text-muted-foreground whitespace-nowrap">
                        {price > 0 ? `${price} $SIMAI` : 'Free'}
                      </Badge>
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
          setIsSimModalOpen(false);
          setAuthModalOpen(true);
        }}
      />

      <SimpleFooter />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Landing;
