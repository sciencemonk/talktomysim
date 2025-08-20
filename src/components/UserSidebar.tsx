import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAgents } from "@/hooks/useAgents";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, ChevronLeft, ChevronRight, Menu, Plus, Settings, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { AgentType } from "@/types/agent";
import UserSettingsDropdown from "./UserSettingsDropdown";

export interface UserSidebarProps {
  onShowSettings: () => void;
  onShowChildProfile: () => void;
  onShowAgents: () => void;
  onShowAgentCreate: () => void;
  selectedAgent?: AgentType | null;
  onSelectAgent: (agent: AgentType) => void;
  refreshTrigger?: number;
}

const UserSidebar: React.FC<UserSidebarProps> = ({
  onShowSettings,
  onShowChildProfile,
  onShowAgents,
  onShowAgentCreate,
  selectedAgent,
  onSelectAgent,
  refreshTrigger = 0
}) => {
  const { user } = useAuth();
  const { agents, isLoading } = useAgents();
  const isMobile = useIsMobile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <>
      {isMobile ? (
        <Drawer open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <div className="fixed top-4 left-4 z-50">
            <DrawerTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10 bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-sm"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
          </div>
          
          <DrawerContent side="left" className="h-full w-80 fixed inset-y-0 left-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
                
                <Button 
                  onClick={() => {
                    onShowAgentCreate();
                    setIsMobileOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Advisor
                </Button>
              </div>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <div className="space-y-2">
                      <div className="px-2 py-1">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Your Advisors
                        </h3>
                      </div>
                      
                      {isLoading ? (
                        <div className="space-y-2">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-3 px-2 py-2">
                              <Skeleton className="h-8 w-8 rounded-lg" />
                              <Skeleton className="h-4 flex-1" />
                            </div>
                          ))}
                        </div>
                      ) : agents.length > 0 ? (
                        agents.map((agent) => (
                          <Button
                            key={agent.id}
                            variant={selectedAgent?.id === agent.id ? "secondary" : "ghost"}
                            className="w-full justify-start h-auto p-2"
                            onClick={() => {
                              onSelectAgent(agent);
                              setIsMobileOpen(false);
                            }}
                          >
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={agent.avatar} alt={agent.name} />
                                <AvatarFallback className="text-xs">
                                  <Bot className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0 text-left">
                                <div className="font-medium text-sm truncate">{agent.name}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {agent.subject || agent.type}
                                </div>
                              </div>
                            </div>
                          </Button>
                        ))
                      ) : (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          No advisors yet
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </div>

              <div className="p-4 border-t space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2" 
                  onClick={() => {
                    onShowAgents();
                    setIsMobileOpen(false);
                  }}
                >
                  <Bot className="h-4 w-4" />
                  All Advisors
                </Button>
                
                <UserSettingsDropdown onShowSettings={onShowSettings} />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        // Desktop sidebar
        <div className={cn(
          "flex flex-col h-screen bg-card border-r transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              {!collapsed && (
                <h1 className="text-lg font-semibold">Advisors</h1>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="h-8 w-8"
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
            
            {!collapsed && (
              <Button 
                onClick={onShowAgentCreate}
                className="w-full mt-3 gap-2"
              >
                <Plus className="h-4 w-4" />
                New Advisor
              </Button>
            )}
          </div>

          {/* Agent List */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-2">
                {!collapsed && (
                  <div className="px-2 py-1 mb-2">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Your Advisors
                    </h3>
                  </div>
                )}
                
                <div className="space-y-1">
                  {isLoading ? (
                    <div className="space-y-1">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 px-2 py-2">
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          {!collapsed && <Skeleton className="h-4 flex-1" />}
                        </div>
                      ))}
                    </div>
                  ) : agents.length > 0 ? (
                    agents.map((agent) => (
                      <Button
                        key={agent.id}
                        variant={selectedAgent?.id === agent.id ? "secondary" : "ghost"}
                        className={cn(
                          "w-full h-auto p-2",
                          collapsed ? "justify-center" : "justify-start"
                        )}
                        onClick={() => onSelectAgent(agent)}
                      >
                        <div className={cn(
                          "flex items-center min-w-0 flex-1",
                          collapsed ? "justify-center" : "space-x-3"
                        )}>
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={agent.avatar} alt={agent.name} />
                            <AvatarFallback className="text-xs">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          {!collapsed && (
                            <div className="flex-1 min-w-0 text-left">
                              <div className="font-medium text-sm truncate">{agent.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {agent.subject || agent.type}
                              </div>
                            </div>
                          )}
                        </div>
                      </Button>
                    ))
                  ) : (
                    !collapsed && (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        No advisors yet
                      </div>
                    )
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Footer */}
          <div className="p-2 border-t space-y-1">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full h-auto p-2",
                collapsed ? "justify-center" : "justify-start gap-2"
              )}
              onClick={onShowAgents}
            >
              <Bot className="h-4 w-4 flex-shrink-0" />
              {!collapsed && "All Advisors"}
            </Button>
            
            <UserSettingsDropdown onShowSettings={onShowSettings} collapsed={collapsed} />
          </div>
        </div>
      )}
    </>
  );
};

export default UserSidebar;
