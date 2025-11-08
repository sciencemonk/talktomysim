import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, Package, FileText, Search, Filter, Star, TrendingUp, Sparkles, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useOfferings } from "@/hooks/useOfferings";
import { usePublicAgents } from "@/hooks/usePublicAgents";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  const { agents, isLoading: agentsLoading } = usePublicAgents();
  const { offerings, isLoading: offeringsLoading } = useOfferings();

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
      category: offering.offering_type === 'agent' ? 'AI Agents' : offering.offering_type === 'digital_file' ? 'Digital Goods' : 'Products',
      rating: 0,
      sales: 0,
      badge: undefined,
    })),
  ];

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

  return (
    <div className="min-h-screen bg-bg">
      {/* Top Header with Sign In and Theme Toggle */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-end items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              className="bg-transparent border-2 border-fg text-fg hover:bg-fg/10 hover:text-fg hover:scale-105 transition-all"
              onClick={() => navigate('/signin')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="pt-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-fg mb-4">Marketplace</h1>
          <p className="text-lg text-fgMuted max-w-2xl">
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

        {/* Featured Categories Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border bg-card hover:border-primary/50" onClick={() => setCategoryFilter('AI Agents')}>
            <CardContent className="p-6 text-center">
              <Bot className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold text-fg">AI Agents</h3>
              <p className="text-sm text-fgMuted mt-1">
                {isLoading ? '...' : `${agents.length} available`}
              </p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border bg-card hover:border-primary/50" onClick={() => setCategoryFilter('Digital Goods')}>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold text-fg">Digital Goods</h3>
              <p className="text-sm text-fgMuted mt-1">
                {isLoading ? '...' : `${offerings.filter(o => o.offering_type === 'digital_file').length} available`}
              </p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border bg-card hover:border-primary/50" onClick={() => setCategoryFilter('Products')}>
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold text-fg">Products</h3>
              <p className="text-sm text-fgMuted mt-1">
                {isLoading ? '...' : `${offerings.filter(o => o.offering_type === 'standard').length} available`}
              </p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border bg-card hover:border-primary/50">
            <CardContent className="p-6 text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold text-fg">Featured</h3>
              <p className="text-sm text-fgMuted mt-1">
                {isLoading ? '...' : `${agents.filter(a => a.is_featured).length} items`}
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
              <Card key={i} className="animate-pulse border-border">
                <CardContent className="p-0">
                  <div className="aspect-square bg-bgMuted rounded-t-lg" />
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
            )) : filteredItems.map(item => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:shadow-xl transition-all duration-300 border-border bg-card hover:scale-105"
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-bgMuted rounded-t-lg overflow-hidden">
                    {item.avatar ? (
                      <img 
                        src={item.avatar} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.type === 'agent' ? (
                          <Bot className="h-16 w-16 text-fgMuted" />
                        ) : (
                          <Package className="h-16 w-16 text-fgMuted" />
                        )}
                      </div>
                    )}
                    
                    {/* Badge */}
                    {item.badge && (
                      <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                        <Zap className="h-3 w-3 mr-1" />
                        {item.badge}
                      </Badge>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-fg text-base mb-2 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-fgMuted line-clamp-2 mb-3">
                      {item.description}
                    </p>
                    
                    {/* Rating and Sales */}
                    <div className="flex items-center gap-3 mb-3 text-xs text-fgMuted">
                      {item.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span>{item.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {item.sales > 0 && (
                        <div className="flex items-center gap-1">
                          <span>{item.sales} uses</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <div>
                    {item.price !== undefined && item.price > 0 ? (
                      <p className="text-xl font-bold text-primary">
                        ${item.price.toFixed(2)}
                      </p>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Free</Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </CardFooter>
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
