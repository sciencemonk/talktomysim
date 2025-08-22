
import { useLocation } from "react-router-dom";
import { 
  Bot, 
  LogOut, 
  Settings,
  User,
  Menu,
  X,
  LogIn,
  Info,
  MessageSquare,
  Brain,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAgents } from "@/hooks/useAgents";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AgentType } from "@/types/agent";
import AuthModal from "./AuthModal";

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
  
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  // Navigation items for authenticated users
  const navigationItems = [
    {
      title: "My Sim",
      icon: Bot,
      href: "#",
      onClick: () => {
        // TODO: Navigate to My Sim page
        console.log("Navigate to My Sim");
        onClose?.();
      }
    },
    {
      title: "Basic Info",
      icon: Info,
      href: "#",
      onClick: () => {
        // TODO: Navigate to Basic Info page
        console.log("Navigate to Basic Info");
        onClose?.();
      }
    },
    {
      title: "Interaction Model",
      icon: MessageSquare,
      href: "#",
      onClick: () => {
        // TODO: Navigate to Interaction Model page
        console.log("Navigate to Interaction Model");
        onClose?.();
      }
    },
    {
      title: "Core Knowledge",
      icon: Brain,
      href: "#",
      onClick: () => {
        // TODO: Navigate to Core Knowledge page
        console.log("Navigate to Core Knowledge");
        onClose?.();
      }
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header with Logo and Toggle (Desktop only) */}
      {onToggleCollapse && (
        <>
          <div className="p-4 flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
                  alt="Sim" 
                  className="h-8 w-8 object-contain"
                />
                <h1 className="font-semibold text-lg">Sim</h1>
              </div>
            )}
            {isCollapsed && (
              <button 
                onClick={onToggleCollapse}
                onMouseEnter={() => setIsLogoHovered(true)}
                onMouseLeave={() => setIsLogoHovered(false)}
                className="h-8 w-8 mx-auto flex items-center justify-center hover:bg-muted rounded-md transition-colors cursor-pointer"
              >
                {isLogoHovered ? (
                  <img 
                    src="/lovable-uploads/414592e4-0cdf-4286-a371-903bef284fe3.png" 
                    alt="Open Sidebar" 
                    className="h-4 w-4"
                  />
                ) : (
                  <img 
                    src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
                    alt="Sim" 
                    className="h-8 w-8 object-contain"
                  />
                )}
              </button>
            )}
            {!isCollapsed && (
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
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Mobile Header */}
      {!onToggleCollapse && (
        <>
          <div className="p-4 flex items-center gap-3">
            <img 
              src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
              alt="Sim" 
              className="h-8 w-8 object-contain"
            />
            <h1 className="font-semibold text-lg">Sim</h1>
          </div>
          <Separator />
        </>
      )}

      {/* Navigation Items - Only show if user is authenticated */}
      {user && (
        <div className="flex-1 p-3 space-y-1 overflow-auto">
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

          {/* Navigation Links */}
          <div className={cn("space-y-1", agents.length > 0 && "mt-4")}>
            {(!isCollapsed || !onToggleCollapse) && (
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Navigation
              </div>
            )}
            {navigationItems.map((item) => (
              <Button
                key={item.title}
                onClick={item.onClick}
                variant="ghost"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full justify-start h-auto min-h-[40px]",
                  "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {(!isCollapsed || !onToggleCollapse) && <span className="truncate text-left">{item.title}</span>}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Non-authenticated state */}
      {!user && (
        <div className="flex-1 p-3 flex flex-col items-center justify-center space-y-4">
          {(!isCollapsed || !onToggleCollapse) && (
            <>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">Create your free Sim today.</p>
              </div>
              <Button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90 animate-pulse"
                size="lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Get Started
              </Button>
            </>
          )}
        </div>
      )}

      <Separator />

      {/* User Profile Section - Only show if user is authenticated */}
      {user && (
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
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal} 
      />
    </div>
  );
};

const UserSidebar = (props: UserSidebarProps) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // On mobile, return null to completely hide the desktop sidebar
  if (isMobile) {
    return null;
  }

  // On desktop, render with the full sidebar wrapper
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

// Export SidebarContent for use in mobile sheets
export { SidebarContent };
export default UserSidebar;
