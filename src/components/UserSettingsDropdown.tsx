
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSim } from "@/hooks/useSim";
import { useUserPlan } from "@/hooks/useUserPlan";
import { AgentToggle } from "@/components/AgentToggle";
import { UserSettingsModal } from "@/components/UserSettingsModal";
import { PlanUpgradeModal } from "@/components/PlanUpgradeModal";
import EmbedModal from "@/components/EmbedModal";
import { STRIPE_PLANS } from "@/lib/stripe";
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
import { LogOut, Settings, Crown, Code } from "lucide-react";

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
  const { plan: userPlan, credits: userCredits, maxCredits, isLoading: planLoading } = useUserPlan();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);

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

  const handleEmbedClick = () => {
    setIsEmbedModalOpen(true);
  };

  const getPlanDisplayName = (plan: string) => {
    return STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]?.name || 'Free';
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
                {planLoading ? 'Loading...' : `${getPlanDisplayName(userPlan)} • ${userCredits}/${maxCredits} credits`}
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
                {planLoading ? 'Loading...' : `${getPlanDisplayName(userPlan)} • ${userCredits}/${maxCredits} credits`}
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
          onClick={handleEmbedClick}
        >
          <Code className="h-4 w-4 text-blue-500" />
          <span>Embed</span>
        </DropdownMenuItem>

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
      onPlanChanged={() => {
        // Refresh page or reload user data after plan change
        window.location.reload();
      }}
    />

    {/* Embed Modal */}
    <EmbedModal
      isOpen={isEmbedModalOpen}
      onClose={() => setIsEmbedModalOpen(false)}
      sim={sim}
    />
  </>
  );
};

export default UserSettingsDropdown;
