import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, LogIn, Home, Folder, Radio, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import AuthModal from "./AuthModal";

const TopNavigation = () => {
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
    navigate('/');
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  return (
    <nav className="bg-card border-b border-border px-3 py-2 sm:px-4 sm:py-4">
      <div className="flex items-center justify-between gap-2">
        {/* Logo - clickable to home */}
        <Link 
          to="/"
          className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <img 
            src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
            alt="Sim" 
            className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
          />
        </Link>

        {/* Navigation items (when signed in) */}
        {user && (
          <div className="flex items-center gap-0.5 sm:gap-2">
            <Link to="/dashboard">
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
        )}

        {/* Auth buttons */}
        {user ? (
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
        )}
      </div>
      
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />
    </nav>
  );
};

export default TopNavigation;
