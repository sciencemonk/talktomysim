
import { useState, useEffect } from "react";
import { useAdvisors } from "@/hooks/useAdvisors";
import { useAllAdvisors } from "@/hooks/useAllAdvisors";
import { useUserAdvisors } from "@/hooks/useUserAdvisors";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Star, Sparkles, Menu, ExternalLink } from "lucide-react";
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

interface AdvisorDirectoryProps {
  onSelectAdvisor: (advisorId: string, advisor?: AgentType) => void;
  onAuthRequired?: () => void;
}

const AdvisorDirectory = ({ onSelectAdvisor, onAuthRequired }: AdvisorDirectoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const { user } = useAuth();
  const { advisors, isLoading } = useAdvisors();
  const { agents: allAdvisors, isLoading: isLoadingAll } = useAllAdvisors();
  const { advisorsAsAgents, removeAdvisor } = useUserAdvisors();
  const isMobile = useIsMobile();

  const handleAdvisorSelect = async (advisor: AgentType, event?: React.MouseEvent) => {
    // Check if it's a middle click, ctrl+click, or cmd+click (open in new tab)
    if (event && (event.ctrlKey || event.metaKey || event.button === 1)) {
      // Open in new tab
      window.open(`/tutors/${advisor.id}/chat`, '_blank');
      return;
    }

    // Regular click - check if user is logged in for internal navigation
    if (!user) {
      onAuthRequired?.();
      return;
    }

    onSelectAdvisor(advisor.id, advisor);
  };

  const handleRemovePublicAdvisor = async (advisorId: string) => {
    try {
      await removeAdvisor(advisorId);
    } catch (error) {
      console.error("Failed to remove advisor:", error);
    }
  };

  // Filter advisors based on search term only
  const filteredAdvisors = allAdvisors.filter(advisor => {
    const matchesSearch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advisor.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
                selectedPublicAdvisors={advisorsAsAgents}
                onSelectPublicAdvisor={(advisorId, advisor) => {
                  if (advisor) {
                    onSelectAdvisor(advisorId, advisor);
                  }
                  setIsSheetOpen(false);
                }}
                onRemovePublicAdvisor={handleRemovePublicAdvisor}
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
            <h1 className="font-semibold hidden sm:block">Simulacra</h1>
          </div>
          
          <div className="w-10" /> {/* Spacer for balance */}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* Search Only */}
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

          {/* Advisors Grid */}
          {isLoadingAll ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-4 p-4">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-muted h-12 w-12" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
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
                  className="cursor-pointer hover:shadow-md transition-shadow group relative"
                  onClick={(event) => handleAdvisorSelect(advisor, event)}
                  onAuxClick={(event) => handleAdvisorSelect(advisor, event)} // Handle middle click
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardHeader className="p-4">
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
                          {advisor.title || "Advisor"}
                        </CardDescription>
                      </div>
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
              <p className="text-muted-foreground">No advisors found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisorDirectory;
