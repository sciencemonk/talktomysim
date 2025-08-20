
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserAdvisors } from "@/hooks/useUserAdvisors";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, User, Plus, MessageSquare, Bot } from "lucide-react";
import { UserAdvisor } from "@/services/userAdvisorService";
import { useIsMobile } from "@/hooks/use-mobile";
import AdvisorSearchModal from "./AdvisorSearchModal";
import { Advisor } from "@/types/advisor";

interface AgentUserSidebarProps {
  onShowSettings: () => void;
  onShowChildProfile: () => void;
  selectedAdvisor: UserAdvisor | null;
  onSelectAdvisor: (advisor: UserAdvisor) => void;
  refreshTrigger: number;
}

const AgentUserSidebar = ({
  onShowSettings,
  onShowChildProfile,
  selectedAdvisor,
  onSelectAdvisor,
  refreshTrigger
}: AgentUserSidebarProps) => {
  const { user } = useAuth();
  const { userAdvisors, addAdvisor, isLoading } = useUserAdvisors();
  const isMobile = useIsMobile();
  const [showAdvisorSearch, setShowAdvisorSearch] = useState(false);

  const handleAdvisorSelect = async (advisor: Advisor) => {
    setShowAdvisorSearch(false);
    
    // Add advisor to user's collection
    const userAdvisor = await addAdvisor(advisor);
    if (userAdvisor) {
      onSelectAdvisor(userAdvisor);
    }
  };

  const handleAdvisorClick = (advisor: UserAdvisor) => {
    onSelectAdvisor(advisor);
  };

  const sidebarContent = (
    <>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Think With Me</h2>
          <Button
            onClick={() => setShowAdvisorSearch(true)}
            size="sm"
            variant="default"
            className="rounded-full px-6"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create New
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <span>{user?.user_metadata?.full_name || user?.email}</span>
        </div>
        <div className="flex gap-1">
          <Button
            onClick={onShowChildProfile}
            size="sm"
            variant="ghost"
            className="text-xs"
          >
            <User className="h-3 w-3 mr-1" />
            Profile
          </Button>
          <Button
            onClick={onShowSettings}
            size="sm"
            variant="ghost"
            className="text-xs"
          >
            <Settings className="h-3 w-3 mr-1" />
            Settings
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
                <Plus className="h-4 w-4 mr-2" />
                Find Advisors
              </Button>
            </div>
          ) : (
            userAdvisors.map((advisor) => (
              <Card
                key={advisor.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedAdvisor?.id === advisor.id ? 'bg-primary/10 border-primary' : ''
                }`}
                onClick={() => handleAdvisorClick(advisor)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={advisor.avatar_url} alt={advisor.name} />
                      <AvatarFallback>
                        <Bot className="h-5 w-5" />
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

      <AdvisorSearchModal
        isOpen={showAdvisorSearch}
        onClose={() => setShowAdvisorSearch(false)}
        onAdvisorSelect={handleAdvisorSelect}
      />
    </>
  );

  if (isMobile) {
    return (
      <div className="w-full border-b bg-muted/30">
        {sidebarContent}
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col">
      {sidebarContent}
    </div>
  );
};

export default AgentUserSidebar;
