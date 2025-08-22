
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Plus,
  MessageCircle,
  User,
  Sparkles,
  Brain,
  BookOpen,
  Home,
  X,
  Settings,
  Crown,
  Bot
} from "lucide-react";
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
  activeView?: string; // Add this prop to track the active view
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
  activeView,
  onClose
}) => {
  const { user } = useAuth();

  const menuItems = [
    {
      icon: User,
      label: "My Sim",
      onClick: () => {
        onNavigateToMySim?.();
        onClose?.();
      },
      badge: user ? null : "Pro",
      isPro: !user,
      viewKey: "my-sim"
    },
    {
      icon: Sparkles,
      label: "Basic Info",
      onClick: () => {
        onNavigateToBasicInfo?.();
        onClose?.();
      },
      viewKey: "basic-info"
    },
    {
      icon: Brain,
      label: "Interaction Model",
      onClick: () => {
        onNavigateToInteractionModel?.();
        onClose?.();
      },
      viewKey: "interaction-model"
    },
    {
      icon: BookOpen,
      label: "Core Knowledge",
      onClick: () => {
        onNavigateToCoreKnowledge?.();
        onClose?.();
      },
      viewKey: "core-knowledge"
    },
    {
      icon: Search,
      label: "Search",
      onClick: () => {
        onShowAdvisorDirectory?.();
        onClose?.();
      },
      viewKey: "search"
    }
  ];

  const userTrigger = user ? (
    <Button variant="ghost" className="w-full justify-start p-3 h-auto">
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
    </Button>
  ) : null;

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
              alt="Logo" 
              className="h-8 w-8 object-contain"
            />
            <h2 className="text-lg font-semibold text-fg">Sim</h2>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Navigation Menu */}
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const isActive = activeView === item.viewKey || 
                (item.viewKey === "search" && !selectedAgent && !selectedPublicAdvisorId && !activeView);
              
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className={`w-full justify-start text-left ${
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-fgMuted hover:text-fg hover:bg-bgMuted"
                  } ${item.isPro ? "opacity-60" : ""}`}
                  onClick={item.onClick}
                  disabled={item.isPro}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                      <Crown className="w-3 h-3 mr-1" />
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* User Info at Bottom */}
      {user && (
        <>
          <Separator />
          <div className="p-4">
            <UserSettingsDropdown trigger={userTrigger} simplified={true} />
          </div>
        </>
      )}
    </div>
  );
};

const UserSidebar: React.FC<UserSidebarProps> = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return null; // Mobile sidebar is handled in Home component with Sheet
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-80 z-40">
      <SidebarContent {...props} />
    </div>
  );
};

export default UserSidebar;
