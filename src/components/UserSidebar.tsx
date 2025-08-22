
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
  onClose
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = [
    {
      icon: User,
      label: "My Sim",
      onClick: () => {
        onNavigateToMySim?.();
        onClose?.();
      },
      badge: user ? null : "Pro",
      isPro: !user
    },
    {
      icon: Sparkles,
      label: "Basic Info",
      onClick: () => {
        onNavigateToBasicInfo?.();
        onClose?.();
      }
    },
    {
      icon: Brain,
      label: "Interaction Model",
      onClick: () => {
        onNavigateToInteractionModel?.();
        onClose?.();
      }
    },
    {
      icon: BookOpen,
      label: "Core Knowledge",
      onClick: () => {
        onNavigateToCoreKnowledge?.();
        onClose?.();
      }
    },
    {
      icon: Search,
      label: "Search",
      onClick: () => {
        onShowAdvisorDirectory?.();
        onClose?.();
      },
      isActive: !selectedAgent && !selectedPublicAdvisorId
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
              alt="Logo" 
              className="h-8 w-8 object-contain"
            />
            <h2 className="text-lg font-semibold text-fg">SimTutor</h2>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-fgMuted" />
          <Input
            placeholder="Search advisors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Navigation Menu */}
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-start text-left ${
                  item.isActive 
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
            ))}
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
