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
import { ThemeToggle } from "./ThemeToggle";

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


  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Theme Toggle */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>

            {/* Center: Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/sim-logo.png" 
                  alt="Sim Logo" 
                  className="h-[38px] w-[38px] object-contain"
                />
              </button>
            </div>


            {/* Right: Create Sim Button + User Menu */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowCreateSimModal(true)}
                style={{ backgroundColor: '#83f1aa' }}
                className="gap-2 font-semibold text-black hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Create a Sim
              </Button>

              {currentUser && (
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
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                      {currentUser && (
                        <Button
                          onClick={() => {
                            navigate('/home');
                            setMobileMenuOpen(false);
                          }}
                          variant="ghost"
                          className="justify-start"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          My Sims
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
