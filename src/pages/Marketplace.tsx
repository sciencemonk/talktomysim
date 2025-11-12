import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, Package, FileText, Search, Filter, Star, TrendingUp, Sparkles, Zap, Store, Mail, Menu, Code } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useOfferings } from "@/hooks/useOfferings";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import simHeroLogo from "@/assets/sim-hero-logo.png";
import simLogoWhite from "@/assets/sim-logo-white.png";
import xIcon from "@/assets/x-icon.png";
import shopifyLogo from "@/assets/shopify-logo.png";
import visaLogo from "@/assets/visa-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { useTheme } from "@/hooks/useTheme";
import SimpleFooter from "@/components/SimpleFooter";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FloatingAgentDemo } from "@/components/FloatingAgentDemo";
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
  const {
    theme
  } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showBetaRequest, setShowBetaRequest] = useState(false);
  const [betaCode, setBetaCode] = useState('');
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistCompany, setWaitlistCompany] = useState('');
  const [waitlistRole, setWaitlistRole] = useState('');
  const [waitlistWebsite, setWaitlistWebsite] = useState('');
  const [waitlistSales, setWaitlistSales] = useState('');
  const [waitlistPlatform, setWaitlistPlatform] = useState('');
  const [waitlistGoal, setWaitlistGoal] = useState('');
  const [waitlistPhone, setWaitlistPhone] = useState('');
  
  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    checkUser();
  }, []);
  const {
    offerings,
    isLoading: offeringsLoading
  } = useOfferings();

  // Fetch all agents from advisors table
  const {
    data: agents = [],
    isLoading: agentsLoading
  } = useQuery({
    queryKey: ['marketplace-agents'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('advisors').select('*').eq('is_active', true);
      if (error) throw error;

      // Filter out Crypto Mail agents that might have invalid X usernames
      // to prevent errors when fetching profile data
      return (data || []).filter(agent => {
        // Skip Crypto Mail agents except for verified ones
        if (agent.sim_category === 'Crypto Mail') {
          return agent.is_verified;
        }
        return true;
      }).map(agent => ({
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
        social_links: agent.social_links
      }));
    }
  });
  const isLoading = agentsLoading || offeringsLoading;

  // Combine agents and offerings into marketplace items
  const marketplaceItems: MarketplaceItem[] = [...agents.map(agent => ({
    id: agent.id,
    type: 'agent' as const,
    name: agent.name,
    description: agent.description,
    avatar: agent.avatar,
    price: agent.price || 0,
    category: agent.marketplace_category || 'AI Agents',
    rating: agent.performance || 0,
    sales: agent.interactions || 0,
    badge: agent.is_verified ? 'Verified' : agent.is_featured ? 'Featured' : undefined
  })), ...offerings.map(offering => ({
    id: offering.id,
    type: 'offering' as const,
    name: offering.title,
    description: offering.description,
    avatar: offering.agent_avatar_url || offering.media_url,
    price: offering.price,
    category: offering.offering_type === 'agent' ? 'AI Agents' : offering.offering_type === 'digital' ? 'Digital Goods' : 'Products',
    rating: 0,
    sales: 0,
    badge: undefined
  }))];

  // Count items by category (only offerings, not agents)
  const categoryCounts = {
    'AI Agents': offerings.filter(o => o.offering_type === 'agent').length,
    'Digital Goods': offerings.filter(o => o.offering_type === 'digital').length,
    'Products': offerings.filter(o => o.offering_type === 'standard').length,
    'Featured': offerings.filter(o => o.offering_type && ['agent', 'digital', 'standard'].includes(o.offering_type)).length
  };

  // Filter and sort items - exclude agents from products view
  const filteredItems = marketplaceItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase());
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

  // Filter agents by search term
  const filteredAgents = agents.filter(agent => {
    if (!searchTerm) return true;
    return agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || agent.description.toLowerCase().includes(searchTerm.toLowerCase()) || agent.auto_description && agent.auto_description.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const categories = Array.from(new Set(marketplaceItems.map(item => item.category).filter(Boolean)));
  const scrollToWaitlist = () => {
    const element = document.getElementById('waitlist-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleItemClick = (item: MarketplaceItem) => {
    // Check if it's an NFT
    if (item.type === 'agent') {
      const agent = agents.find(a => a.id === item.id);
      if (agent && (agent as any).marketplace_category === 'nft') {
        navigate(`/nft/${item.id}`);
        return;
      }
      navigate(`/${item.id}`);
    } else {
      navigate(`/offering/${item.id}`);
    }
  };

  // Generate varied gradient backgrounds for items without images
  const getGradientForItem = (index: number) => {
    const gradients = ['from-violet-500/20 via-purple-500/20 to-fuchsia-500/20', 'from-blue-500/20 via-cyan-500/20 to-teal-500/20', 'from-emerald-500/20 via-green-500/20 to-lime-500/20', 'from-amber-500/20 via-orange-500/20 to-red-500/20', 'from-pink-500/20 via-rose-500/20 to-red-500/20', 'from-indigo-500/20 via-blue-500/20 to-sky-500/20', 'from-cyan-500/20 via-teal-500/20 to-emerald-500/20', 'from-orange-500/20 via-amber-500/20 to-yellow-500/20'];
    return gradients[index % gradients.length];
  };
  const generateBetaCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handlePostToX = () => {
    const tweetText = '$SIMAI';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleCopyCA = async () => {
    const ca = "FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump";
    try {
      await navigator.clipboard.writeText(ca);
      toast.success("Contract address copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Could not copy to clipboard");
    }
  };

  const handleXSignIn = () => {
    const code = generateBetaCode();
    setBetaCode(code);
    setShowBetaRequest(true);
  };

  const handleWaitlistSubmit = async () => {
    // Validate required fields
    if (!waitlistEmail) {
      toast.error("Email address is required");
      return;
    }
    
    if (!waitlistCompany) {
      toast.error("Company name is required");
      return;
    }

    if (!waitlistRole) {
      toast.error("Job title is required");
      return;
    }
    
    if (!waitlistWebsite) {
      toast.error("Website or store URL is required");
      return;
    }

    if (!waitlistSales) {
      toast.error("Please select your yearly sales range");
      return;
    }

    if (!waitlistPlatform) {
      toast.error("Please select your e-commerce platform");
      return;
    }

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert({
          email: waitlistEmail,
          wallet_address: JSON.stringify({
            company: waitlistCompany,
            role: waitlistRole,
            website: waitlistWebsite,
            platform: waitlistPlatform,
            phone: waitlistPhone
          }),
          reason: JSON.stringify({
            sales: waitlistSales,
            goal: waitlistGoal
          })
        });

      if (error) throw error;

      toast.success("Thank you! We'll be in touch within 24 hours.");
      setWaitlistEmail('');
      setWaitlistCompany('');
      setWaitlistRole('');
      setWaitlistWebsite('');
      setWaitlistSales('');
      setWaitlistPlatform('');
      setWaitlistGoal('');
      setWaitlistPhone('');
      
      // Scroll to top after submission
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error submitting waitlist:", error);
      toast.error("Failed to join waitlist. Please try again.");
    }
  };
  return <div className="min-h-screen bg-bg">
      {/* Hero Section with Video Background */}
      <div className="relative border-b border-border overflow-hidden h-screen">
        {/* Video Background */}
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://uovhemqkztmkoozlmqxq.supabase.co/storage/v1/object/public/sim/4962796-uhd_3840_2160_25fps.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Top Navigation */}
        <nav className="relative z-20 border-b border-white/10 backdrop-blur-sm bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <button onClick={() => navigate('/')} className="flex items-center hover:opacity-80 transition-opacity">
                <div className="bg-black/90 rounded-lg px-2 py-1">
                  <img src="/sim-logo-white.png" alt="SIM" className="h-6 w-auto" />
                </div>
              </button>
              
              {/* Right side - Theme Toggle only */}
              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center">
          {!showBetaRequest ? (
            <>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-mono tracking-tight text-white mb-4 sm:whitespace-nowrap">
                Agentic Sales Platform
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                A knowledgeable AI Agent right on your store that drives more sales and happier customers.
              </p>
              <button
                onClick={handleCopyCA}
                className="text-xs sm:text-base font-mono bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white transition-colors cursor-pointer border border-white/20 mb-12 max-w-full break-all"
                title="Click to copy contract address"
              >
                CA: FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump
              </button>
              <Button
                onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                size="lg"
                className="bg-white text-black hover:bg-white/90 text-xl px-12 py-8 h-auto font-semibold"
              >
                Join Waitlist
              </Button>
            </>
          ) : (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Your X account isn&apos;t on the early access list</h2>
              <p className="text-white/80 mb-6 text-center">Post this on X to get an early access invite:</p>
              <div className="p-4 bg-black/30 rounded-lg font-mono text-sm text-white mb-6 text-center">
                $SIMAI
              </div>
              <div className="space-y-3">
                <Button onClick={handlePostToX} className="w-full bg-white text-black hover:bg-white/90" size="lg">
                  Post on X
                </Button>
                <Button variant="outline" onClick={() => setShowBetaRequest(false)} className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 1: Vector Embeddings - Impressive Visual Section */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border-b border-border relative overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Step 1: The Foundation
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6">
              Transform Your Catalog Into Intelligence
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent mx-auto mb-8"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We don't just store your products. We create a semantic understanding of your entire inventory.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Visual representation */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                {/* Main visualization card */}
                <div className="bg-card border-2 border-primary/30 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                  <div className="space-y-6">
                    {/* Product item flowing into embeddings */}
                    <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border animate-fade-in">
                      <Package className="w-8 h-8 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm">Product Data</p>
                        <p className="text-xs text-muted-foreground">Name, description, attributes, images...</p>
                      </div>
                      <Zap className="w-5 h-5 text-primary animate-pulse" />
                    </div>

                    {/* Transformation arrow */}
                    <div className="flex justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-2xl font-bold text-primary">↓</div>
                        <p className="text-xs font-semibold text-primary">Vector Embedding</p>
                      </div>
                    </div>

                    {/* Vector representation */}
                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-6 border border-primary/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <p className="font-semibold text-foreground">Semantic Vector</p>
                      </div>
                      <div className="grid grid-cols-8 gap-2">
                        {[...Array(64)].map((_, i) => (
                          <div
                            key={i}
                            className="h-2 bg-primary/30 rounded-full animate-pulse"
                            style={{ animationDelay: `${i * 30}ms` }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-4">
                        768-dimensional embedding capturing semantic meaning
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating accent elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
              </div>
            </div>

            {/* Right side - Features */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Semantic Understanding</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Your AI agent understands "red summer dress" means the same as "scarlet sundress" or "crimson evening gown". It gets context, not just keywords.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Instant Product Knowledge</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Every product, variant, price point, and detail is embedded in seconds. Your agent becomes an expert on your entire catalog instantly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Intelligent Recommendations</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Vector similarity powers contextual recommendations. The agent suggests complementary items based on deep product relationships, not just tags.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Agent Personalization */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Bot className="w-4 h-4" />
              Step 2: Your Brand Voice
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6">
              Align Your Agent With Your Brand
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent mx-auto mb-8"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Custom avatars, speech patterns, and conversation flows that perfectly match your brand identity.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Avatar Customization */}
            <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-8 hover:border-primary/50 transition-all hover:shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4 text-center">Custom Avatar</h3>
              <p className="text-muted-foreground text-center leading-relaxed mb-6">
                Upload your brand mascot, use AI-generated characters, or pick from our library. Make your agent instantly recognizable.
              </p>
              <div className="flex justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-primary/10 rounded-full border-2 border-primary/30"></div>
                ))}
              </div>
            </div>

            {/* Speech Patterns */}
            <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-8 hover:border-primary/50 transition-all hover:shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4 text-center">Speech Patterns</h3>
              <p className="text-muted-foreground text-center leading-relaxed mb-6">
                Define your agent's tone: friendly and casual, professional and formal, or witty and playful. It speaks like your brand.
              </p>
              <div className="space-y-2">
                <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm text-center">
                  "Hey there! 👋"
                </div>
                <div className="bg-muted text-muted-foreground px-3 py-2 rounded-lg text-sm text-center">
                  "Good afternoon."
                </div>
              </div>
            </div>

            {/* Conversation Flows */}
            <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-8 hover:border-primary/50 transition-all hover:shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4 text-center">Smart Flows</h3>
              <p className="text-muted-foreground text-center leading-relaxed mb-6">
                Configure objectives: up-sell premium items, promote seasonal sales, or guide customers to best-sellers. Your agent knows the strategy.
              </p>
              <div className="flex flex-col gap-2 text-xs text-center">
                <div className="bg-background border border-border rounded px-2 py-1">Discovery</div>
                <div className="text-primary">↓</div>
                <div className="bg-background border border-border rounded px-2 py-1">Recommendation</div>
                <div className="text-primary">↓</div>
                <div className="bg-background border border-border rounded px-2 py-1">Close</div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">Your Brand, Your Rules</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Discount Rules</p>
                  <p className="text-sm text-muted-foreground">Set when and how your agent offers promotions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Upsell Strategy</p>
                  <p className="text-sm text-muted-foreground">Configure cross-sells and bundle recommendations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Response Time</p>
                  <p className="text-sm text-muted-foreground">Instant replies or natural typing delays</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Guardrails</p>
                  <p className="text-sm text-muted-foreground">Define boundaries for agent behavior</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Easy Integration Section - This is effectively Step 3 */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Code className="w-4 h-4" />
              Step 3: Go Live
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
              Add SIM to Your Site in Seconds
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent mx-auto mb-8"></div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Simple integration with one line of code. Works seamlessly with your existing store.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Left side - Code snippet */}
            <div className="order-2 lg:order-1">
              <div className="bg-background border border-border rounded-xl p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Integration Code</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">Copy & Paste</Badge>
                </div>
                <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm font-mono text-foreground">
{`<script src="https://sim.ai/embed.js"></script>
<script>
  SIM.init({
    storeId: 'your-store-id',
    position: 'bottom-right'
  });
</script>`}
                  </code>
                </pre>
              </div>

              <div className="mt-6 bg-background border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">That's it!</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Works on any website platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>No complex setup or configuration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Automatically syncs with your product catalog</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right side - Shopify integration */}
            <div className="order-1 lg:order-2">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <img src={shopifyLogo} alt="Shopify" className="h-12 object-contain" />
                  <span className="text-3xl font-bold text-foreground">+</span>
                  <Bot className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Native Shopify Integration</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Built specifically for Shopify stores. SIM automatically connects to your product catalog, inventory, and checkout system. Zero manual data entry required.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>One-click install from Shopify App Store</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Real-time product and inventory sync</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Automatic order processing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-lg"
            >
              Start Your Integration
            </button>
          </div>
        </div>
      </div>

      {/* Sales Demo Section */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
              Bring Agentic Sales to Your Site
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Most sites use AI for customer support. The real unlock is using it for sales. Meet SIM, your AI agent that knows what visitors are browsing, guiding them through decisions and completing purchases, all in natural conversation.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
            {/* Left side - Payment Integration */}
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-4">
                    <img src={visaLogo} alt="Visa" className="h-8 object-contain" />
                    <span className="text-2xl font-bold text-foreground">×</span>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-primary">x402</p>
                      <p className="text-xs text-muted-foreground">Protocol</p>
                    </div>
                  </div>
                  
                  <div className="bg-background/50 rounded-lg p-6 backdrop-blur-sm">
                    <h4 className="font-semibold text-foreground mb-3">Visa Trusted Agent Protocol</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      SIM integrates with x402 and Visa&apos;s Trusted Agent Protocol to enable secure, seamless in-chat payments. Customers can complete purchases without ever leaving the conversation.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">Instant payment processing in chat</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">Bank-grade security powered by Visa</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">No checkout pages or redirects needed</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      👉 Try our live demo in the bottom right corner
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Explanation */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="bg-background border border-border rounded-xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">
                  Beyond Support Chatbots
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Support bots answer questions. SIM closes deals. It tracks what your visitors are browsing, understands their intent, and acts as a personal shopping assistant that guides them to purchase decisions faster than traditional checkout flows.
                </p>
              </div>
              
              <div className="bg-background border border-border rounded-xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">
                  Context-Aware Commerce
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  SIM sees what products visitors are viewing, how long they've been on the page, and their browsing patterns. It proactively offers help, suggests alternatives, handles objections, and completes purchases without leaving the conversation.
                </p>
              </div>
              
              <div className="bg-background border border-border rounded-xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">
                  Higher Conversion Rates
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  No abandoned carts. No friction. No hesitation. When customers can complete a purchase without leaving the conversation, conversion rates skyrocket. SIM turns browsers into buyers by removing every obstacle between interest and sale.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-lg"
            >
              Add SIM to Your Site
            </button>
          </div>
        </div>
      </div>

      {/* Waitlist Form Section */}
      <div id="waitlist-form" className="bg-gradient-to-b from-background to-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Request Early Access
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
              Transform Your E-Commerce Experience
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join forward-thinking businesses leveraging AI to increase conversions and deliver exceptional customer experiences. Our team will reach out within 24 hours to schedule your personalized demo.
            </p>
          </div>

          <div className="bg-card border-2 border-border rounded-2xl p-8 sm:p-10 shadow-xl">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Contact Information */}
              <div>
                <label htmlFor="waitlist-email" className="text-sm font-semibold block mb-2 text-foreground">
                  Work Email *
                </label>
                <Input
                  id="waitlist-email"
                  type="email"
                  placeholder="john@company.com"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  className="h-12"
                />
              </div>

              <div>
                <label htmlFor="waitlist-phone" className="text-sm font-semibold block mb-2 text-foreground">
                  Phone Number
                </label>
                <Input
                  id="waitlist-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={waitlistPhone}
                  onChange={(e) => setWaitlistPhone(e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Company Information */}
              <div>
                <label htmlFor="waitlist-company" className="text-sm font-semibold block mb-2 text-foreground">
                  Company Name *
                </label>
                <Input
                  id="waitlist-company"
                  type="text"
                  placeholder="Acme Corp"
                  value={waitlistCompany}
                  onChange={(e) => setWaitlistCompany(e.target.value)}
                  className="h-12"
                />
              </div>

              <div>
                <label htmlFor="waitlist-role" className="text-sm font-semibold block mb-2 text-foreground">
                  Job Title *
                </label>
                <Input
                  id="waitlist-role"
                  type="text"
                  placeholder="VP of E-commerce"
                  value={waitlistRole}
                  onChange={(e) => setWaitlistRole(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            {/* Store Details */}
            <div className="space-y-6 mb-6">
              <div>
                <label htmlFor="waitlist-website" className="text-sm font-semibold block mb-2 text-foreground">
                  Store Website *
                </label>
                <Input
                  id="waitlist-website"
                  type="text"
                  placeholder="https://yourstore.com"
                  value={waitlistWebsite}
                  onChange={(e) => setWaitlistWebsite(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="waitlist-sales" className="text-sm font-semibold block mb-2 text-foreground">
                    Annual Revenue *
                  </label>
                  <Select value={waitlistSales} onValueChange={setWaitlistSales}>
                    <SelectTrigger id="waitlist-sales" className="h-12">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-50k">$0 - $50k</SelectItem>
                      <SelectItem value="50k-250k">$50k - $250k</SelectItem>
                      <SelectItem value="250k-1m">$250k - $1M</SelectItem>
                      <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                      <SelectItem value="5m-10m">$5M - $10M</SelectItem>
                      <SelectItem value="10m+">$10M+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="waitlist-platform" className="text-sm font-semibold block mb-2 text-foreground">
                    E-Commerce Platform *
                  </label>
                  <Select value={waitlistPlatform} onValueChange={setWaitlistPlatform}>
                    <SelectTrigger id="waitlist-platform" className="h-12">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shopify">Shopify</SelectItem>
                      <SelectItem value="woocommerce">WooCommerce</SelectItem>
                      <SelectItem value="magento">Magento</SelectItem>
                      <SelectItem value="bigcommerce">BigCommerce</SelectItem>
                      <SelectItem value="custom">Custom Built</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label htmlFor="waitlist-goal" className="text-sm font-semibold block mb-2 text-foreground">
                  Primary Goal (Optional)
                </label>
                <Select value={waitlistGoal} onValueChange={setWaitlistGoal}>
                  <SelectTrigger id="waitlist-goal" className="h-12">
                    <SelectValue placeholder="What are you looking to improve?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversion">Increase conversion rate</SelectItem>
                    <SelectItem value="aov">Boost average order value</SelectItem>
                    <SelectItem value="support">Reduce support tickets</SelectItem>
                    <SelectItem value="experience">Improve customer experience</SelectItem>
                    <SelectItem value="abandonment">Decrease cart abandonment</SelectItem>
                    <SelectItem value="all">All of the above</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleWaitlistSubmit} 
              className="w-full h-14 text-lg font-semibold"
              size="lg"
            >
              Request Demo & Early Access
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              By submitting, you agree to be contacted by our team. We typically respond within 24 hours.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">24h</div>
              <p className="text-xs text-muted-foreground">Response Time</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">SOC 2</div>
              <p className="text-xs text-muted-foreground">Compliant</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">99.9%</div>
              <p className="text-xs text-muted-foreground">Uptime SLA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="bg-black/90 rounded-lg px-2 py-1">
                <img src="/sim-logo-white.png" alt="SIM" className="h-5 w-auto" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 SIM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Waitlist Modal (backup) */}
      <Dialog open={showWaitlistModal} onOpenChange={setShowWaitlistModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Early Access</DialogTitle>
            <DialogDescription>
              Fill out this form and our team will reach out within 24 hours to schedule your demo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="modal-email" className="text-sm font-semibold block mb-2">
                  Work Email *
                </label>
                <Input
                  id="modal-email"
                  type="email"
                  placeholder="john@company.com"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="modal-company" className="text-sm font-semibold block mb-2">
                  Company Name *
                </label>
                <Input
                  id="modal-company"
                  type="text"
                  placeholder="Acme Corp"
                  value={waitlistCompany}
                  onChange={(e) => setWaitlistCompany(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="modal-role" className="text-sm font-semibold block mb-2">
                  Job Title *
                </label>
                <Input
                  id="modal-role"
                  type="text"
                  placeholder="VP of E-commerce"
                  value={waitlistRole}
                  onChange={(e) => setWaitlistRole(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="modal-phone" className="text-sm font-semibold block mb-2">
                  Phone Number
                </label>
                <Input
                  id="modal-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={waitlistPhone}
                  onChange={(e) => setWaitlistPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="modal-website" className="text-sm font-semibold block mb-2">
                Store Website *
              </label>
              <Input
                id="modal-website"
                type="text"
                placeholder="https://yourstore.com"
                value={waitlistWebsite}
                onChange={(e) => setWaitlistWebsite(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="modal-sales" className="text-sm font-semibold block mb-2">
                  Annual Revenue *
                </label>
                <Select value={waitlistSales} onValueChange={setWaitlistSales}>
                  <SelectTrigger id="modal-sales">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-50k">$0 - $50k</SelectItem>
                    <SelectItem value="50k-250k">$50k - $250k</SelectItem>
                    <SelectItem value="250k-1m">$250k - $1M</SelectItem>
                    <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                    <SelectItem value="5m-10m">$5M - $10M</SelectItem>
                    <SelectItem value="10m+">$10M+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="modal-platform" className="text-sm font-semibold block mb-2">
                  E-Commerce Platform *
                </label>
                <Select value={waitlistPlatform} onValueChange={setWaitlistPlatform}>
                  <SelectTrigger id="modal-platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopify">Shopify</SelectItem>
                    <SelectItem value="woocommerce">WooCommerce</SelectItem>
                    <SelectItem value="magento">Magento</SelectItem>
                    <SelectItem value="bigcommerce">BigCommerce</SelectItem>
                    <SelectItem value="custom">Custom Built</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="modal-goal" className="text-sm font-semibold block mb-2">
                Primary Goal (Optional)
              </label>
              <Select value={waitlistGoal} onValueChange={setWaitlistGoal}>
                <SelectTrigger id="modal-goal">
                  <SelectValue placeholder="What are you looking to improve?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversion">Increase conversion rate</SelectItem>
                  <SelectItem value="aov">Boost average order value</SelectItem>
                  <SelectItem value="support">Reduce support tickets</SelectItem>
                  <SelectItem value="experience">Improve customer experience</SelectItem>
                  <SelectItem value="abandonment">Decrease cart abandonment</SelectItem>
                  <SelectItem value="all">All of the above</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleWaitlistSubmit} className="flex-1">
                Request Demo & Early Access
              </Button>
              <Button variant="outline" onClick={() => setShowWaitlistModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Floating Agent Demo */}
      <FloatingAgentDemo />
    </div>;
};
export default Marketplace;