
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserAdvisors } from "@/hooks/useUserAdvisors";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageSquare, Plus } from "lucide-react";
import AdvisorSearchModal from "./AdvisorSearchModal";
import { UserAdvisor } from "@/services/userAdvisorService";
import { Advisor } from "@/types/advisor";

interface UserSidebarProps {
  onAdvisorSelect: (advisor: UserAdvisor) => void;
}

const UserSidebar = ({ onAdvisorSelect }: UserSidebarProps) => {
  const { user } = useAuth();
  const { userAdvisors, addAdvisor, isLoading } = useUserAdvisors();
  const [showAdvisorSearch, setShowAdvisorSearch] = useState(false);

  const handleAdvisorSelect = async (advisor: Advisor) => {
    setShowAdvisorSearch(false);
    
    // Add advisor to user's collection
    const userAdvisor = await addAdvisor(advisor);
    if (userAdvisor) {
      onAdvisorSelect(userAdvisor);
    }
  };

  const handleAdvisorClick = (advisor: UserAdvisor) => {
    onAdvisorSelect(advisor);
  };

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Advisors</h2>
          <Button
            onClick={() => setShowAdvisorSearch(true)}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-pulse">Loading advisors...</div>
            </div>
          ) : userAdvisors.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                No advisors yet
              </div>
              <Button
                onClick={() => setShowAdvisorSearch(true)}
                variant="outline"
                size="sm"
              >
                <Search className="h-4 w-4 mr-2" />
                Find Advisors
              </Button>
            </div>
          ) : (
            userAdvisors.map((advisor) => (
              <Card
                key={advisor.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => handleAdvisorClick(advisor)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={advisor.avatar_url} alt={advisor.name} />
                      <AvatarFallback>
                        {advisor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{advisor.name}</h3>
                      {advisor.title && (
                        <p className="text-xs text-muted-foreground truncate">
                          {advisor.title}
                        </p>
                      )}
                      {advisor.category && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {advisor.category}
                        </Badge>
                      )}
                    </div>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Advisor Search Modal */}
      <AdvisorSearchModal
        isOpen={showAdvisorSearch}
        onClose={() => setShowAdvisorSearch(false)}
        onAdvisorSelect={handleAdvisorSelect}
      />
    </div>
  );
};

export default UserSidebar;
