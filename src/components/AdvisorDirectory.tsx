
import { useState, useEffect } from "react";
import BotCheck from "@/components/BotCheck";
import { useAdvisors } from "@/hooks/useAdvisors";
import { useAllAdvisors } from "@/hooks/useAllAdvisors";
import { useUserAdvisors } from "@/hooks/useUserAdvisors";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Star, Sparkles, Menu, Award, History, Mail, Bot, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarContent } from "@/components/UserSidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AgentType } from "@/types/agent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import pumpLogo from "@/assets/pumpfun-logo.png";

interface AdvisorDirectoryProps {
  onSelectAdvisor: (advisorId: string, advisor?: AgentType) => void;
  onAuthRequired?: () => void;
}

interface PumpFunAgentCardProps {
  advisor: AgentType;
  isPumpFunAgent: boolean;
  contractAddress?: string;
  onClick: () => void;
}

const PumpFunAgentCard = ({ advisor, isPumpFunAgent, contractAddress, onClick }: PumpFunAgentCardProps) => {
  const [marketCapData, setMarketCapData] = useState<{ marketCap?: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMarketCap = async () => {
      if (!isPumpFunAgent || !contractAddress) return;
      
      setIsLoading(true);
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase.functions.invoke('analyze-pumpfun-token', {
          body: { tokenAddress: contractAddress },
        });

        if (!error && data?.success && data?.tokenData) {
          setMarketCapData({ marketCap: data.tokenData.usd_market_cap });
        }
      } catch (error) {
        console.error('[PumpFunAgentCard] Error fetching market cap:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketCap();
  }, [isPumpFunAgent, contractAddress]);

  const formatMarketCap = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow group overflow-hidden"
      onClick={onClick}
    >
      {/* Image at the top */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
        {advisor.avatar ? (
          <img
            src={advisor.avatar}
            alt={advisor.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <span className="text-6xl font-bold text-primary">
              {advisor.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <CardHeader className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-lg">{advisor.name}</CardTitle>
            {advisor.is_featured && (
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {advisor.is_official && advisor.sim_type === 'historical' && (
              <Badge variant="gradient" className="text-xs">
                <Award className="h-3 w-3 mr-1" />
                Official Historical Sim
              </Badge>
            )}
            {isPumpFunAgent && (
              <Badge variant="outline" className="text-xs flex items-center gap-1 bg-background">
                <img src={pumpLogo} alt="PumpFun" className="h-3 w-3" />
                Agent
              </Badge>
            )}
          </div>
          <CardDescription className="text-sm">
            {advisor.title || "Advisor"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {advisor.description}
        </p>
        {isPumpFunAgent && marketCapData?.marketCap && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-xs text-muted-foreground">Market Cap:</span>
            <span className="text-sm font-semibold text-primary">
              {formatMarketCap(marketCapData.marketCap)}
            </span>
          </div>
        )}
        {isPumpFunAgent && isLoading && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-xs text-muted-foreground">Loading market cap...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdvisorDirectory = ({ onSelectAdvisor, onAuthRequired }: AdvisorDirectoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showBotCheck, setShowBotCheck] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<AgentType | null>(null);
  const [simTypeFilter, setSimTypeFilter] = useState<'all' | 'Crypto Mail' | 'Chat' | 'Autonomous Agent'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const { user } = useAuth();
  const { advisors, isLoading } = useAdvisors();
  const { agents: allAdvisors, isLoading: isLoadingAll } = useAllAdvisors();
  const { advisorsAsAgents, removeAdvisor } = useUserAdvisors();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "crypto", label: "Crypto & Web3" },
    { value: "historical", label: "Historical Figures" },
    { value: "influencers", label: "Influencers & Celebrities" },
    { value: "fictional", label: "Fictional Characters" },
    { value: "education", label: "Education & Tutoring" },
    { value: "business", label: "Business & Finance" },
    { value: "lifestyle", label: "Lifestyle & Wellness" },
    { value: "entertainment", label: "Entertainment & Games" },
    { value: "spiritual", label: "Spiritual & Philosophy" },
  ];

  const handleAdvisorClick = (advisor: AgentType) => {
    // If user is signed in, open chat directly in-app
    if (user) {
      navigate(`/home?sim=${advisor.id}`);
      return;
    }
    
    // If not signed in and it's a living sim with custom_url, go to their landing page
    if (advisor.sim_type === 'living' && advisor.custom_url) {
      navigate(`/${advisor.custom_url}`);
      return;
    }
    
    // Otherwise, show bot check for anonymous users
    setSelectedAdvisor(advisor);
    setShowBotCheck(true);
  };

  const handleBotCheckComplete = () => {
    setShowBotCheck(false);
    if (selectedAdvisor) {
      onSelectAdvisor(selectedAdvisor.id, selectedAdvisor);
      setSelectedAdvisor(null);
    }
  };

  const handleBotCheckCancel = () => {
    setShowBotCheck(false);
    setSelectedAdvisor(null);
  };

  const handleAdvisorSelect = async (advisor: AgentType) => {
    // Allow immediate chat for all users
    onSelectAdvisor(advisor.id, advisor);
  };

  const handleRemovePublicAdvisor = async (advisorId: string) => {
    try {
      await removeAdvisor(advisorId);
    } catch (error) {
      console.error("Failed to remove advisor:", error);
    }
  };

  // When Chatbots is selected and user clicks it again, show categories
  const handleTypeChange = (value: string) => {
    if (value === simTypeFilter && value === 'Chat') {
      // If clicking Chatbots again, reset to show all categories
      setCategoryFilter('all');
    } else {
      setSimTypeFilter(value as any);
      // Reset category when changing type
      if (value !== 'Chat') {
        setCategoryFilter('all');
      }
    }
  };

  // Filter advisors based on search term, sim type, and category
  const filteredAdvisors = allAdvisors
    .filter(advisor => {
      const matchesSearch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           advisor.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Type filter
      const simCategory = (advisor as any).sim_category;
      if (simTypeFilter === 'all') return true;
      if (simTypeFilter === 'Crypto Mail') return simCategory === 'Crypto Mail';
      if (simTypeFilter === 'Chat') {
        const isChat = simCategory === 'Chat' || !simCategory || simCategory === '';
        if (!isChat) return false;
        
        // Apply category filter for Chat type
        if (categoryFilter !== 'all') {
          const advisorCategory = (advisor as any).marketplace_category?.toLowerCase() || 'uncategorized';
          return advisorCategory === categoryFilter;
        }
        return true;
      }
      
      return false;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search sims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Type Filters */}
          <div className="mb-6 space-y-4">
            {isMobile ? (
              <Select value={simTypeFilter} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground z-50">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Autonomous Agent" disabled>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Autonomous Agent
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 ml-2">
                        Coming Soon
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="Chat">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      Chatbots
                    </div>
                  </SelectItem>
                  <SelectItem value="Crypto Mail">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Crypto Mail
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Tabs value={simTypeFilter} onValueChange={handleTypeChange}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all">All Types</TabsTrigger>
                  <TabsTrigger value="Autonomous Agent" disabled className="flex items-center gap-2 opacity-50">
                    <Zap className="h-4 w-4" />
                    Autonomous Agent
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 ml-1">
                      Coming Soon
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="Chat" className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Chatbots
                  </TabsTrigger>
                  <TabsTrigger value="Crypto Mail" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Crypto Mail
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Category filters - only show when Chatbots is selected */}
            {simTypeFilter === 'Chat' && (
              isMobile ? (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {categories.find(c => c.value === categoryFilter)?.label || 'All Categories'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border z-[100] max-h-[300px]">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat.value}
                      variant={categoryFilter === cat.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategoryFilter(cat.value)}
                    >
                      {cat.label}
                    </Button>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Advisors Grid */}
          {isLoadingAll ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="w-full aspect-[16/9] bg-muted" />
                  <CardHeader className="space-y-4 p-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-5/6" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAdvisors.map((advisor) => {
                const isPumpFunAgent = (advisor as any).sim_category === 'PumpFun Agent';
                const contractAddress = isPumpFunAgent 
                  ? (advisor.social_links as any)?.contract_address 
                  : undefined;

                return (
                  <PumpFunAgentCard
                    key={advisor.id}
                    advisor={advisor}
                    isPumpFunAgent={isPumpFunAgent}
                    contractAddress={contractAddress}
                    onClick={() => handleAdvisorClick(advisor)}
                  />
                );
              })}
            </div>
          )}

          {filteredAdvisors.length === 0 && !isLoadingAll && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No sims found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {showBotCheck && (
        <BotCheck
          onVerificationComplete={handleBotCheckComplete}
          onCancel={handleBotCheckCancel}
        />
      )}
    </div>
  );
};

export default AdvisorDirectory;
