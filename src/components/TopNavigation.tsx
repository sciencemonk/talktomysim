import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, LogIn, Home, Folder, Radio, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import AuthModal from "./AuthModal";

interface TopNavigationProps {
  showLiveIndicator?: boolean;
}

const TopNavigation = ({ showLiveIndicator = false }: TopNavigationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const copyCAToClipboard = async () => {
    const ca = "FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump";
    try {
      await navigator.clipboard.writeText(ca);
      toast({
        title: "Copied!",
        description: "Contract address copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/landing');
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  return (
    <nav className="bg-card border-b border-border px-3 py-2 sm:px-4 sm:py-4">
      <div className="flex items-center justify-between gap-2">
        {/* Logo - clickable to home */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link 
            to="/home"
            className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <img 
              src="/sim-logo-white.png" 
              alt="Sim Logo" 
              className="h-8 w-auto object-contain"
            />
          </Link>
          
          {showLiveIndicator && (
            <>
              <span className="text-sm sm:text-base text-muted-foreground font-medium">
                Live on
              </span>
              <img 
                src="/lovable-uploads/pill-logo.png" 
                alt="Platform" 
                className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
              />
            </>
          )}
        </div>

        {/* Navigation items (when signed in) or Live indicator */}
        {showLiveIndicator ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-full">
              <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
              <span className="text-sm font-bold text-black">LIVE</span>
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-0.5 sm:gap-2">
            <Link to="/home">
              <Button
                variant="ghost"
                size="icon"
                title="Home"
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/sim-conversations">
              <Button
                variant="ghost"
                size="icon"
                title="Conversations"
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/sim-directory">
              <Button
                variant="ghost"
                size="icon"
                title="Directory"
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <Folder className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/live">
              <Button
                variant="ghost"
                size="icon"
                title="Live"
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <Radio className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : null}

        {/* Auth buttons (only show when not in live mode) */}
        {!showLiveIndicator && (user ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            title="Sign out"
            className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 h-8 sm:h-10 flex-shrink-0"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign In</span>
          </Button>
        ))}
      </div>
      
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />
    </nav>
  );
};

export default TopNavigation;
