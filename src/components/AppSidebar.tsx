import { useState, useEffect } from "react";
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
  Pencil
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

interface SimConversation {
  sim_id: string;
  sim_name: string;
  sim_avatar: string | null;
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

  // Fetch user's sim with staleTime to prevent refetching on every navigation
  const { data: userSim } = useQuery({
    queryKey: ['user-sim', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
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
          const { data: advisor } = await supabase
            .from('advisors')
            .select('id, name, avatar_url')
            .eq('id', simId)
            .single();
          
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
            conversation_id: conv.id,
            last_message: messages?.[0]?.content || null,
            updated_at: conv.updated_at
          });
        }
      }
      
      return Array.from(simConversationsMap.values());
    },
    enabled: !!currentUser
  });

  // Real-time subscription for conversation changes
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, queryClient]);

  const handleNewChat = () => {
    // Navigate to home without chat parameter to start fresh
    navigate('/home');
    closeSidebar();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/landing');
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
      toast.success('Chat deleted');
      // If we're on the deleted sim's chat, navigate to home
      const currentSimId = new URLSearchParams(window.location.search).get('sim');
      if (currentSimId === deletedSimId) {
        navigate('/home');
      }
    },
    onError: (error) => {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete chat');
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
    <Sidebar className="border-r bg-background flex flex-col">
      <SidebarContent className="flex flex-col h-full">
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

          {/* New Chat Button */}
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            {open && <span>New chat</span>}
          </Button>

          {/* Search */}
          {open && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats"
                className="pl-9"
              />
            </div>
          )}
        </div>

        {/* Recent Chats - Scrollable */}
        <div className="flex-1 overflow-hidden px-3 min-h-0">
          <SidebarGroup className="h-full">
            {open && <SidebarGroupLabel className="text-xs font-bold">Recent Chats</SidebarGroupLabel>}
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
                                  setSelectedSimForEdit(conv.sim_id);
                                  setEditSimModalOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSimConversation.mutate(conv.sim_id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete chat
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </SidebarMenuItem>
                  ))}
                  {(!filteredConversations || filteredConversations.length === 0) && open && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No chats yet
                    </div>
                  )}
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Navigation Links - Always Visible */}
        <div className="flex-shrink-0 px-3 pb-3">
        {/* Navigation Links */}
        <SidebarGroup className="mt-auto">
          {open && <SidebarGroupLabel className="text-xs font-bold">Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/edit-sim"
                    onClick={closeSidebar}
                    className={({ isActive }) => 
                      `${isActive ? 'bg-muted' : 'hover:bg-muted/50'}`
                    }
                  >
                    {open && <span>Personalize Your Sim</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/edit-sim-page"
                    onClick={closeSidebar}
                    className={({ isActive }) => 
                      `${isActive ? 'bg-muted' : 'hover:bg-muted/50'}`
                    }
                  >
                    {open && <span>Edit Sim Page</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/conversations"
                    onClick={closeSidebar}
                    className={({ isActive }) => 
                      `${isActive ? 'bg-muted' : 'hover:bg-muted/50'}`
                    }
                  >
                    {open && <span>Public Conversations</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/directory"
                    onClick={closeSidebar}
                    className={({ isActive }) => 
                      `${isActive ? 'bg-muted' : 'hover:bg-muted/50'}`
                    }
                  >
                    {open && <span>Sim Directory</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/integrations"
                    onClick={closeSidebar}
                    className={({ isActive }) => 
                      `${isActive ? 'bg-muted' : 'hover:bg-muted/50'}`
                    }
                  >
                    {open && <span>Integrations</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile at Bottom - Always Visible */}
        <div className="pt-4 border-t">
          <button
            onClick={() => setShowCreditsModal(true)}
            className="flex items-center gap-3 p-2 w-full hover:bg-muted/50 transition-colors rounded-lg"
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={getAvatarUrl(userSim?.avatar_url)} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {userSim?.name?.charAt(0)?.toUpperCase() || 'S'}
              </AvatarFallback>
            </Avatar>
            {open && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate mb-2 text-left">
                  {userSim?.name || 'Your Sim'}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Progress value={percentageRemaining} className="h-2" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSignOut();
                    }}
                    className="h-8 w-8 hover:bg-muted flex-shrink-0"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </button>
        </div>
        </div>
      </SidebarContent>

      <CreditUsageModal open={showCreditsModal} onOpenChange={setShowCreditsModal} />
      
      {selectedSimForEdit && (
        <EditSimModal
          open={editSimModalOpen}
          onOpenChange={setEditSimModalOpen}
          simId={selectedSimForEdit}
        />
      )}
    </Sidebar>
  );
}
