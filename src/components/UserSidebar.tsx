
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAgents } from "@/hooks/useAgents";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Plus, 
  MessageSquare, 
  Search,
  User,
  Settings,
  BarChart3,
  Users,
  X,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { AgentType } from "@/types/agent";
import UserSettingsDropdown from "./UserSettingsDropdown";
import AdvisorForm from "./AdvisorForm";

interface UserSidebarProps {
  selectedAgent?: AgentType | null;
  selectedPublicAdvisorId?: string | null;
  selectedPublicAdvisors: AgentType[];
  onSelectAgent?: (agent: AgentType) => void;
  onSelectPublicAdvisor?: (advisorId: string, advisor?: AgentType) => void;
  onRemovePublicAdvisor?: (advisorId: string) => void;
  onShowAdvisorDirectory: () => void;
  className?: string;
}

export const SidebarContent = ({ 
  selectedAgent, 
  selectedPublicAdvisorId, 
  selectedPublicAdvisors, 
  onSelectAgent, 
  onSelectPublicAdvisor, 
  onRemovePublicAdvisor,
  onShowAdvisorDirectory,
  onClose
}: UserSidebarProps & { onClose?: () => void }) => {
  const { user } = useAuth();
  const { agents, refetch } = useAgents();
  const location = useLocation();
  const [conversationsExpanded, setConversationsExpanded] = useState(true);
  const [isCreateSimOpen, setIsCreateSimOpen] = useState(false);

  const isOnHomePage = location.pathname === '/';

  const handleCreateSimSuccess = () => {
    setIsCreateSimOpen(false);
    refetch();
  };

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
              alt="Simulacra" 
              className="h-6 w-6"
            />
            <h1 className="font-semibold">Simulacra</h1>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Search Sims Button */}
          <Button 
            onClick={() => {
              onShowAdvisorDirectory();
              onClose?.();
            }}
            variant={isOnHomePage && !selectedAgent && !selectedPublicAdvisorId ? "secondary" : "ghost"}
            className="w-full justify-start gap-2"
          >
            <Search className="h-4 w-4" />
            Search Sims
          </Button>

          {user && (
            <>
              {/* My Sim Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-foreground">My Sim</h3>
                </div>
                
                <div className="ml-6 space-y-2">
                  {agents.length > 0 ? (
                    <>
                      {agents.map((agent) => (
                        <div key={agent.id} className="space-y-1">
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={agent.avatar || ''} />
                              <AvatarFallback className="text-xs">
                                <Bot className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium flex-1 truncate">{agent.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {agent.status}
                            </Badge>
                          </div>
                          
                          {/* Sim Management Actions */}
                          <div className="ml-8 space-y-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start gap-2 text-xs h-7"
                              onClick={() => setIsCreateSimOpen(true)}
                            >
                              <Settings className="h-3 w-3" />
                              Edit Sim
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start gap-2 text-xs h-7"
                              onClick={() => window.open(`/tutors/${agent.id}/chat`, '_blank')}
                            >
                              <Users className="h-3 w-3" />
                              View Public Page
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full gap-2"
                        onClick={() => setIsCreateSimOpen(true)}
                      >
                        <Plus className="h-3 w-3" />
                        Create Another Sim
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => setIsCreateSimOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Create Your Sim
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              {/* Conversations Section */}
              {selectedPublicAdvisors.length > 0 && (
                <div className="space-y-3">
                  <button
                    onClick={() => setConversationsExpanded(!conversationsExpanded)}
                    className="flex items-center gap-2 w-full text-left"
                  >
                    {conversationsExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">Conversations</h3>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {selectedPublicAdvisors.length}
                    </Badge>
                  </button>
                  
                  {conversationsExpanded && (
                    <div className="ml-6 space-y-1">
                      {selectedPublicAdvisors.map((advisor) => (
                        <div key={advisor.id} className="flex items-center gap-2 group">
                          <Button
                            variant={selectedPublicAdvisorId === advisor.id ? "secondary" : "ghost"}
                            size="sm"
                            className="flex-1 justify-start gap-2 h-8"
                            onClick={() => {
                              onSelectPublicAdvisor?.(advisor.id, advisor);
                              onClose?.();
                            }}
                          >
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={advisor.avatar || ''} />
                              <AvatarFallback className="text-xs">
                                {advisor.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-xs">{advisor.name}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                            onClick={() => onRemovePublicAdvisor?.(advisor.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {user && (
        <div className="p-4 border-t border-border">
          <UserSettingsDropdown />
        </div>
      )}

      {/* Create Sim Modal */}
      <AdvisorForm
        open={isCreateSimOpen}
        onOpenChange={setIsCreateSimOpen}
        advisor={null}
        onSuccess={handleCreateSimSuccess}
      />
    </div>
  );
};

const UserSidebar = (props: UserSidebarProps) => {
  return (
    <div className={`w-64 ${props.className || ''}`}>
      <SidebarContent {...props} />
    </div>
  );
};

export default UserSidebar;
