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
import landingBackground from "@/assets/landing-background.jpg";
import { Settings, LogOut, Grid, MessageSquare, History, Search, DollarSign, Gift, TrendingUp, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarUtils";
import SimDetailModal from "@/components/SimDetailModal";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    { id: 'historical', label: 'Historical Figures', count: 0 },
    { id: 'kol', label: 'KOLs & Influencers', count: 0 },
    { id: 'crypto', label: 'Crypto & Web3', count: 0 },
    { id: 'tokens', label: 'Token Agents', count: 0 },
    { id: 'business', label: 'Business & Finance', count: 0 },
    { id: 'coaching', label: 'Coaching & Mentoring', count: 0 },
    { id: 'entertainment', label: 'Entertainment', count: 0 },
    { id: 'education', label: 'Education', count: 0 },
    { id: 'lifestyle', label: 'Lifestyle', count: 0 },
    { id: 'erotic', label: 'Adult', count: 0 },
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
    if (!currentUser) {
      setSelectedSim(sim);
      setAuthModalOpen(true);
      return;
    }
    
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

  const features = [
    {
      title: "Edit Your Sim",
      description: "Customize your sim's appearance, prompt, and settings",
      action: () => navigate("/edit-sim"),
      icon: "settings"
    },
    {
      title: "View Directory",
      description: "Browse and discover all available sims",
      action: () => navigate("/directory"),
      icon: "grid"
    },
    {
      title: "Chat with Your Sim",
      description: "Test and chat with your own sim privately",
      action: () => navigate("/chat-with-sim"),
      icon: "message"
    },
    {
      title: "View Conversations",
      description: "See all conversations your sim has had with visitors",
      action: () => navigate("/sim-conversations-view"),
      icon: "history"
    },
  ];

  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: `url(${landingBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40 z-0" />
      
      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-md bg-black/20 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
              alt="Sim" 
              className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
            />
          </div>
          {currentUser ? (
            <Button
              onClick={handleSignOut}
              className="bg-white text-black hover:bg-white/90 font-medium h-10 px-4"
              size="sm"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Log Out
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => handleWalletSignIn('phantom')}
                disabled={!!isLoading}
                className="bg-white text-black hover:bg-white/90 font-medium h-10 px-3 sm:px-4 gap-2"
                size="sm"
              >
                <img src={phantomIcon} alt="Phantom" className="w-5 h-5" />
                <span className="hidden sm:inline">{isLoading === 'phantom' ? 'Connecting...' : 'Phantom'}</span>
              </Button>
              <Button
                onClick={() => handleWalletSignIn('solflare')}
                disabled={!!isLoading}
                className="bg-white text-black hover:bg-white/90 font-medium h-10 px-3 sm:px-4 gap-2"
                size="sm"
              >
                <img src={solflareIcon} alt="Solflare" className="w-5 h-5" />
                <span className="hidden sm:inline">{isLoading === 'solflare' ? 'Connecting...' : 'Solflare'}</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Your Sims Section - Only for signed-in users */}
      {currentUser && userSim && (
        <section className="flex items-center justify-center container mx-auto px-3 sm:px-4 py-4 sm:py-6 relative z-10">
          <div className="grid gap-3 max-w-6xl w-full grid-cols-1 md:grid-cols-2">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 border-white/20 bg-white/10 backdrop-blur-md cursor-pointer"
                onClick={feature.action}
              >
                <CardHeader className="pb-3 p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl font-bold text-white">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-white/80">
                    {feature.description}
                  </CardDescription>
                  
                  {feature.icon && (
                    <div className="mt-6 flex justify-center">
                      {feature.icon === 'settings' && <Settings className="h-16 w-16 text-white/40" />}
                      {feature.icon === 'grid' && <Grid className="h-16 w-16 text-white/40" />}
                      {feature.icon === 'message' && <MessageSquare className="h-16 w-16 text-white/40" />}
                      {feature.icon === 'history' && <History className="h-16 w-16 text-white/40" />}
                    </div>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Sim Directory Section */}
      <section className="container mx-auto px-3 sm:px-4 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sims by name, title, or description..."
                className="pl-12 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <Tabs value={priceFilter} onValueChange={(v) => setPriceFilter(v as any)}>
                <TabsList className="bg-white/10 border-white/20">
                  <TabsTrigger value="all" className="data-[state=active]:bg-white/20">All</TabsTrigger>
                  <TabsTrigger value="free" className="gap-2 data-[state=active]:bg-white/20">
                    <Gift className="h-4 w-4" />
                    Free
                  </TabsTrigger>
                  <TabsTrigger value="paid" className="gap-2 data-[state=active]:bg-white/20">
                    <DollarSign className="h-4 w-4" />
                    Paid
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="h-8 w-px bg-white/20" />

              <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <TabsList className="bg-white/10 border-white/20">
                  <TabsTrigger value="popular" className="gap-2 data-[state=active]:bg-white/20">
                    <TrendingUp className="h-4 w-4" />
                    Popular
                  </TabsTrigger>
                  <TabsTrigger value="newest" className="data-[state=active]:bg-white/20">Newest</TabsTrigger>
                  <TabsTrigger value="name" className="data-[state=active]:bg-white/20">A-Z</TabsTrigger>
                </TabsList>
              </Tabs>

              {currentUser && (
                <>
                  <div className="h-8 w-px bg-white/20" />
                  <Button
                    onClick={handleAddSim}
                    className="bg-white text-black hover:bg-white/90 gap-2"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Sim
                  </Button>
                </>
              )}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categoryCounts.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={selectedCategory === cat.id ? "bg-white text-black hover:bg-white/90" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}
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
          <div className="mb-4 text-sm text-white/60">
            {filteredSims?.length || 0} Sims found
          </div>

          {/* Sims Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredSims?.map((sim) => {
              const simCategory = (sim as any).category?.toLowerCase() || 'uncategorized';
              const categoryLabel = categories.find(c => c.id === simCategory)?.label || simCategory;
              
              return (
                <button
                  key={sim.id}
                  onClick={() => handleSimClick(sim)}
                  className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-md hover:scale-105 hover:shadow-xl"
                >
                  {/* Price Badge */}
                  {sim.price && sim.price > 0 ? (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 right-2 text-[10px] px-2 py-0.5 bg-white text-black"
                    >
                      <DollarSign className="h-3 w-3 mr-0.5" />
                      {sim.price}
                    </Badge>
                  ) : (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 right-2 text-[10px] px-2 py-0.5 bg-green-500 text-white"
                    >
                      Free
                    </Badge>
                  )}

                  <Avatar className="w-24 h-24 border-2 border-white/30 shadow-lg group-hover:shadow-2xl transition-shadow">
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
                    <span className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                      {sim.name}
                    </span>
                    {sim.title && (
                      <span className="text-xs text-white/60 line-clamp-1 block">
                        {sim.title}
                      </span>
                    )}
                    {/* Category Badge */}
                    {simCategory !== 'uncategorized' && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 mt-1 bg-white/10 border-white/30 text-white">
                        {categoryLabel}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {filteredSims?.length === 0 && (
            <Card className="p-12 text-center bg-white/10 border-white/20">
              <p className="text-white text-lg mb-2">No sims found</p>
              <p className="text-sm text-white/60">Try adjusting your filters or search query</p>
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
      />

      <div className="relative z-10">
        <SimpleFooter />
      </div>
    </div>
  );
};

export default Landing;
