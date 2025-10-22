import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, Menu, X, Plus, MessageSquare, Grid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import AuthModal from "./AuthModal";
import { CreateSimModal } from "./CreateSimModal";
import { useQueryClient } from "@tanstack/react-query";

export const TopNavBar = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateSimModal, setShowCreateSimModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    navigate('/');
  };

  const navLinks = [
    { to: "/", label: "Home", icon: Grid },
    { to: "/home", label: "My Sims", icon: MessageSquare, authRequired: true },
  ];

  const NavLinks = () => (
    <>
      {navLinks.map((link) => {
        if (link.authRequired && !currentUser) return null;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`
            }
          >
            <link.icon className="h-4 w-4" />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/sim-logo.png" 
                  alt="Sim Logo" 
                  className="h-8 w-8 object-contain"
                />
                <span className="font-bold text-xl hidden sm:inline">SimAI</span>
              </button>
            </div>

            {/* Center: Desktop Nav Links */}
            {!isMobile && (
              <div className="flex items-center gap-2">
                <NavLinks />
              </div>
            )}

            {/* Right: Buy Button + User Menu */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => window.open('https://jup.ag/swap/SOL-SimAI', '_blank')}
                className="gap-2"
                variant="default"
              >
                Buy $SimAI
              </Button>

              {currentUser ? (
                <>
                  {!isMobile && (
                    <Button
                      onClick={() => setShowCreateSimModal(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Sim
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getAvatarUrl(currentUser?.user_metadata?.avatar_url)} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => {
                        navigate('/home');
                        setMobileMenuOpen(false);
                      }}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        My Sims
                      </DropdownMenuItem>
                      {isMobile && (
                        <DropdownMenuItem onClick={() => {
                          setShowCreateSimModal(true);
                          setMobileMenuOpen(false);
                        }}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Sim
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  {!isMobile && (
                    <Button
                      onClick={() => setShowAuthModal(true)}
                      variant="outline"
                    >
                      Sign In
                    </Button>
                  )}
                </>
              )}

              {/* Mobile Menu */}
              {isMobile && (
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-64">
                    <div className="flex flex-col gap-4 mt-8">
                      <NavLinks />
                      
                      {!currentUser && (
                        <Button
                          onClick={() => {
                            setShowAuthModal(true);
                            setMobileMenuOpen(false);
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          Sign In
                        </Button>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />

      {showCreateSimModal && (
        <CreateSimModal
          open={showCreateSimModal}
          onOpenChange={setShowCreateSimModal}
          onAuthRequired={() => {
            setShowCreateSimModal(false);
            setShowAuthModal(true);
          }}
          onSuccess={async () => {
            if (currentUser) {
              await queryClient.invalidateQueries({ queryKey: ['user-sims', currentUser.id] });
              await queryClient.invalidateQueries({ queryKey: ['my-sim-conversations', currentUser.id] });
            }
          }}
        />
      )}
    </>
  );
};
