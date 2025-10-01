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
import { Link } from "react-router-dom";

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
      <div className="flex items-center mb-6">
        <img 
          src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
          alt="Sim" 
          className="h-8 w-8 object-contain mx-auto"
        />
      </div>

      {/* Navigation Links */}
      <div className="space-y-2">
        <Button
          onClick={() => {
            onShowAdvisorDirectory?.();
            setMobileMenuOpen(false);
          }}
          variant="ghost"
          className="w-full justify-start text-left"
        >
          Home
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-left"
          asChild
        >
          <Link 
            to="/whitepaper"
            onClick={() => setMobileMenuOpen(false)}
          >
            White Paper
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-left"
          asChild
        >
          <Link 
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <nav className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Logo/Back button */}
        <div className="flex items-center gap-3">
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
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
                alt="Sim" 
                className="h-8 w-8 object-contain"
              />
            </div>
          )}
        </div>

        {/* Right side - Navigation Links and Menu */}
        <div className="flex items-center gap-4">
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
                asChild
              >
                <Link to="/whitepaper">White Paper</Link>
              </Button>
              <Button
                variant="ghost"
                className="text-sm font-medium hover:text-primary"
                asChild
              >
                <Link to="/contact">Contact</Link>
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
              <SheetContent side="right" className="w-80">
                <MobileMenu />
              </SheetContent>
            </Sheet>
          )}

          {/* User menu (only show if authenticated) */}
          {user && (
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
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;