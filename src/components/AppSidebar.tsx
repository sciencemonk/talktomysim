import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Users, 
  Grid,
  LogOut,
  MoreVertical,
  Trash2,
  X,
  Pencil,
  Copy,
  Coins,
  Share2,
  RotateCcw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { Progress } from "@/components/ui/progress";
import { CreditUsageModal } from "./CreditUsageModal";
import EditSimModal from "./EditSimModal";
import AuthModal from "./AuthModal";
import { CreateSimModal } from "./CreateSimModal";
import phantomIcon from "@/assets/phantom-icon.png";
import solflareIcon from "@/assets/solflare-icon.png";
import bs58 from "bs58";

interface SimConversation {
  sim_id: string;
  sim_name: string;
  sim_avatar: string | null;
  sim_user_id: string | null;
  sim_creator_wallet: string | null;
  conversation_id: string;
  last_message: string | null;
  updated_at: string;
}

export function AppSidebar() {
  const { open, setOpen, setOpenMobile, isMobile: sidebarIsMobile } = useSidebar();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [editSimModalOpen, setEditSimModalOpen] = useState(false);
  const [selectedSimForEdit, setSelectedSimForEdit] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateSimModal, setShowCreateSimModal] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const closeSidebar = () => {
    if (isMobile || sidebarIsMobile) {
      setOpenMobile(false);
    }
  };

  // Get current user
  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  });

  // Fetch user's sims with staleTime to prevent refetching on every navigation
  const { data: userSims } = useQuery({
    queryKey: ['user-sims', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Fetch current user's profile for wallet comparison
  const { data: currentUserProfile } = useQuery({
    queryKey: ['current-user-profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('id', currentUser.id)
        .single();
      return data;
    },
    enabled: !!currentUser?.id
  });

  const { data: myConversations, refetch } = useQuery({
    queryKey: ['my-sim-conversations', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      
      // Get all conversations for the user
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, tutor_id, updated_at')
        .eq('user_id', currentUser.id)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }
      
      // Group by sim, keeping only the most recent conversation per sim
      const simConversationsMap = new Map<string, any>();
      
      for (const conv of conversations || []) {
        const simId = conv.tutor_id;
        
        if (!simConversationsMap.has(simId)) {
          // Get advisor/sim details
          const { data: advisor, error: advisorError } = await supabase
            .from('advisors')
            .select('id, name, avatar_url, user_id')
            .eq('id', simId)
            .maybeSingle();
          
          if (advisorError) {
            console.error('Error fetching advisor:', advisorError);
            continue;
          }
          
          // Skip if advisor doesn't exist (deleted sim)
          if (!advisor) {
            console.log('Skipping deleted sim:', simId);
            continue;
          }
          
          // Get creator's wallet if user_id exists
          let creatorWallet = null;
          if (advisor?.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('wallet_address')
              .eq('id', advisor.user_id)
              .single();
            creatorWallet = profile?.wallet_address || null;
          }
          
          // Get last message for this conversation
          const { data: messages } = await supabase
            .from('messages')
            .select('content, role')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          simConversationsMap.set(simId, {
            sim_id: simId,
            sim_name: advisor?.name || 'Unknown Sim',
            sim_avatar: advisor?.avatar_url || null,
            sim_user_id: advisor?.user_id || null,
            sim_creator_wallet: creatorWallet,
            conversation_id: conv.id,
            last_message: messages?.[0]?.content || null,
            updated_at: conv.updated_at
          });
        }
      }
      
      // Also include all user's own created sims, even if no conversations exist
      if (userSims && userSims.length > 0) {
        for (const sim of userSims) {
          if (!simConversationsMap.has(sim.id)) {
            // Get creator's wallet
            let creatorWallet = null;
            if (sim.user_id) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('wallet_address')
                .eq('id', sim.user_id)
                .single();
              creatorWallet = profile?.wallet_address || null;
            }

            simConversationsMap.set(sim.id, {
              sim_id: sim.id,
              sim_name: sim.name || 'Your Sim',
              sim_avatar: sim.avatar_url || null,
              sim_user_id: sim.user_id || null,
              sim_creator_wallet: creatorWallet,
              conversation_id: null,
              last_message: null,
              updated_at: sim.updated_at || new Date().toISOString()
            });
          }
        }
      }
      
      return Array.from(simConversationsMap.values());
    },
    enabled: !!currentUser
  });

  // Real-time subscription for conversation changes and advisor updates
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('user-conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${currentUser.id}`
        },
        () => {
          // Refetch when any conversation changes for this user
          queryClient.invalidateQueries({ queryKey: ['my-sim-conversations', currentUser.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          // Refetch when new messages arrive
          queryClient.invalidateQueries({ queryKey: ['my-sim-conversations', currentUser.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'advisors',
          filter: `user_id=eq.${currentUser.id}`
        },
        () => {
          // Refetch when user's sims are updated/deleted
          queryClient.invalidateQueries({ queryKey: ['my-sim-conversations', currentUser.id] });
          queryClient.invalidateQueries({ queryKey: ['user-sims', currentUser.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, queryClient]);

  const handleSimMarketplace = () => {
    navigate('/directory');
    closeSidebar();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    window.location.reload();
  };

  const handleWalletSignIn = async (walletType: 'phantom' | 'solflare') => {
    setIsSigningIn(walletType);
    try {
      let wallet;
      
      if (walletType === 'phantom') {
        wallet = (window as any).solana;
        if (!wallet?.isPhantom) {
          toast.error('Please install Phantom wallet');
          setIsSigningIn(null);
          return;
        }
      } else {
        wallet = (window as any).solflare;
        if (!wallet) {
          toast.error('Please install Solflare wallet');
          setIsSigningIn(null);
          return;
        }
      }

      await wallet.connect();
      const publicKey = wallet.publicKey.toString();
      const message = `Sign in to Sim\n\nWallet: ${publicKey}\nTimestamp: ${new Date().toISOString()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await wallet.signMessage(encodedMessage, 'utf8');
      const signature = bs58.encode(signedMessage.signature);

      const { data, error } = await supabase.functions.invoke('solana-auth', {
        body: { publicKey, signature, message }
      });

      if (error) throw error;
      
      if (data?.access_token && data?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        
        toast.success('Connected successfully!');
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Error signing in with Solana:', error);
      toast.error(error?.message || 'Failed to connect wallet');
    } finally {
      setIsSigningIn(null);
    }
  };

  // Fetch user's credits
  const { data: credits } = useQuery({
    queryKey: ['user-credits', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;

      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error) {
        // If user doesn't have credits record, create one
        const { data: newCredits, error: insertError } = await supabase
          .from('user_credits')
          .insert({ user_id: currentUser.id })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating credits:', insertError);
          return null;
        }
        return newCredits;
      }

      return data;
    },
    enabled: !!currentUser,
    staleTime: 30 * 1000, // Refresh every 30 seconds
  });

  const percentageRemaining = credits
    ? ((credits.total_credits - credits.used_credits) / credits.total_credits) * 100
    : 100;

  const remainingCredits = credits
    ? credits.total_credits - credits.used_credits
    : 1000;

  const deleteSimConversation = useMutation({
    mutationFn: async (simId: string) => {
      // Delete all conversations with this sim
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('user_id', currentUser?.id)
        .eq('tutor_id', simId);
      
      if (error) throw error;
    },
    onSuccess: (_, deletedSimId) => {
      queryClient.invalidateQueries({ queryKey: ['my-sim-conversations', currentUser?.id] });
      toast.success('Sim removed');
      // If we're on the deleted sim's chat, navigate to directory
      const currentSimId = new URLSearchParams(window.location.search).get('sim');
      if (currentSimId === deletedSimId) {
        navigate('/directory');
      }
    },
    onError: (error) => {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to remove Sim');
    }
  });

  const filteredConversations = myConversations?.filter((conv: SimConversation) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      conv.sim_name?.toLowerCase().includes(searchLower) ||
      conv.last_message?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
    <Sidebar className="border-r bg-white flex flex-col">
      <SidebarContent className="flex flex-col h-full bg-white">
        {/* Header - Always Visible */}
        <div className="flex-shrink-0 p-3 space-y-4">
          {/* Sim Logo */}
          <div className="flex items-center gap-2 px-2">
            <img 
              src="/sim-logo.png" 
              alt="Sim Logo" 
              className="h-8 w-8 object-contain"
            />
          </div>

          {/* Sim Marketplace Button */}
          <Button
            onClick={handleSimMarketplace}
            className="w-full justify-start gap-2"
            variant="outline"
          >
            <Users className="h-4 w-4" />
            {open && <span>Sim Marketplace</span>}
          </Button>

          {/* Create Your Sim Button - always visible */}
          <Button
            onClick={() => {
              if (!currentUser) {
                setShowAuthModal(true);
              } else {
                setShowCreateSimModal(true);
              }
              // Always close sidebar on mobile when opening any modal
              if (isMobile || sidebarIsMobile) {
                setOpenMobile(false);
              }
            }}
            className="w-full justify-start gap-2 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            {open && <span>Create a Sim</span>}
          </Button>

          {/* Search */}
          {open && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Sims"
                className="pl-9"
              />
            </div>
          )}
        </div>

        {/* Your Sims - Scrollable */}
        <div className="flex-1 overflow-hidden px-3 min-h-0">
          <SidebarGroup className="h-full">
            {open && <SidebarGroupLabel className="text-xs font-bold">Your Sims</SidebarGroupLabel>}
            <SidebarGroupContent className="h-[calc(100%-2rem)]">
              <ScrollArea className="h-full max-h-[600px]">
                <SidebarMenu>
                  {filteredConversations?.map((conv: SimConversation) => (
                    <SidebarMenuItem 
                      key={conv.sim_id}
                      className="relative group/item"
                    >
                      <div className="flex items-center gap-1 w-full">
                        <SidebarMenuButton asChild className="flex-1">
                          <NavLink 
                            to={`/home?sim=${conv.sim_id}`}
                            onClick={closeSidebar}
                            className={({ isActive }) => 
                              `truncate ${isActive ? 'bg-muted' : 'hover:bg-muted/50'}`
                            }
                          >
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={conv.sim_avatar || undefined} />
                              <AvatarFallback className="text-xs">
                                {conv.sim_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {open && (
                              <span className="font-medium truncate">{conv.sim_name}</span>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                        
                        {open && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="z-50 bg-popover">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const simUrl = `${window.location.origin}/sim/${conv.sim_id}`;
                                  navigator.clipboard.writeText(simUrl);
                                  toast.success('Sim URL copied to clipboard!');
                                }}
                              >
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    // Delete all conversations for this sim and current user
                                    const { error } = await supabase
                                      .from('conversations')
                                      .delete()
                                      .eq('tutor_id', conv.sim_id)
                                      .eq('user_id', currentUser?.id);
                                    
                                    if (error) throw error;
                                    
                                    // Invalidate queries to refresh the UI
                                    await queryClient.invalidateQueries({ queryKey: ['my-sim-conversations'] });
                                    
                                    // Navigate to home with the sim ID to trigger welcome message
                                    navigate(`/home?sim=${conv.sim_id}`);
                                    closeSidebar();
                                    
                                    toast.success('Conversation restarted!');
                                  } catch (error) {
                                    console.error('Error restarting conversation:', error);
                                    toast.error('Failed to restart conversation');
                                  }
                                }}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Restart
                              </DropdownMenuItem>
                              {(conv.sim_user_id === currentUser?.id || 
                                (currentUserProfile?.wallet_address && 
                                 conv.sim_creator_wallet === currentUserProfile.wallet_address)) && (
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSimForEdit(conv.sim_id);
                                    setEditSimModalOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {/* Only show Remove option if user is NOT the creator */}
                              {!(conv.sim_user_id === currentUser?.id || 
                                (currentUserProfile?.wallet_address && 
                                 conv.sim_creator_wallet === currentUserProfile.wallet_address)) && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSimConversation.mutate(conv.sim_id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove Sim
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </SidebarMenuItem>
                  ))}
                  {(!filteredConversations || filteredConversations.length === 0) && open && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No Sims yet
                    </div>
                  )}
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Action Buttons at Bottom */}
        <div className="flex-shrink-0 px-3 pb-3">
          <div className="pt-4 border-t space-y-2">
            <Button
              onClick={() => {
                navigator.clipboard.writeText('FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump');
                toast.success('Contract address copied to clipboard!');
              }}
              className="w-full justify-start gap-2 bg-[#83f0aa] hover:bg-[#6ed99a] text-black"
              variant="default"
            >
              <Coins className="h-4 w-4" />
              {open && <span>Buy $SimAI</span>}
            </Button>
            
            {currentUser ? (
              <Button
                onClick={handleSignOut}
                className="w-full justify-start gap-2"
                variant="outline"
              >
                <LogOut className="h-4 w-4" />
                {open && <span>Log Out</span>}
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => handleWalletSignIn('phantom')}
                  disabled={!!isSigningIn}
                  className="w-full justify-start gap-2 bg-white text-black hover:bg-white/90"
                  variant="default"
                >
                  {open ? (
                    <>
                      <img src={phantomIcon} alt="Phantom" className="w-5 h-5" />
                      <span>{isSigningIn === 'phantom' ? 'Connecting...' : 'Sign in with Phantom'}</span>
                    </>
                  ) : (
                    <img src={phantomIcon} alt="Phantom" className="w-5 h-5" />
                  )}
                </Button>
                
                <Button
                  onClick={() => handleWalletSignIn('solflare')}
                  disabled={!!isSigningIn}
                  className="w-full justify-start gap-2 bg-white text-black hover:bg-white/90"
                  variant="default"
                >
                  {open ? (
                    <>
                      <img src={solflareIcon} alt="Solflare" className="w-5 h-5" />
                      <span>{isSigningIn === 'solflare' ? 'Connecting...' : 'Sign in with Solflare'}</span>
                    </>
                  ) : (
                    <img src={solflareIcon} alt="Solflare" className="w-5 h-5" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
    {/* Render modals outside Sidebar using Portal to prevent Sheet/Dialog conflicts */}
    {typeof document !== 'undefined' && createPortal(
      <>
        <CreditUsageModal open={showCreditsModal} onOpenChange={setShowCreditsModal} />
        
        {selectedSimForEdit && (
          <EditSimModal
            open={editSimModalOpen}
            onOpenChange={setEditSimModalOpen}
            simId={selectedSimForEdit}
          />
        )}

        {showAuthModal && !currentUser && (
          <AuthModal
            open={showAuthModal}
            onOpenChange={setShowAuthModal}
            defaultMode="signup"
          />
        )}

        {showCreateSimModal && currentUser && (
          <CreateSimModal
            open={showCreateSimModal}
            onOpenChange={setShowCreateSimModal}
            onSuccess={async () => {
              await queryClient.invalidateQueries({ queryKey: ['user-sims', currentUser.id] });
              await queryClient.invalidateQueries({ queryKey: ['my-sim-conversations', currentUser.id] });
            }}
          />
        )}
      </>,
      document.body
    )}
    </>
  );
}
