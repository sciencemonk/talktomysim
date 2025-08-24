import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSim } from "@/hooks/useSim";
import { AgentType } from "@/types/agent";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  User,
  MessageSquare,
  Brain,
  Settings,
  Search,
  Trash2,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";
import UserSettingsDropdown from "./UserSettingsDropdown";

interface UserSidebarProps {
  selectedAgent: AgentType | null;
  selectedPublicAdvisorId: string | null;
  selectedPublicAdvisors: AgentType[];
  onSelectAgent: (agent: AgentType) => void;
  onSelectPublicAdvisor: (advisorId: string, advisor?: AgentType) => void;
  onRemovePublicAdvisor: (advisorId: string) => void;
  onShowAdvisorDirectory: () => void;
  onNavigateToMySim: () => void;
  onNavigateToBasicInfo: () => void;
  onNavigateToInteractionModel: () => void;
  onNavigateToCoreKnowledge: () => void;
  onNavigateToIntegrations: () => void;
  onNavigateToActions: () => void;
  onNavigateToSearch: () => void;
  onNavigateToTalkToSim: () => void;
  activeView: string;
  onAuthRequired?: () => void;
}

interface SidebarContentProps extends UserSidebarProps {
  onClose?: () => void;
}

export const SidebarContent = ({
  selectedAgent,
  selectedPublicAdvisorId,
  selectedPublicAdvisors,
  onSelectAgent,
  onSelectPublicAdvisor,
  onRemovePublicAdvisor,
  onShowAdvisorDirectory,
  onNavigateToMySim,
  onNavigateToBasicInfo,
  onNavigateToInteractionModel,
  onNavigateToCoreKnowledge,
  onNavigateToIntegrations,
  onNavigateToActions,
  onNavigateToSearch,
  onNavigateToTalkToSim,
  activeView,
  onClose,
  onAuthRequired
}: SidebarContentProps) => {
  const { user } = useAuth();
  const { completionStatus, sim } = useSim();

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {user && (
              <>
                {/* My Sim Section with Logo */}
                <div className="pt-4">
                  <div className="flex items-center justify-center mb-6">
                    <img 
                      src="/lovable-uploads/df065858-3d57-47a9-a087-d06ad0f65397.png" 
                      alt="My Sim Logo" 
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <Button
                      variant={activeView === 'talk-to-sim' ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => {
                        onNavigateToTalkToSim();
                        onClose?.();
                      }}
                      className="w-full justify-start h-9"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Talk to My Sim
                    </Button>
                    
                    <Button
                      variant={activeView === 'my-sim' ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => {
                        onNavigateToMySim();
                        onClose?.();
                      }}
                      className="w-full justify-start h-9"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Conversations
                    </Button>
                    
                    <Button
                      variant={activeView === 'basic-info' ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => {
                        onNavigateToBasicInfo();
                        onClose?.();
                      }}
                      className="w-full justify-start h-9"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Context Window
                    </Button>
                    
                    <Button
                      variant={activeView === 'integrations' ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => {
                        onNavigateToIntegrations();
                        onClose?.();
                      }}
                      className="w-full justify-start h-9"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Integrations
                    </Button>
                    
                    <Button
                      variant={activeView === 'interaction-model' ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => {
                        onNavigateToInteractionModel();
                        onClose?.();
                      }}
                      className="w-full justify-start h-9"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Interaction Model
                    </Button>
                    
                    <Button
                      variant={activeView === 'core-knowledge' ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => {
                        onNavigateToCoreKnowledge();
                        onClose?.();
                      }}
                      className="w-full justify-start h-9"
                    >
                      <Brain className="mr-2 h-4 w-4" />
                      Vector Embedding
                    </Button>
                  </div>
                </div>

                {/* Public Advisors Section */}
                {selectedPublicAdvisorId && (
                  <div className="pt-4">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
                      Public Advisor
                    </h3>
                    <div className="space-y-1">
                      {selectedPublicAdvisors.filter(advisor => advisor.id === selectedPublicAdvisorId).map((advisor) => (
                        <div key={advisor.id} className="flex items-center space-x-2 px-2 py-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={advisor.avatar} alt={advisor.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {advisor.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{advisor.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemovePublicAdvisor(advisor.id)}
                            className="ml-auto hover:bg-red-500/10 text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Button - moved to bottom */}
                <div className="pt-4">
                  <Button
                    variant={activeView === 'search' ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => {
                      onNavigateToSearch();
                      onClose?.();
                    }}
                    className="w-full justify-start h-9"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </>
            )}

            {!user && (
              <div className="pt-4">
                <Button
                  onClick={() => {
                    onAuthRequired?.();
                    onClose?.();
                  }}
                  className="w-full"
                  variant="outline"
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* User Settings at Bottom - Single Avatar with Dropdown */}
        {user && (
          <div className="p-4 border-t border-border">
            <UserSettingsDropdown 
              simplified={true} 
              trigger={
                <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={sim?.avatar_url} alt={sim?.name || "User Avatar"} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {sim?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left flex-1 min-w-0">
                      <span className="text-sm font-medium truncate">
                        {sim?.full_name || sim?.name || user.email}
                      </span>
                      <span className="text-xs text-muted-foreground">Plus</span>
                    </div>
                  </div>
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

const UserSidebar = (props: UserSidebarProps) => {
  return (
    <div className="hidden md:block fixed left-0 top-0 h-full w-80 z-40">
      <SidebarContent {...props} />
    </div>
  );
};

export default UserSidebar;
