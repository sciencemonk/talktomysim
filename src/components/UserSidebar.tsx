import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, MessageCircle, User, Sparkles, Brain, BookOpen, Home, X, Settings, Crown, Bot, Zap } from "lucide-react";
import { AgentType } from "@/types/agent";
import { useIsMobile } from "@/hooks/use-mobile";
import UserSettingsDropdown from "./UserSettingsDropdown";
interface UserSidebarProps {
  selectedAgent?: AgentType | null;
  selectedPublicAdvisorId?: string | null;
  selectedPublicAdvisors?: AgentType[];
  onSelectAgent?: (agent: AgentType) => void;
  onSelectPublicAdvisor?: (advisorId: string, advisor?: AgentType) => void;
  onRemovePublicAdvisor?: (advisorId: string) => void;
  onShowAdvisorDirectory?: () => void;
  onNavigateToMySim?: () => void;
  onNavigateToBasicInfo?: () => void;
  onNavigateToInteractionModel?: () => void;
  onNavigateToCoreKnowledge?: () => void;
  onNavigateToIntegrations?: () => void;
  activeView?: string;
  onAuthRequired?: () => void; // Add this prop to trigger auth modal
}
export interface SidebarContentProps extends UserSidebarProps {
  onClose?: () => void;
}
export const SidebarContent: React.FC<SidebarContentProps> = ({
  selectedAgent,
  selectedPublicAdvisorId,
  selectedPublicAdvisors = [],
  onSelectAgent,
  onSelectPublicAdvisor,
  onRemovePublicAdvisor,
  onShowAdvisorDirectory,
  onNavigateToMySim,
  onNavigateToBasicInfo,
  onNavigateToInteractionModel,
  onNavigateToCoreKnowledge,
  onNavigateToIntegrations,
  activeView,
  onClose,
  onAuthRequired
}) => {
  const {
    user
  } = useAuth();
  const menuItems = [{
    icon: User,
    label: "My Sim",
    onClick: () => {
      onNavigateToMySim?.();
      onClose?.();
    },
    viewKey: "my-sim"
  }, {
    icon: Sparkles,
    label: "Basic Info",
    onClick: () => {
      onNavigateToBasicInfo?.();
      onClose?.();
    },
    viewKey: "basic-info"
  }, {
    icon: Brain,
    label: "Interaction Model",
    onClick: () => {
      onNavigateToInteractionModel?.();
      onClose?.();
    },
    viewKey: "interaction-model"
  }, {
    icon: BookOpen,
    label: "Core Knowledge",
    onClick: () => {
      onNavigateToCoreKnowledge?.();
      onClose?.();
    },
    viewKey: "core-knowledge"
  }, {
    icon: Zap,
    label: "Integrations",
    onClick: () => {
      onNavigateToIntegrations?.();
      onClose?.();
    },
    viewKey: "integrations"
  }, {
    icon: Search,
    label: "Search",
    onClick: () => {
      onShowAdvisorDirectory?.();
      onClose?.();
    },
    viewKey: "search"
  }];
  const userTrigger = user ? <Button variant="ghost" className="w-full justify-start p-3 h-auto">
      <div className="flex items-center space-x-3 w-full">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
          <AvatarFallback>
            {user?.email?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-fg truncate">
            {user?.user_metadata?.full_name || "User"}
          </p>
          <p className="text-xs text-fgMuted truncate">
            {user?.email}
          </p>
        </div>
      </div>
    </Button> : null;
  return <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" alt="Logo" className="h-8 w-8 object-contain" />
            <h2 className="text-lg font-semibold text-fg">Sim</h2>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {user ?
        // Show navigation menu for signed-in users
        <div className="space-y-2">
              {menuItems.map((item, index) => {
            const isActive = activeView === item.viewKey;
            return <Button key={index} variant="ghost" className={`w-full justify-start text-left ${isActive ? "bg-primary/10 text-primary border border-primary/20" : "text-fgMuted hover:text-fg hover:bg-bgMuted"}`} onClick={item.onClick}>
                    <item.icon className="mr-3 h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                  </Button>;
          })}
            </div> :
        // Show "Create your free Sim today" for non-signed-in users
        <div className="space-y-4 text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-fg">
                  Create your free Sim today
                </h3>
                
              </div>
              
              <Button onClick={() => {
            onAuthRequired?.();
            onClose?.();
          }} className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90" size="lg">
                Get Started
              </Button>
            </div>}
        </div>
      </ScrollArea>

      {/* User Info at Bottom - only show for signed-in users */}
      {user && <>
          <Separator />
          <div className="p-4">
            <UserSettingsDropdown trigger={userTrigger} simplified={true} />
          </div>
        </>}
    </div>;
};
const UserSidebar: React.FC<UserSidebarProps> = props => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return null; // Mobile sidebar is handled in Home component with Sheet
  }
  return <div className="fixed left-0 top-0 h-screen w-80 z-40">
      <SidebarContent {...props} />
    </div>;
};
export default UserSidebar;