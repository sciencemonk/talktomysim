
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  User, 
  Settings, 
  LogOut, 
  Bot, 
  PlusCircle,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Grid3X3
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

interface UserSidebarProps {
  onShowBilling?: () => void;
  onShowSettings?: () => void;
  onShowChildProfile?: () => void;
  onShowAgents?: () => void;
  onShowAgentCreate?: () => void;
}

const UserSidebar = ({ 
  onShowBilling, 
  onShowSettings, 
  onShowChildProfile, 
  onShowAgents,
  onShowAgentCreate 
}: UserSidebarProps) => {
  const { user, signOut } = useAuth();
  const { agents, isLoading } = useAgents();
  const location = useLocation();
  const [isHomeExpanded, setIsHomeExpanded] = useState(true);

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <img 
          src="/lovable-uploads/55ccce33-98a1-45d2-9e9e-7b446a02a417.png" 
          alt="Think With Me" 
          className="h-8 w-8"
        />
        <h1 className="font-semibold text-lg">Think With Me</h1>
      </div>

      <Separator />

      {/* Navigation Items */}
      <div className="flex-1 p-3 space-y-1">
        {/* Home Section */}
        <div>
          <button
            onClick={() => setIsHomeExpanded(!isHomeExpanded)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground w-full"
          >
            <Home className="h-4 w-4" />
            <span className="flex-1 text-left">Home</span>
            {isHomeExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {/* Thinking Partners List */}
          {isHomeExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {isLoading ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  Loading thinking partners...
                </div>
              ) : agents.length > 0 ? (
                agents.map((agent) => (
                  <Link
                    key={agent.id}
                    to={`/tutors/${agent.id}/chat`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive(`/tutors/${agent.id}/chat`)
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Bot className="h-3 w-3" />
                    <span className="truncate">{agent.name}</span>
                  </Link>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  No thinking partners yet
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Management Options */}
        <Separator className="my-3" />
        
        {onShowAgents && (
          <button
            onClick={onShowAgents}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground w-full text-left"
          >
            <Grid3X3 className="h-4 w-4" />
            Manage Partners
          </button>
        )}

        {onShowAgentCreate && (
          <button
            onClick={onShowAgentCreate}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground w-full text-left"
          >
            <PlusCircle className="h-4 w-4" />
            Create New
          </button>
        )}
      </div>

      <Separator />

      {/* User Profile Section */}
      <div className="p-3 space-y-2">
        {/* Usage/Billing Info */}
        {onShowBilling && (
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
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors w-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
                <AvatarFallback>
                  {user?.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">
                  {user?.user_metadata?.full_name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
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
