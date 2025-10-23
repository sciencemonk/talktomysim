
import { useState, useEffect } from "react";
import BotCheck from "@/components/BotCheck";
import { useAdvisors } from "@/hooks/useAdvisors";
import { useAllAdvisors } from "@/hooks/useAllAdvisors";
import { useUserAdvisors } from "@/hooks/useUserAdvisors";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Star, Sparkles, Menu, Award, History } from "lucide-react";
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

interface AdvisorDirectoryProps {
  onSelectAdvisor: (advisorId: string, advisor?: AgentType) => void;
  onAuthRequired?: () => void;
}

const AdvisorDirectory = ({ onSelectAdvisor, onAuthRequired }: AdvisorDirectoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showBotCheck, setShowBotCheck] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<AgentType | null>(null);
  const [simFilter, setSimFilter] = useState<'historical' | 'living'>('historical');
  
  const { user } = useAuth();
  const { advisors, isLoading } = useAdvisors();
  const { agents: allAdvisors, isLoading: isLoadingAll } = useAllAdvisors();
  const { advisorsAsAgents, removeAdvisor } = useUserAdvisors();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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

  // Featured sims to show first (most popular/recognizable)
  const featuredSimNames = [
    'Socrates', 'Plato', 'Aristotle', 'Albert Einstein', 'Marie Curie',
    'Mahatma Gandhi', 'Martin Luther King Jr.', 'Nelson Mandela',
    'Leonardo da Vinci', 'Nikola Tesla', 'Ada Lovelace', 'Rosa Parks',
    'Abraham Lincoln', 'Winston Churchill', 'Napoleon', 'Cleopatra',
    'Alexander the Great', 'Joan of Arc', 'Sun Tzu', 'Confucius'
  ];

  // Filter advisors based on search term and sim type
  const filteredAdvisors = allAdvisors
    .filter(advisor => {
      const matchesSearch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           advisor.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by sim type from database
      const matchesType = simFilter === 'historical' 
        ? (!advisor.sim_type || advisor.sim_type === 'historical')
        : advisor.sim_type === 'living';
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      // If no search term, prioritize featured sims
      if (!searchTerm) {
        const aIsFeatured = featuredSimNames.includes(a.name);
        const bIsFeatured = featuredSimNames.includes(b.name);
        
        if (aIsFeatured && !bIsFeatured) return -1;
        if (!aIsFeatured && bIsFeatured) return 1;
        
        // Both featured: sort by order in featuredSimNames
        if (aIsFeatured && bIsFeatured) {
          return featuredSimNames.indexOf(a.name) - featuredSimNames.indexOf(b.name);
        }
      }
      
      // Default: alphabetical
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search sims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Mobile: Dropdown */}
            {isMobile ? (
              <Select value={simFilter} onValueChange={(value) => setSimFilter(value as 'historical' | 'living')}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {simFilter === 'historical' ? (
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Historical Figures
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Living
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground z-50">
                  <SelectItem value="historical" className="text-foreground hover:bg-muted">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Historical Figures
                    </div>
                  </SelectItem>
                  <SelectItem value="living" className="text-foreground hover:bg-muted">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Living
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              /* Desktop: Tabs */
              <Tabs value={simFilter} onValueChange={(value) => setSimFilter(value as 'historical' | 'living')} className="w-auto">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="historical" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Historical
                  </TabsTrigger>
                  <TabsTrigger value="living" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Living
                  </TabsTrigger>
                </TabsList>
              </Tabs>
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
              {filteredAdvisors.map((advisor) => (
                <Card 
                  key={advisor.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow group overflow-hidden"
                  onClick={() => handleAdvisorClick(advisor)}
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
                      </div>
                      <CardDescription className="text-sm">
                        {advisor.title || "Advisor"}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {advisor.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
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
