
import { useState, useEffect } from "react";
import { useAdvisors } from "@/hooks/useAdvisors";
import { useAllAdvisors } from "@/hooks/useAllAdvisors";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Star, Sparkles, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarContent } from "@/components/UserSidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AgentType } from "@/types/agent";

interface AdvisorDirectoryProps {
  onSelectAdvisor: (advisorId: string, advisor?: AgentType) => void;
  onAuthRequired?: () => void;
}

const AdvisorDirectory = ({ onSelectAdvisor, onAuthRequired }: AdvisorDirectoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAdvisors, setSelectedAdvisors] = useState<AgentType[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const { user } = useAuth();
  const { advisors, isLoading } = useAdvisors();
  const { agents: allAdvisors, isLoading: isLoadingAll } = useAllAdvisors();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const categories = [
    { id: "all", label: "All", icon: Users },
    { id: "featured", label: "Featured", icon: Star },
    { id: "new", label: "New", icon: Sparkles },
  ];

  const handleAdvisorSelect = async (advisor: AgentType) => {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    // Add to selected advisors if not already added
    const isAlreadySelected = selectedAdvisors.some(a => a.id === advisor.id);
    
    if (!isAlreadySelected) {
      setSelectedAdvisors(prev => [...prev, advisor]);
      
      toast({
        title: "Advisor Added",
        description: `${advisor.name} has been added to your advisors.`,
      });
    }
    
    onSelectAdvisor(advisor.id, advisor);
  };

  const handleRemoveAdvisor = (advisorId: string) => {
    setSelectedAdvisors(prev => prev.filter(a => a.id !== advisorId));
  };

  // Filter advisors based on search term and category
  const filteredAdvisors = allAdvisors.filter(advisor => {
    const matchesSearch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advisor.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === "all") return matchesSearch;
    if (selectedCategory === "featured") return matchesSearch && advisor.is_featured;
    if (selectedCategory === "new") return matchesSearch; // You might want to add a created_at filter here
    
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Mobile Header with Sidebar Toggle */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SidebarContent
                selectedPublicAdvisors={selectedAdvisors}
                onSelectPublicAdvisor={(advisorId, advisor) => {
                  if (advisor) {
                    onSelectAdvisor(advisorId, advisor);
                  }
                  setIsSheetOpen(false);
                }}
                onRemovePublicAdvisor={handleRemoveAdvisor}
                onShowAdvisorDirectory={() => {
                  setIsSheetOpen(false);
                }}
                onClose={() => setIsSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
              alt="Simulacra" 
              className="h-6 w-6"
            />
            <h1 className="font-semibold">Simulacra</h1>
          </div>
          
          <div className="w-10" /> {/* Spacer for balance */}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Choose an Advisor</h1>
            <p className="text-muted-foreground">
              Select from our curated collection of AI advisors, each with unique expertise and personality
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search advisors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Advisors Grid */}
          {isLoadingAll ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-muted h-12 w-12" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                <Card key={advisor.id} className="cursor-pointer hover:shadow-md transition-shadow group">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={advisor.avatar || ''} alt={advisor.name} />
                        <AvatarFallback>{advisor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{advisor.name}</CardTitle>
                          {advisor.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm">
                          {advisor.subject || "General Advisor"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {advisor.description}
                    </p>
                    <Button 
                      onClick={() => handleAdvisorSelect(advisor)}
                      className="w-full group-hover:bg-primary/90 transition-colors"
                    >
                      Start Conversation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredAdvisors.length === 0 && !isLoadingAll && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No advisors found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisorDirectory;
