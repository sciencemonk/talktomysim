import { useLocation } from "react-router-dom";
import { 
  Bot, 
  PlusCircle,
  LogOut, 
  Settings,
  User,
  Menu,
  Star,
  MoreHorizontal,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAgents } from "@/hooks/useAgents";
import { useAdvisorRemoval } from "@/hooks/useAdvisorRemoval";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AgentType } from "@/types/agent";

interface UserSidebarProps {
  onShowSettings?: () => void;
  onShowChildProfile?: () => void;
  onShowAgents?: () => void;
  onShowAdvisorDirectory?: () => void;
  selectedAgent?: AgentType | null;
  selectedPublicAdvisorId?: string | null;
  selectedPublicAdvisors?: AgentType[];
  onSelectAgent?: (agent: AgentType) => void;
  onSelectPublicAdvisor?: (advisorId: string, advisor?: AgentType) => void;
  onRemovePublicAdvisor?: (advisorId: string) => void;
  refreshTrigger?: number;
}

const SidebarContent = ({ 
  onShowSettings, 
  onShowChildProfile, 
  onShowAgents,
  onShowAdvisorDirectory,
  selectedAgent,
  selectedPublicAdvisorId,
  selectedPublicAdvisors = [],
  onSelectAgent,
  onSelectPublicAdvisor,
  onRemovePublicAdvisor,
  refreshTrigger,
  isCollapsed,
  onToggleCollapse,
  onClose
}: UserSidebarProps & { 
  isCollapsed?: boolean; 
  onToggleCollapse?: () => void;
  onClose?: () => void;
}) => {
  const { user, signOut } = useAuth();
  const { agents, isLoading } = useAgents();
  const { handleRemoveAdvisor, removingAdvisorId, error } = useAdvisorRemoval(
    selectedPublicAdvisors,
    onRemovePublicAdvisor
  );
  
  const [hoveredAdvisorId, setHoveredAdvisorId] = useState<string | null>(null);
  const [showRemoveForAdvisor, setShowRemoveForAdvisor] = useState<string | null>(null);

  useEffect(() => {
    if (refreshTrigger) {
      console.log('Refreshing agents list due to update');
    }
  }, [refreshTrigger]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAgentSelect = (agent: AgentType) => {
    console.log('Agent selected:', agent.name, agent.id);
    onSelectAgent?.(agent);
    onClose?.(); // Close mobile drawer when agent is selected
  };

  const handlePublicAdvisorSelect = (advisorId: string) => {
    console.log('Public advisor selected:', advisorId);
    const advisor = selectedPublicAdvisors.find(a => a.id === advisorId);
    onSelectPublicAdvisor?.(advisorId, advisor);
    onClose?.(); // Close mobile drawer when advisor is selected
  };

  const handleShowAdvisorDirectory = () => {
    onShowAdvisorDirectory?.();
    onClose?.(); // Close mobile drawer
  };

  const handleAdvisorRemove = async (advisorId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await handleRemoveAdvisor(advisorId);
    setShowRemoveForAdvisor(null);
    setHoveredAdvisorId(null);
  };

  const handleAdvisorClick = (advisorId: string) => {
    if (showRemoveForAdvisor === advisorId) {
      setShowRemoveForAdvisor(null);
    } else {
      handlePublicAdvisorSelect(advisorId);
    }
  };

  return (
    <>
      {/* Header with Logo and Toggle (Desktop only) */}
      {onToggleCollapse && (
        <>
          <div className="p-4 flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/c31e3133-a65e-4f5d-a888-939a07968005.png" 
                  alt="Simulacra" 
                  className="h-8 w-8"
                />
                <h1 className="font-semibold text-lg">Simulacra</h1>
              </div>
            )}
            {isCollapsed && (
              <img 
                src="/lovable-uploads/c31e3133-a65e-4f5d-a888-939a07968005.png" 
                alt="Simulacra" 
                className="h-8 w-8 mx-auto"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-8 w-8 p-0"
            >
              <img 
                src="/lovable-uploads/414592e4-0cdf-4286-a371-903bef284fe3.png" 
                alt="Toggle Sidebar" 
                className="h-4 w-4"
              />
            </Button>
          </div>
          <Separator />
        </>
      )}

      {/* Mobile Header */}
      {!onToggleCollapse && (
        <>
          <div className="p-4 flex items-center gap-3">
            <img 
              src="/lovable-uploads/c31e3133-a65e-4f5d-a888-939a07968005.png" 
              alt="Simulacra" 
              className="h-8 w-8"
            />
            <h1 className="font-semibold text-lg">Simulacra</h1>
          </div>
          <Separator />
        </>
      )}

      {/* Navigation Items */}
      <div className="flex-1 p-3 space-y-1">
        {/* Personal Agents List - Only show if there are agents */}
        {agents.length > 0 && (
          <div className="space-y-1">
            {(!isCollapsed || !onToggleCollapse) && (
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Your Agents
              </div>
            )}
            {isLoading ? (
              <div className={cn(
                "px-3 py-2 text-xs text-muted-foreground",
                isCollapsed && onToggleCollapse && "text-center"
              )}>
                {(isCollapsed && onToggleCollapse) ? "..." : "Loading thinking partners..."}
              </div>
            ) : (
              agents.map((agent) => (
                <Button
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent)}
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full justify-start h-auto min-h-[40px]",
                    selectedAgent?.id === agent.id
                      ? "bg-primary/10 text-primary font-medium hover:bg-primary/15"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage src={agent.avatar} alt={agent.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      <Bot className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  {(!isCollapsed || !onToggleCollapse) && <span className="truncate text-left">{agent.name}</span>}
                </Button>
              ))
            )}
          </div>
        )}

        {/* Public Advisors Section */}
        {selectedPublicAdvisors.length > 0 && (
          <div className={cn("space-y-1", agents.length > 0 && "mt-4")}>
            {(!isCollapsed || !onToggleCollapse) && (
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Advisors
              </div>
            )}
            {selectedPublicAdvisors.map((advisor) => (
              <div
                key={advisor.id}
                className="relative group"
                onMouseEnter={() => setHoveredAdvisorId(advisor.id)}
                onMouseLeave={() => {
                  if (showRemoveForAdvisor !== advisor.id) {
                    setHoveredAdvisorId(null);
                  }
                }}
              >
                <Button
                  onClick={() => handleAdvisorClick(advisor.id)}
                  variant="ghost"
                  disabled={removingAdvisorId === advisor.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full justify-start h-auto min-h-[40px] relative",
                    selectedPublicAdvisorId === advisor.id && showRemoveForAdvisor !== advisor.id
                      ? "bg-primary/10 text-primary font-medium hover:bg-primary/15"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    showRemoveForAdvisor === advisor.id && "bg-red-50 hover:bg-red-100"
                  )}
                >
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage src={advisor.avatar} alt={advisor.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      <Star className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  {(!isCollapsed || !onToggleCollapse) && (
                    <span className="truncate text-left flex-1">
                      {removingAdvisorId === advisor.id ? "Removing..." : advisor.name}
                    </span>
                  )}
                  
                  {/* Three dots on hover */}
                  {hoveredAdvisorId === advisor.id && !showRemoveForAdvisor && !removingAdvisorId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRemoveForAdvisor(advisor.id);
                      }}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  )}
                </Button>

                {/* Remove button */}
                {showRemoveForAdvisor === advisor.id && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-100"
                      onClick={(e) => handleAdvisorRemove(advisor.id, e)}
                      disabled={removingAdvisorId === advisor.id}
                    >
                      Remove
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRemoveForAdvisor(null);
                        setHoveredAdvisorId(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="px-3 py-2 text-xs text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {/* New Advisor Button */}
        <Button
          onClick={handleShowAdvisorDirectory}
          variant="outline"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full justify-start",
            (agents.length > 0 || selectedPublicAdvisors.length > 0) && "mt-4"
          )}
          size="sm"
        >
          <PlusCircle className="h-4 w-4 flex-shrink-0" />
          {(!isCollapsed || !onToggleCollapse) && <span>New Advisor</span>}
        </Button>
      </div>

      <Separator />

      {/* User Profile Section */}
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors w-full",
              isCollapsed && onToggleCollapse && "justify-center"
            )}>
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
                <AvatarFallback>
                  {user?.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {(!isCollapsed || !onToggleCollapse) && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">
                    {user?.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {onShowChildProfile && (
              <DropdownMenuItem onClick={() => { onShowChildProfile(); onClose?.(); }}>
                <User className="mr-2 h-4 w-4" />
                <span>Child Profile</span>
              </DropdownMenuItem>
            )}
            {onShowSettings && (
              <DropdownMenuItem onClick={() => { onShowSettings(); onClose?.(); }}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

const UserSidebar = (props: UserSidebarProps) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Trigger Button - Fixed Position at Bottom Left */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="fixed bottom-6 left-4 z-50 h-12 w-12 p-0 bg-background border shadow-lg rounded-full"
            >
              <img 
                src="/lovable-uploads/bedcfe0a-1a02-47a0-b867-775e5713580a.png" 
                alt="Menu" 
                className="h-6 w-6"
              />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[85vh] max-h-[85vh]">
            <div className="flex flex-col h-full">
              <SidebarContent 
                {...props} 
                onClose={() => setIsDrawerOpen(false)} 
              />
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <div className={cn(
      "bg-card border-r border-border flex flex-col h-screen transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <SidebarContent 
        {...props} 
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleSidebar}
      />
    </div>
  );
};

export default UserSidebar;
