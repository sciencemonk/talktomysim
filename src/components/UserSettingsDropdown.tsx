
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSim } from "@/hooks/useSim";
import { AgentToggle } from "@/components/AgentToggle";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, Crown } from "lucide-react";

interface UserSettingsDropdownProps {
  simplified?: boolean;
  trigger?: React.ReactNode;
}

const UserSettingsDropdown: React.FC<UserSettingsDropdownProps> = ({ 
  simplified = false, 
  trigger 
}) => {
  const { user, signOut } = useAuth();
  const { sim, toggleSimActive } = useSim();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleToggleActive = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sim) {
      await toggleSimActive(!sim.is_active);
    }
  };

  const defaultTrigger = (
    <Button variant="ghost" className="w-full justify-start p-2 h-auto">
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={sim?.avatar_url} alt={sim?.name || "User Avatar"} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {sim?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        {!simplified && (
          <div className="flex flex-col items-start text-left flex-1 min-w-0">
            <span className="text-sm font-medium truncate">
              {sim?.name || user?.email}
            </span>
            <span className="text-xs text-muted-foreground">Plus</span>
          </div>
        )}
      </div>
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={sim?.avatar_url} alt={sim?.name || "User Avatar"} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {sim?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-left flex-1 min-w-0">
              <span className="text-sm font-medium truncate">
                {sim?.name || user?.email}
              </span>
              <span className="text-xs text-muted-foreground">Plus</span>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Sim Status</span>
            <AgentToggle 
              isActive={sim?.is_active ?? true}
              onToggle={handleToggleActive}
            />
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
          <Crown className="h-4 w-4 text-yellow-500" />
          <span>Upgrade</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserSettingsDropdown;
