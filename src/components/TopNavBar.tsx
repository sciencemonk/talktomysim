import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, Plus, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAvatarUrl } from "@/lib/avatarUtils";
import AuthModal from "./AuthModal";
import { CreateSimModal } from "./CreateSimModal";
import { CreateCABotModal } from "./CreateCABotModal";
import pumpfunLogo from "@/assets/pumpfun-logo.png";
import { useQueryClient } from "@tanstack/react-query";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "@/hooks/useTheme";

export const TopNavBar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateSimModal, setShowCreateSimModal] = useState(false);
  const [showCreateCABotModal, setShowCreateCABotModal] = useState(false);
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
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
            {/* Left: Theme Toggle */}
            <div className="flex items-center shrink-0">
              <ThemeToggle />
            </div>

            {/* Center: Logo */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => navigate('/')}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/sim-logo-dark.png"
                  alt="Sim Logo" 
                  className="h-[32px] w-[32px] sm:h-[38px] sm:w-[38px] object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/sim-logo.png";
                  }}
                />
              </button>
            </div>

            {/* Right: Create Sim Button + User Menu */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button
                onClick={() => setShowCreateSimModal(true)}
                style={{ backgroundColor: '#83f1aa' }}
                className="gap-1 sm:gap-2 font-semibold text-black hover:opacity-90 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Create a Sim</span>
                <span className="xs:hidden">Create</span>
              </Button>
              
              <Button
                onClick={() => setShowCreateCABotModal(true)}
                variant="outline"
                className="gap-1 sm:gap-2 font-semibold text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10 hidden sm:flex"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="flex items-center gap-1">
                  <img src={pumpfunLogo} alt="PumpFun" className="h-3 w-3 sm:h-4 sm:w-4 inline-block" /> Agent
                </span>
              </Button>

              {currentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                        <AvatarImage src={getAvatarUrl(currentUser?.user_metadata?.avatar_url)} />
                        <AvatarFallback>
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => {
                      navigate('/home');
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

      {showCreateCABotModal && (
        <CreateCABotModal
          open={showCreateCABotModal}
          onOpenChange={setShowCreateCABotModal}
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
