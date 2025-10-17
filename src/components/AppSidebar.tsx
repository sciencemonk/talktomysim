import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Users, 
  Grid,
  Settings,
  LogOut,
  MoreVertical,
  Trash2,
  X
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

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  firstMessage?: string;
}

export function AppSidebar() {
  const { open, setOpen, setOpenMobile, isMobile: sidebarIsMobile } = useSidebar();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
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
    queryKey: ['my-conversations', userSim?.id],
    queryFn: async () => {
      if (!userSim || !currentUser) return [];
      
      console.log('Fetching conversations for:', {
        userSim_id: userSim.id,
        currentUser_id: currentUser.id
      });
      
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, created_at, title, updated_at, is_creator_conversation, user_id')
        .eq('tutor_id', userSim.id)
        .eq('is_creator_conversation', true)
        .eq('user_id', currentUser.id)
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }
      
      console.log('Found conversations:', conversations);
      
      // Get first message for each conversation
      const conversationsWithMessages = await Promise.all(
        (conversations || []).map(async (conv) => {
          const { data: messages } = await supabase
            .from('messages')
            .select('content, role')
            .eq('conversation_id', conv.id)
            .eq('role', 'user')
            .order('created_at', { ascending: true })
            .limit(1);
          
          return {
            ...conv,
            firstMessage: messages?.[0]?.content || null
          };
        })
      );
      
      console.log('Conversations with messages:', conversationsWithMessages);
      return conversationsWithMessages;
    },
    enabled: !!userSim && !!currentUser
  });

  // Real-time subscription for new conversations
  useEffect(() => {
    if (!userSim || !currentUser) return;

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `tutor_id=eq.${userSim.id}`
        },
        (payload) => {
          console.log('New conversation detected:', payload);
          // Check if it's for the current user and is a creator conversation
          const newRecord = payload.new as any;
          if (newRecord.user_id === currentUser.id && newRecord.is_creator_conversation === true) {
            // Invalidate and refetch conversations when a new one is created
            queryClient.invalidateQueries({ queryKey: ['my-conversations', userSim.id] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `tutor_id=eq.${userSim.id}`
        },
        (payload) => {
          // Check if it's for the current user and is a creator conversation
          const updatedRecord = payload.new as any;
          if (updatedRecord.user_id === currentUser.id && updatedRecord.is_creator_conversation === true) {
            // Refetch when conversation is updated (e.g., title changes)
            queryClient.invalidateQueries({ queryKey: ['my-conversations', userSim.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userSim?.id, currentUser?.id, queryClient]);

  const handleNewChat = () => {
    // Navigate to home without chat parameter to start fresh
    navigate('/');
    closeSidebar();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const deleteConversation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);
      
      if (error) throw error;
    },
    onSuccess: (_, deletedConversationId) => {
      queryClient.invalidateQueries({ queryKey: ['my-conversations'] });
      toast.success('Chat deleted');
      // If we're on the deleted chat, navigate to home
      const currentChatId = new URLSearchParams(window.location.search).get('chat');
      if (currentChatId === deletedConversationId) {
        navigate('/');
      }
    },
    onError: (error) => {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete chat');
    }
  });

  const filteredConversations = myConversations?.filter((conv: Conversation) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      conv.firstMessage?.toLowerCase().includes(searchLower) ||
      conv.title?.toLowerCase().includes(searchLower)
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
        <div className="flex-1 overflow-hidden px-3">
          <SidebarGroup>
            {open && <SidebarGroupLabel className="text-xs">Recent Chats</SidebarGroupLabel>}
            <SidebarGroupContent>
              <ScrollArea className="h-full">
                <SidebarMenu>
                  {filteredConversations?.map((conv: Conversation) => (
                    <SidebarMenuItem 
                      key={conv.id}
                      className="relative group"
                    >
                      <div className="flex items-center gap-1 w-full">
                        <SidebarMenuButton asChild className="flex-1">
                          <NavLink 
                            to={`/?chat=${conv.id}`}
                            onClick={closeSidebar}
                            className={({ isActive }) => 
                              `truncate ${isActive ? 'bg-muted' : 'hover:bg-muted/50'}`
                            }
                          >
                            <MessageSquare className="h-4 w-4 flex-shrink-0" />
                            {open && (
                              <span className="truncate">
                                {conv.firstMessage || conv.title || `Chat ${new Date(conv.created_at).toLocaleDateString()}`}
                              </span>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                        
                        {open && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="z-50 bg-popover">
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteConversation.mutate(conv.id);
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
          {open && <SidebarGroupLabel className="text-xs">Navigation</SidebarGroupLabel>}
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile at Bottom - Always Visible */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                navigate('/edit-sim');
                closeSidebar();
              }}
              className="flex items-center gap-3 flex-1 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={userSim?.avatar_url ? (
                    userSim.avatar_url.startsWith('http') 
                      ? userSim.avatar_url 
                      : `${window.location.origin}${userSim.avatar_url.startsWith('/') ? '' : '/'}${userSim.avatar_url}`
                  ) : undefined} 
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {userSim?.name?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              {open && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">
                    {userSim?.name || 'Your Sim'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">Settings</p>
                </div>
              )}
            </button>
            {open && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
