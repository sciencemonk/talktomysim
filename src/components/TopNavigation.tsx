import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Settings, User, Menu, X, ArrowLeft, Plus } from "lucide-react";
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
import { Link, useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";

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
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');

  const handleSignOut = async () => {
    await signOut();
  };

  const handleLoginClick = () => {
    setAuthModalMode('login');
    setShowAuthModal(true);
  };

  const handleCreateSimClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setAuthModalMode('signup');
      setShowAuthModal(true);
    }
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
        
        {user && (
          <Button
            variant="ghost"
            className="w-full justify-start text-left"
            onClick={() => {
              navigate('/dashboard');
              setMobileMenuOpen(false);
            }}
          >
            Dashboard
          </Button>
        )}
        
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

          {/* Dashboard button for authenticated users */}
          {user && !showBackButton && !isMobile && (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-sm font-medium hover:text-primary"
              >
                Dashboard
              </Button>
              <Button
                onClick={handleCreateSimClick}
                className="h-10 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90 text-sm font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Sim
              </Button>
            </>
          )}

          {/* Login and Create Sim buttons (only show when not authenticated) */}
          {!user && !showBackButton && (
            <>
              <Button
                variant="ghost"
                onClick={handleLoginClick}
                className="text-sm font-medium"
              >
                Login
              </Button>
              <Button
                onClick={handleCreateSimClick}
                className="h-10 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90 text-sm font-medium"
              >
                Create a Sim
              </Button>
            </>
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
                      {user?.user_metadata?.wallet_address?.slice(0, 2)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {!isMobile && (
                    <span className="text-sm font-medium font-mono">
                      {user?.user_metadata?.wallet_address 
                        ? `${user.user_metadata.wallet_address.slice(0, 4)}...${user.user_metadata.wallet_address.slice(-4)}`
                        : user?.email?.split('@')[0] || "User"
                      }
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
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

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        defaultMode={authModalMode}
      />
    </nav>
  );
};

export default TopNavigation;