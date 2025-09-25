import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Settings, User, Menu, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AgentType } from "@/types/agent";
import { useAgents } from "@/hooks/useAgents";
import { useIsMobile } from "@/hooks/use-mobile";

interface TopNavigationProps {
  selectedAgent?: AgentType | null;
  selectedPublicAdvisorId?: string | null;
  selectedPublicAdvisors?: AgentType[];
  onSelectAgent?: (agent: AgentType) => void;
  onSelectPublicAdvisor?: (advisorId: string, advisor?: AgentType) => void;
  onRemovePublicAdvisor?: (advisorId: string) => void;
  onShowAdvisorDirectory?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

const TopNavigation = ({
  selectedAgent,
  selectedPublicAdvisorId,
  selectedPublicAdvisors = [],
  onSelectAgent,
  onSelectPublicAdvisor,
  onRemovePublicAdvisor,
  onShowAdvisorDirectory,
  showBackButton = false,
  onBack,
}: TopNavigationProps) => {
  const { user, signOut } = useAuth();
  const { agents } = useAgents();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const MobileMenu = () => (
    <div className="flex flex-col space-y-4 p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-4">
        <img 
          src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
          alt="Sim" 
          className="h-8 w-8 object-contain"
        />
        <h1 className="font-semibold text-lg">Sim</h1>
      </div>

      {/* Find a Sim Button */}
      <Button
        onClick={() => {
          onShowAdvisorDirectory?.();
          setMobileMenuOpen(false);
        }}
        variant="outline"
        className="w-full justify-start"
      >
        Find a Sim
      </Button>

      {/* User's Agents */}
      {user && agents.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Your Agents</p>
          {agents.map((agent) => (
            <Button
              key={agent.id}
              onClick={() => {
                onSelectAgent?.(agent);
                setMobileMenuOpen(false);
              }}
              variant="ghost"
              className="w-full justify-start"
            >
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {agent.name}
            </Button>
          ))}
        </div>
      )}

      {/* Public Advisors */}
      {selectedPublicAdvisors.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Your Sims</p>
          {selectedPublicAdvisors.map((advisor) => (
            <Button
              key={advisor.id}
              onClick={() => {
                onSelectPublicAdvisor?.(advisor.id, advisor);
                setMobileMenuOpen(false);
              }}
              variant="ghost"
              className="w-full justify-start"
            >
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={advisor.avatar} alt={advisor.name} />
                <AvatarFallback>{advisor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {advisor.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <nav className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Logo/Back button and navigation */}
        <div className="flex items-center gap-6">
          {showBackButton ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {!isMobile && "Back"}
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
                alt="Sim" 
                className="h-8 w-8 object-contain"
              />
              <h1 className="font-semibold text-lg">Sim</h1>
            </div>
          )}
          
          {/* Desktop Navigation Links */}
          {!isMobile && !showBackButton && (
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onShowAdvisorDirectory}
                className="text-sm font-medium hover:text-primary"
              >
                Home
              </Button>
              <Button
                variant="ghost"
                className="text-sm font-medium hover:text-primary"
              >
                White Paper
              </Button>
              <Button
                variant="ghost"
                className="text-sm font-medium hover:text-primary"
              >
                Request a Sim
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          {isMobile && !showBackButton && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <MobileMenu />
              </SheetContent>
            </Sheet>
          )}
        </div>

        {/* Right side - User menu (only show if authenticated) */}
        {user && (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
                    <AvatarFallback>
                      {user?.email?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {!isMobile && (
                    <span className="text-sm font-medium">
                      {user?.user_metadata?.full_name || "User"}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopNavigation;