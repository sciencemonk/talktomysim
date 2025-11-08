import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, Package, FileText, Search, Filter, Star, TrendingUp, Sparkles, Zap, Store, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useOfferings } from "@/hooks/useOfferings";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import solanaLogo from "@/assets/solana-logo.png";
import xIcon from "@/assets/x-icon.png";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

type MarketplaceItem = {
  id: string;
  type: 'agent' | 'offering';
  name: string;
  description: string;
  avatar?: string;
  price?: number;
  category?: string;
  rating?: number;
  sales?: number;
  badge?: string;
};

const Marketplace = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("trending");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { offerings, isLoading: offeringsLoading } = useOfferings();

  // Fetch all agents from advisors table
  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['marketplace-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Filter out Crypto Mail agents that might have invalid X usernames
      // to prevent errors when fetching profile data
      return (data || [])
        .filter(agent => {
          // Skip Crypto Mail agents except for specific verified ones
          if (agent.sim_category === 'Crypto Mail') {
            const xUsername = (agent.social_links as any)?.x_username;
            // Only include verified Crypto Mail agents or specific whitelisted ones
            return agent.is_verified || xUsername?.toLowerCase() === 'mrjethroknights';
          }
          return true;
        })
        .map(agent => ({
          id: agent.id,
          name: agent.name,
          description: agent.description || agent.auto_description || '',
          auto_description: agent.auto_description,
          type: 'General Tutor' as const,
          status: 'active' as const,
          createdAt: agent.created_at,
          updatedAt: agent.updated_at,
          avatar: agent.avatar_url,
          avatar_url: agent.avatar_url,
          prompt: agent.prompt,
          sim_category: agent.sim_category,
          marketplace_category: agent.marketplace_category,
          is_verified: agent.is_verified || false,
          is_featured: false,
          price: agent.price || 0,
          interactions: 0,
          performance: 0,
          social_links: agent.social_links,
        }));
    },
  });

  const isLoading = agentsLoading || offeringsLoading;

  // Combine agents and offerings into marketplace items
  const marketplaceItems: MarketplaceItem[] = [
    ...agents.map(agent => ({
      id: agent.id,
      type: 'agent' as const,
      name: agent.name,
      description: agent.description,
      avatar: agent.avatar,
      price: agent.price || 0,
      category: agent.marketplace_category || 'AI Agents',
      rating: agent.performance || 0,
      sales: agent.interactions || 0,
      badge: agent.is_verified ? 'Verified' : agent.is_featured ? 'Featured' : undefined,
    })),
    ...offerings.map(offering => ({
      id: offering.id,
      type: 'offering' as const,
      name: offering.title,
      description: offering.description,
      avatar: offering.agent_avatar_url || offering.media_url,
      price: offering.price,
      category: offering.offering_type === 'agent' ? 'AI Agents' : offering.offering_type === 'digital' ? 'Digital Goods' : 'Products',
      rating: 0,
      sales: 0,
      badge: undefined,
    })),
  ];

  // Count items by category (only offerings, not agents)
  const categoryCounts = {
    'AI Agents': offerings.filter(o => o.offering_type === 'agent').length,
    'Digital Goods': offerings.filter(o => o.offering_type === 'digital').length,
    'Products': offerings.filter(o => o.offering_type === 'standard').length,
    'Featured': offerings.filter(o => o.offering_type && ['agent', 'digital', 'standard'].includes(o.offering_type)).length,
  };

  // Filter and sort items - exclude agents from products view
  const filteredItems = marketplaceItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    // Only show offerings (not agents) in the products grid
    const isOffering = item.type === 'offering';
    return matchesSearch && matchesCategory && isOffering;
  }).sort((a, b) => {
    switch (sortBy) {
      case "trending":
        return (b.sales || 0) - (a.sales || 0);
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const categories = Array.from(new Set(marketplaceItems.map(item => item.category).filter(Boolean)));

  const handleItemClick = (item: MarketplaceItem) => {
    if (item.type === 'agent') {
      navigate(`/${item.id}`);
    } else {
      navigate(`/offering/${item.id}`);
    }
  };

  // Generate varied gradient backgrounds for items without images
  const getGradientForItem = (index: number) => {
    const gradients = [
      'from-violet-500/20 via-purple-500/20 to-fuchsia-500/20',
      'from-blue-500/20 via-cyan-500/20 to-teal-500/20',
      'from-emerald-500/20 via-green-500/20 to-lime-500/20',
      'from-amber-500/20 via-orange-500/20 to-red-500/20',
      'from-pink-500/20 via-rose-500/20 to-red-500/20',
      'from-indigo-500/20 via-blue-500/20 to-sky-500/20',
      'from-cyan-500/20 via-teal-500/20 to-emerald-500/20',
      'from-orange-500/20 via-amber-500/20 to-yellow-500/20',
    ];
    return gradients[index % gradients.length];
  };

  const handleXSignIn = async () => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        }
      });

      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Error signing in with X:', error);
      toast.error(error?.message || 'Failed to sign in with X');
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Top Header with Logo, Sign In and Theme Toggle */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo on the left */}
            <button 
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full backdrop-blur-sm transition-all cursor-pointer shadow-sm bg-primary/10 border border-primary/20 hover:bg-primary/20 whitespace-nowrap"
            >
              <img src={solanaLogo} alt="Solana" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-bold text-fg">Solana Internet Market</span>
            </button>
            
            {/* Sign in with X and Theme Toggle on the right */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border border-fg text-fg hover:bg-fg/10 hover:text-fg text-xs sm:text-sm px-2 sm:px-4 gap-2"
                onClick={handleXSignIn}
              >
                Sign in with <img src={xIcon} alt="X" className="h-3.5 w-3.5 sm:h-4 sm:w-4 inline-block" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with Video Background */}
      <div className="relative pt-20 border-b border-border overflow-hidden">
        {/* Video Background */}
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://uovhemqkztmkoozlmqxq.supabase.co/storage/v1/object/sign/trimtab/4426378-uhd_3840_2160_25fps.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDZlOGY2My1iYjgzLTQwOGQtYjc1Mi1mOWM0OTMxZjU3OGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0cmltdGFiLzQ0MjYzNzgtdWhkXzM4NDBfMjE2MF8yNWZwcy5tcDQiLCJpYXQiOjE3NjIzMTYzOTgsImV4cCI6MTc5Mzg1MjM5OH0.m-yCbNjzr3XR15fzejjFmaZNqbtC-fU0_J9aUDlTEd8" type="video/mp4" />
        </video>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-white mb-4">Marketplace</h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Discover AI agents, digital products, and exclusive offerings from creators worldwide
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-8 border-border bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-fgMuted" />
                <Input 
                  placeholder="Search for AI agents, products, and digital goods..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="pl-10 h-12 text-base bg-inputBg border-inputBorder"
                />
              </div>
              
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={categoryFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("all")}
                  className="gap-2"
                >
                  All
                </Button>
                <Button
                  variant={categoryFilter === "AI Agents" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("AI Agents")}
                  className="gap-2"
                >
                  <Bot className="h-4 w-4" />
                  AI Agents
                </Button>
                <Button
                  variant={categoryFilter === "Products" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("Products")}
                  className="gap-2"
                >
                  <Package className="h-4 w-4" />
                  Products
                </Button>
                <Button
                  variant={categoryFilter === "Stores" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("Stores")}
                  className="gap-2"
                >
                  <Store className="h-4 w-4" />
                  Stores
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categorized AI Agents Sections */}
        {agentsLoading ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-fg mb-2">AI Agents</h2>
                <p className="text-sm text-fgMuted">Loading agents...</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i} className="animate-pulse border-border">
                  <CardContent className="p-4 text-center">
                    <div className="w-full aspect-[4/3] bg-bgMuted rounded mb-3" />
                    <div className="h-4 bg-bgMuted rounded w-3/4 mx-auto mb-2" />
                    <div className="h-3 bg-bgMuted rounded w-1/2 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* PumpFun Agents Section */}
            {(categoryFilter === 'all' || categoryFilter === 'AI Agents') && 
             agents.filter(a => (a as any).sim_category === 'PumpFun Agent').length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-fg mb-2 flex items-center gap-2">
                      <Zap className="h-6 w-6" />
                      PumpFun Agents
                    </h2>
                    <p className="text-sm text-fgMuted">AI agents representing PumpFun tokens</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {agents
                    .filter(a => (a as any).sim_category === 'PumpFun Agent')
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((agent) => {
                      const getAvatarSrc = () => {
                        const avatarUrl = agent.avatar_url || agent.avatar;
                        if (avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
                          return `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}`;
                        }
                        return avatarUrl;
                      };

                      return (
                        <Card 
                          key={agent.id}
                          className="group cursor-pointer border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                          onClick={() => handleItemClick({
                            id: agent.id,
                            type: 'agent',
                            name: agent.name,
                            description: agent.description,
                            avatar: agent.avatar,
                            price: agent.price || 0,
                            category: agent.marketplace_category || 'AI Agents',
                            rating: agent.performance || 0,
                            sales: agent.interactions || 0,
                          })}
                        >
                          <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted rounded-t-lg">
                            <Avatar className="w-full h-full rounded-none">
                              <AvatarImage 
                                src={getAvatarSrc()}
                                alt={agent.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                              />
                              <AvatarFallback className="w-full h-full rounded-none bg-primary/10 flex items-center justify-center">
                                <Zap className="h-8 w-8 text-primary" />
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <CardContent className="p-3 space-y-2">
                            <h3 className="font-semibold text-fg text-sm truncate group-hover:text-primary transition-colors">
                              {agent.name}
                            </h3>
                            <p className="text-xs text-fgMuted line-clamp-2">
                              {agent.description || agent.auto_description}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Chatbots Section */}
            {(categoryFilter === 'all' || categoryFilter === 'AI Agents') && 
             agents.filter(a => !(a as any).sim_category || (a as any).sim_category === 'Chat').length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-fg mb-2 flex items-center gap-2">
                      <Bot className="h-6 w-6" />
                      Chatbots
                    </h2>
                    <p className="text-sm text-fgMuted">AI chatbots for various use cases</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {agents
                    .filter(a => !(a as any).sim_category || (a as any).sim_category === 'Chat')
                    .sort((a, b) => {
                      if (a.is_verified && !b.is_verified) return -1;
                      if (!a.is_verified && b.is_verified) return 1;
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    })
                    .map((agent) => {
                      const getAvatarSrc = () => {
                        const avatarUrl = agent.avatar_url || agent.avatar;
                        if (avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
                          return `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}`;
                        }
                        return avatarUrl;
                      };

                      return (
                        <Card 
                          key={agent.id}
                          className="group cursor-pointer border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                          onClick={() => handleItemClick({
                            id: agent.id,
                            type: 'agent',
                            name: agent.name,
                            description: agent.description,
                            avatar: agent.avatar,
                            price: agent.price || 0,
                            category: agent.marketplace_category || 'AI Agents',
                            rating: agent.performance || 0,
                            sales: agent.interactions || 0,
                            badge: agent.is_verified ? 'Verified' : agent.is_featured ? 'Featured' : undefined,
                          })}
                        >
                          <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted rounded-t-lg">
                            <Avatar className="w-full h-full rounded-none">
                              <AvatarImage 
                                src={getAvatarSrc()}
                                alt={agent.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                              />
                              <AvatarFallback className="w-full h-full rounded-none bg-primary/10 flex items-center justify-center">
                                <Bot className="h-8 w-8 text-primary" />
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-fg text-sm truncate group-hover:text-primary transition-colors flex-1">
                                {agent.name}
                              </h3>
                              {agent.is_verified && (
                                <Badge className="text-xs bg-brandPurple text-white shrink-0">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-fgMuted line-clamp-2">
                              {agent.description || agent.auto_description}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Stores Section */}
            {(categoryFilter === 'all' || categoryFilter === 'Stores') && 
             agents.filter(a => (a as any).sim_category === 'Crypto Mail').length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-fg mb-2 flex items-center gap-2">
                      <Store className="h-6 w-6" />
                      Stores
                    </h2>
                    <p className="text-sm text-fgMuted">Verified creator stores on the marketplace</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {agents
                    .filter(a => (a as any).sim_category === 'Crypto Mail')
                    .sort((a, b) => {
                      if (a.is_verified && !b.is_verified) return -1;
                      if (!a.is_verified && b.is_verified) return 1;
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    })
                    .map((agent) => {
                      const getAvatarSrc = () => {
                        const avatarUrl = agent.avatar_url || agent.avatar;
                        if (avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
                          return `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}`;
                        }
                        return avatarUrl;
                      };

                      return (
                        <Card 
                          key={agent.id}
                          className="group cursor-pointer border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                          onClick={() => handleItemClick({
                            id: agent.id,
                            type: 'agent',
                            name: agent.name,
                            description: agent.description,
                            avatar: agent.avatar,
                            price: agent.price || 0,
                            category: agent.marketplace_category || 'AI Agents',
                            rating: agent.performance || 0,
                            sales: agent.interactions || 0,
                            badge: agent.is_verified ? 'Verified' : undefined,
                          })}
                        >
                           <div className="relative w-full aspect-square overflow-hidden bg-muted rounded-t-lg">
                            <Avatar className="w-full h-full rounded-none">
                              <AvatarImage 
                                src={getAvatarSrc()}
                                alt={agent.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                              />
                              <AvatarFallback className="w-full h-full rounded-none bg-primary/10 flex items-center justify-center">
                                <Store className="h-8 w-8 text-primary" />
                              </AvatarFallback>
                            </Avatar>
                          </div>
                           <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                               <h3 className="font-semibold text-fg text-base truncate group-hover:text-primary transition-colors flex-1">
                                {agent.name}
                              </h3>
                              {agent.is_verified && (
                                <Badge className="text-xs bg-brandPurple text-white shrink-0">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                             <p className="text-sm text-fgMuted line-clamp-2">
                              {agent.description || agent.auto_description}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Products Grid - Hide when on Stores tab */}
        {categoryFilter !== 'Stores' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-fg mb-4">
                {categoryFilter === 'all' ? 'All Products' : categoryFilter}
                <span className="text-fgMuted text-lg ml-2">({filteredItems.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ?
            // Loading skeleton
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse border-border overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square bg-bgMuted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-bgMuted rounded w-3/4" />
                    <div className="h-3 bg-bgMuted rounded" />
                    <div className="h-3 bg-bgMuted rounded w-5/6" />
                    <div className="flex justify-between items-center mt-4">
                      <div className="h-6 bg-bgMuted rounded w-20" />
                      <div className="h-4 bg-bgMuted rounded w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : filteredItems.map((item, index) => (
              <Card 
                key={item.id} 
                className="group cursor-pointer overflow-hidden border border-border bg-card hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    {item.avatar ? (
                      <img 
                        src={item.avatar} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getGradientForItem(index)} group-hover:scale-105 transition-transform duration-500`}>
                        {item.type === 'agent' ? (
                          <Bot className="h-16 w-16 text-primary/60" />
                        ) : (
                          <Package className="h-16 w-16 text-primary/60" />
                        )}
                      </div>
                    )}
                    
                    {/* Badge */}
                    {item.badge && (
                      <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground shadow-lg">
                        <Zap className="h-3 w-3 mr-1" />
                        {item.badge}
                      </Badge>
                    )}
                    
                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {/* Category Badge */}
                    <Badge className="text-xs mb-2 bg-brandPurple text-white border-0">
                      {item.category}
                    </Badge>
                    
                    <h3 className="font-semibold text-fg text-base mb-2 line-clamp-2 min-h-[3rem]">
                      {item.name}
                    </h3>
                    <p className="text-sm text-fgMuted line-clamp-2 mb-3 min-h-[2.5rem]">
                      {item.description}
                    </p>
                    
                    {/* Rating and Sales */}
                    {(item.rating > 0 || item.sales > 0) && (
                      <div className="flex items-center gap-3 mb-3 text-xs text-fgMuted border-t border-border pt-3">
                        {item.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                            <span className="font-medium">{item.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {item.sales > 0 && (
                          <div className="flex items-center gap-1">
                            <span>{item.sales.toLocaleString()} uses</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Price */}
                    <div className="flex justify-between items-center">
                      {item.price !== undefined && item.price > 0 ? (
                        <p className="text-xl font-bold text-primary">
                          ${item.price.toFixed(2)}
                        </p>
                      ) : (
                        <Badge variant="secondary" className="text-sm font-semibold">Free</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
          }
            </div>

            {filteredItems.length === 0 && !isLoading && (
          <Card className="border-border bg-card">
            <CardContent className="text-center py-12">
              <div className="bg-bgMuted p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-fgMuted" />
              </div>
              <h3 className="text-xl font-semibold text-fg mb-2">No items found</h3>
              <p className="text-base text-fgMuted mb-6">Try adjusting your search or filters</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
