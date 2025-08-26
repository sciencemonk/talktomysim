
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSim } from "@/hooks/useSim";
import { AgentToggle } from "@/components/AgentToggle";
import { UserSettingsModal } from "@/components/UserSettingsModal";
import { PlanUpgradeModal } from "@/components/PlanUpgradeModal";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // TODO: Replace with actual user plan and credits from database
  const userPlan = 'free'; // Default new users to free
  const userCredits = 25; // Example: 25 out of 30 free credits remaining

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

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true);
  };

  const handleUpgradeClick = () => {
    setIsUpgradeModalOpen(true);
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'free': return 'Free';
      case 'plus': return 'Plus';
      case 'pro': return 'Pro';
      default: return 'Free';
    }
  };

  const getPlanCredits = (plan: string) => {
    switch (plan) {
      case 'free': return 30;
      case 'plus': return 100;
      case 'pro': return 1000;
      default: return 30;
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
              <span className="text-xs text-muted-foreground">
                {getPlanDisplayName(userPlan)} • {userCredits}/{getPlanCredits(userPlan)} credits
              </span>
            </div>
        )}
      </div>
    </Button>
  );

  return (
    <>
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
              <span className="text-xs text-muted-foreground">
                {getPlanDisplayName(userPlan)} • {userCredits}/{getPlanCredits(userPlan)} credits
              </span>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-base font-medium">Sim Status</span>
              <span className="text-xs text-muted-foreground">(Online/Offline)</span>
            </div>
            <div className="flex items-center">
              <Switch 
                checked={sim?.is_active ?? true}
                onCheckedChange={() => {}}
                onClick={handleToggleActive}
                className="data-[state=checked]:bg-brand-purple"
              />
              <span className="ml-2 text-sm font-medium">
                {(sim?.is_active ?? true) ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={handleUpgradeClick}
        >
          <Crown className="h-4 w-4 text-yellow-500" />
          <span>Upgrade</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={handleSettingsClick}
        >
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

    {/* Settings Modal */}
    <UserSettingsModal 
      isOpen={isSettingsModalOpen}
      onClose={() => setIsSettingsModalOpen(false)}
    />

    {/* Plan Upgrade Modal */}
    <PlanUpgradeModal 
      isOpen={isUpgradeModalOpen}
      onClose={() => setIsUpgradeModalOpen(false)}
      currentPlan={userPlan}
      currentCredits={userCredits}
    />
  </>
  );
};

export default UserSettingsDropdown;
