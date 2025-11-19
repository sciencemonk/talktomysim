import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, Package, FileText, Search, Filter, Star, TrendingUp, Sparkles, Zap, Store, Mail, Menu, Code, Wallet, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useOfferings } from "@/hooks/useOfferings";
import { useQuery } from "@tanstack/react-query";
import simLogoPurple from "@/assets/sim-logo-purple.png";
import xIcon from "@/assets/x-icon.png";
import shopifyLogo from "@/assets/shopify-logo.png";
import visaLogo from "@/assets/visa-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import SimpleFooter from "@/components/SimpleFooter";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { userProfileService } from "@/services/userProfileService";
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { useIsSignedIn, useEvmAddress, useCurrentUser } from '@coinbase/cdp-hooks';
import { HowItWorksLanding } from "@/components/landing/HowItWorksLanding";
import { PricingLanding } from "@/components/landing/PricingLanding";
import { ContactFormLanding } from "@/components/landing/ContactFormLanding";
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
  const {
    user,
    signOut,
    updateUser
  } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("trending");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showBetaRequest, setShowBetaRequest] = useState(false);
  const [betaCode, setBetaCode] = useState('');
  const {
    isSignedIn
  } = useIsSignedIn();
  const {
    evmAddress
  } = useEvmAddress();
  const {
    currentUser: cdpUser
  } = useCurrentUser();

  // Handle Coinbase sign-in
  useEffect(() => {
    if (isSignedIn && evmAddress && cdpUser) {
      const handleSignIn = async () => {
        try {
          // Extract email from cdpUser - nested in authenticationMethods
          const userEmail = (cdpUser as any)?.authenticationMethods?.email?.email || null;
          console.log('Coinbase user data:', {
            evmAddress,
            email: userEmail,
            cdpUser
          });
          const profile = await userProfileService.upsertProfile(evmAddress, userEmail);
          if (profile) {
            updateUser({
              id: profile.id,
              email: profile.email,
              address: evmAddress,
              coinbaseAuth: true,
              signedInAt: new Date().toISOString()
            });
            toast.success('Successfully signed in!');
            setTimeout(() => {
              navigate('/dashboard');
            }, 500);
          }
        } catch (error) {
          console.error('Error during sign-in:', error);
          toast.error('An error occurred during sign-in');
        }
      };
      handleSignIn();
    }
  }, [isSignedIn, evmAddress, cdpUser, navigate, updateUser]);
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
    navigate('/signin');
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
  return <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative border-b border-gray-200 overflow-hidden min-h-screen bg-white">
        {/* Video Background */}
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://uovhemqkztmkoozlmqxq.supabase.co/storage/v1/object/public/sim/4962796-uhd_3840_2160_25fps.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50"></div>
        
        {/* Top Navigation */}
        <nav className="relative z-20 border-b border-primary/10 bg-white/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Logo */}
              <button onClick={() => navigate('/')} className="flex items-center hover:scale-105 transition-transform duration-200">
                <img src={simLogoPurple} alt="SIM" className="h-10 sm:h-12 md:h-14 w-auto object-contain" />
              </button>
              
              {/* Right side - User dropdown or Request Access */}
              <div className="flex items-center gap-3 sm:gap-4">
                {user ? <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="border-primary/20 text-foreground hover:bg-primary/5 hover:border-primary/40 gap-2 transition-all">
                        <User className="h-4 w-4" />
                        Account
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={async () => {
                    await signOut();
                    toast.success('Signed out successfully');
                  }}>
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu> : <Button 
                    size="sm" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => {
                      const contactSection = document.getElementById('contact-form');
                      contactSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Request Access
                  </Button>}
              </div>
            </div>
          </div>
        </nav>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] text-center py-12">
          {/* Badge */}
          <div className="inline-flex items-center justify-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold text-sm mb-8 border border-white/30">
            🤖 Revolutionary Agentic Commerce
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-white mb-6 px-2 leading-tight font-montserrat">
            AI-Powered Shopping<br className="hidden sm:block" /> Assistant
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-10 sm:mb-12 max-w-4xl mx-auto px-4 leading-relaxed font-light">
            Transform your online store with an intelligent AI agent that guides customers and drives conversions
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Button 
              size="lg"
              onClick={() => window.open('/store/sim', '_blank')}
              className="bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-white/20 h-14 px-8 text-base font-semibold transition-all duration-300 hover:scale-105"
            >
              View Live Demo
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => {
                const contactSection = document.getElementById('contact-form');
                contactSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-transparent text-white border-2 border-white/50 hover:bg-white/10 hover:border-white h-14 px-8 text-base font-semibold backdrop-blur-sm transition-all duration-300"
            >
              Request Access
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-80">
            <div className="text-white/70 text-sm font-medium">Trusted by innovative brands</div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <HowItWorksLanding />

      {/* Pricing Section */}
      <PricingLanding />

      {/* Contact Form */}
      <div id="contact-form">
        <ContactFormLanding />
      </div>

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-white to-primary/5 border-t border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <img src={simLogoPurple} alt="SIM" className="h-10 sm:h-14 w-auto" />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-muted-foreground">
              <span>© 2025 SIM. All rights reserved.</span>
              <span className="hidden sm:block">•</span>
              <span className="font-medium bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Revolutionizing Commerce with AI
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Marketplace;