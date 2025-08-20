
import { useLocation } from "react-router-dom";
import { 
  Bot, 
  PlusCircle,
  LogOut, 
  CreditCard,
  Settings,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAgents } from "@/hooks/useAgents";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AgentType } from "@/types/agent";

interface UserSidebarProps {
  onShowBilling?: () => void;
  onShowSettings?: () => void;
  onShowChildProfile?: () => void;
  onShowAgents?: () => void;
  onShowAgentCreate?: () => void;
  selectedAgent?: AgentType | null;
  onSelectAgent?: (agent: AgentType) => void;
}

const UserSidebar = ({ 
  onShowBilling, 
  onShowSettings, 
  onShowChildProfile, 
  onShowAgents,
  onShowAgentCreate,
  selectedAgent,
  onSelectAgent
}: UserSidebarProps) => {
  const { user, signOut } = useAuth();
  const { agents, isLoading } = useAgents();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAgentSelect = (agent: AgentType) => {
    console.log('Agent selected:', agent.name, agent.id);
    onSelectAgent?.(agent);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={cn(
      "bg-card border-r border-border flex flex-col h-screen transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header with Logo and Toggle */}
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/55ccce33-98a1-45d2-9e9e-7b446a02a417.png" 
              alt="Think With Me" 
              className="h-8 w-8"
            />
            <h1 className="font-semibold text-lg">Think With Me</h1>
          </div>
        )}
        {isCollapsed && (
          <img 
            src="/lovable-uploads/55ccce33-98a1-45d2-9e9e-7b446a02a417.png" 
            alt="Think With Me" 
            className="h-8 w-8 mx-auto"
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Separator />

      {/* Navigation Items */}
      <div className="flex-1 p-3 space-y-1">
        {/* Create New Button */}
        {onShowAgentCreate && (
          <Button
            onClick={onShowAgentCreate}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors bg-primary text-primary-foreground hover:bg-primary/90 w-full justify-start"
            size="sm"
          >
            <PlusCircle className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Create New</span>}
          </Button>
        )}

        {/* Agents List */}
        <div className="mt-4 space-y-1">
          {isLoading ? (
            <div className={cn(
              "px-3 py-2 text-xs text-muted-foreground",
              isCollapsed && "text-center"
            )}>
              {isCollapsed ? "..." : "Loading thinking partners..."}
            </div>
          ) : agents.length > 0 ? (
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
                <Bot className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="truncate text-left">{agent.name}</span>}
              </Button>
            ))
          ) : (
            <div className={cn(
              "px-3 py-2 text-xs text-muted-foreground",
              isCollapsed && "text-center"
            )}>
              {isCollapsed ? "0" : "No thinking partners yet"}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* User Profile Section */}
      <div className="p-3 space-y-2">
        {/* Usage/Billing Info */}
        {onShowBilling && !isCollapsed && (
          <button
            onClick={onShowBilling}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground w-full text-left"
          >
            <CreditCard className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="text-xs">Usage</span>
              <span className="text-primary font-medium">0.0 hours left</span>
            </div>
          </button>
        )}

        {/* User Info with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors w-full",
              isCollapsed && "justify-center"
            )}>
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
                <AvatarFallback>
                  {user?.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
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
              <DropdownMenuItem onClick={onShowChildProfile}>
                <User className="mr-2 h-4 w-4" />
                <span>Child Profile</span>
              </DropdownMenuItem>
            )}
            {onShowSettings && (
              <DropdownMenuItem onClick={onShowSettings}>
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
    </div>
  );
};

export default UserSidebar;
