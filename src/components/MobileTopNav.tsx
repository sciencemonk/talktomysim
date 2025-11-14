import { Menu, Settings, LogOut, User, PlusCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAgents } from "@/hooks/useAgents";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { ThemeToggle } from "./ThemeToggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentType } from "@/types/agent";
import { useState } from "react";

interface MobileTopNavProps {
  selectedAgent?: AgentType | null;
  selectedPublicAdvisorId?: string | null;
  selectedPublicAdvisors?: AgentType[];
  onSelectAgent?: (agent: AgentType) => void;
  onSelectPublicAdvisor?: (advisorId: string, advisor?: AgentType) => void;
  onShowAdvisorDirectory?: () => void;
  onShowSettings?: () => void;
}

export const MobileTopNav = ({
  selectedAgent,
  selectedPublicAdvisors = [],
  onSelectAgent,
  onSelectPublicAdvisor,
  onShowAdvisorDirectory,
  onShowSettings,
}: MobileTopNavProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { agents } = useAgents();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAgentSelect = (agent: AgentType) => {
    onSelectAgent?.(agent);
    setIsOpen(false);
  };

  const handlePublicAdvisorSelect = (advisorId: string) => {
    const advisor = selectedPublicAdvisors.find(a => a.id === advisorId);
    onSelectPublicAdvisor?.(advisorId, advisor);
    setIsOpen(false);
  };

  const handleShowAdvisorDirectory = () => {
    onShowAdvisorDirectory?.();
    setIsOpen(false);
  };

  const handleShowSettings = () => {
    onShowSettings?.();
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <ScrollArea className="h-full">
              <div className="flex flex-col h-full p-4">
                {/* Logo */}
                <div className="flex items-center justify-center mb-6">
                  <img 
                    src="/sim-logo-white.png"
                    alt="Sim Logo" 
                    className="h-10 w-auto"
                  />
                </div>

                {/* Create Sim Button */}
                <Button 
                  className="w-full mb-4" 
                  onClick={() => {
                    navigate('/create');
                    setIsOpen(false);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Sim
                </Button>

                {/* Your Agents */}
                {agents && agents.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Your Sims</h3>
                    <div className="space-y-1">
                      {agents.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => handleAgentSelect(agent)}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors ${
                            selectedAgent?.id === agent.id ? 'bg-accent' : ''
                          }`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={getAvatarUrl(agent.avatar_url)} />
                            <AvatarFallback>{agent.name?.[0] || 'A'}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate">{agent.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Public Advisors */}
                {selectedPublicAdvisors && selectedPublicAdvisors.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Following</h3>
                    <div className="space-y-1">
                      {selectedPublicAdvisors.map((advisor) => (
                        <button
                          key={advisor.id}
                          onClick={() => handlePublicAdvisorSelect(advisor.id)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={getAvatarUrl(advisor.avatar_url)} />
                            <AvatarFallback>{advisor.name?.[0] || 'A'}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate">{advisor.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Find a Sim Button */}
                <Button 
                  variant="outline" 
                  className="w-full mb-4"
                  onClick={handleShowAdvisorDirectory}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Find a Sim
                </Button>

                {/* Bottom Actions */}
                <div className="mt-auto space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={handleShowSettings}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Center: Logo */}
        <div className="flex-1 flex justify-center">
          <img 
            src="/sim-logo-white.png"
            alt="Sim Logo" 
            className="h-8 w-auto"
          />
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAvatarUrl(user?.user_metadata?.avatar_url)} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShowSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};
