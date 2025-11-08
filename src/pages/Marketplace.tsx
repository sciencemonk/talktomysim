import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, Package, FileText, Search, Filter, Star, TrendingUp, Sparkles, Zap, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useOfferings } from "@/hooks/useOfferings";
import { usePublicAgents } from "@/hooks/usePublicAgents";
import { ThemeToggle } from "@/components/ThemeToggle";
import solanaLogo from "@/assets/solana-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const [stores, setStores] = useState<Array<{id: string, name: string, description: string, avatar_url: string}>>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const { agents, isLoading: agentsLoading } = usePublicAgents();
  const { offerings, isLoading: offeringsLoading } = useOfferings();

  const isLoading = agentsLoading || offeringsLoading;

  // Fetch stores with active offerings
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const { data, error } = await supabase
          .from('advisors')
          .select('id, name, description, avatar_url')
          .in('id', 
            offerings.map(o => o.agent_id).filter((v, i, a) => a.indexOf(v) === i)
          )
          .limit(12);
        
        if (error) throw error;
        setStores(data || []);
      } catch (error) {
        console.error('Error fetching stores:', error);
      } finally {
        setStoresLoading(false);
      }
    };

    if (!offeringsLoading && offerings.length > 0) {
      fetchStores();
    }
  }, [offerings, offeringsLoading]);

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

  // Count items by category
  const categoryCounts = {
    'AI Agents': offerings.filter(o => o.offering_type === 'agent').length,
    'Digital Goods': offerings.filter(o => o.offering_type === 'digital').length,
    'Products': offerings.filter(o => o.offering_type === 'standard').length,
    'Featured': marketplaceItems.filter(item => item.badge).length,
  };

  // Filter and sort items
  const filteredItems = marketplaceItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
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
            
            {/* Create a Store and Theme Toggle on the right */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border border-fg text-fg hover:bg-fg/10 hover:text-fg text-xs sm:text-sm px-2 sm:px-4"
                onClick={() => navigate('/')}
              >
                Create a Store
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
              
              <div className="flex flex-wrap gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] bg-inputBg border-inputBorder">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Trending</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="price-low">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>Price: Low to High</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="price-high">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>Price: High to Low</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="rating">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span>Top Rated</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px] bg-inputBg border-inputBorder">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category!}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stores Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-fg mb-2">Browse Stores</h2>
              <p className="text-sm text-fgMuted">Discover creators selling on Solana Internet Market</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/agents')}>
              View All
            </Button>
          </div>
          
          {storesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse border-border">
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-bgMuted mx-auto mb-3" />
                    <div className="h-4 bg-bgMuted rounded w-3/4 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stores.map((store) => (
                <Card 
                  key={store.id}
                  className="group cursor-pointer border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                  onClick={() => navigate(`/${store.id}`)}
                >
                  <CardContent className="p-4 text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-3 ring-2 ring-border group-hover:ring-primary transition-all">
                      <AvatarImage src={store.avatar_url} alt={store.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        <Store className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-fg text-sm truncate group-hover:text-primary transition-colors">
                      {store.name}
                    </h3>
                    <p className="text-xs text-fgMuted mt-1 line-clamp-2">
                      {store.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card 
            className="cursor-pointer transition-all duration-300 border-border bg-card hover:shadow-lg hover:border-primary/30 hover:-translate-y-1" 
            onClick={() => setCategoryFilter('AI Agents')}
          >
            <CardContent className="p-6 text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-fg text-base mb-1">AI Agents</h3>
              <p className="text-sm text-fgMuted">
                {isLoading ? '...' : `${categoryCounts['AI Agents']} available`}
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer transition-all duration-300 border-border bg-card hover:shadow-lg hover:border-primary/30 hover:-translate-y-1" 
            onClick={() => setCategoryFilter('Digital Goods')}
          >
            <CardContent className="p-6 text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-fg text-base mb-1">Digital Goods</h3>
              <p className="text-sm text-fgMuted">
                {isLoading ? '...' : `${categoryCounts['Digital Goods']} available`}
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer transition-all duration-300 border-border bg-card hover:shadow-lg hover:border-primary/30 hover:-translate-y-1" 
            onClick={() => setCategoryFilter('Products')}
          >
            <CardContent className="p-6 text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-fg text-base mb-1">Products</h3>
              <p className="text-sm text-fgMuted">
                {isLoading ? '...' : `${categoryCounts['Products']} available`}
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer transition-all duration-300 border-border bg-card hover:shadow-lg hover:border-primary/30 hover:-translate-y-1"
            onClick={() => {
              setCategoryFilter('all');
              setSortBy('trending');
            }}
          >
            <CardContent className="p-6 text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-fg text-base mb-1">Featured</h3>
              <p className="text-sm text-fgMuted">
                {isLoading ? '...' : `${categoryCounts['Featured']} items`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
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
      </div>
    </div>
  );
};

export default Marketplace;
