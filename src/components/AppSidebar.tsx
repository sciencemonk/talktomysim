import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Users, 
  Grid,
  Settings,
  LogOut
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

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  firstMessage?: string;
}

export function AppSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  // Fetch user's sim
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
    enabled: !!currentUser
  });

  // Fetch user's own conversations with their sim
  const { data: myConversations } = useQuery({
    queryKey: ['my-conversations', userSim?.id],
    queryFn: async () => {
      if (!userSim) return [];
      
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, created_at, title, updated_at')
        .eq('tutor_id', userSim.id)
        .eq('is_creator_conversation', true)
        .eq('user_id', currentUser.id)
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
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
      
      return conversationsWithMessages;
    },
    enabled: !!userSim
  });

  const handleNewChat = () => {
    navigate('/');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const filteredConversations = myConversations?.filter((conv: Conversation) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      conv.firstMessage?.toLowerCase().includes(searchLower) ||
      conv.title?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Sidebar className="border-r bg-background">
      <SidebarContent className="p-3">
        {/* New Chat Button */}
        <div className="mb-4">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            {open && <span>New chat</span>}
          </Button>
        </div>

        {/* Search */}
        {open && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats"
                className="pl-9"
              />
            </div>
          </div>
        )}

        {/* Recent Chats */}
        <SidebarGroup>
          {open && <SidebarGroupLabel className="text-xs">Recent Chats</SidebarGroupLabel>}
          <SidebarGroupContent>
            <ScrollArea className="h-[300px]">
              <SidebarMenu>
                {filteredConversations?.map((conv: Conversation) => (
                  <SidebarMenuItem key={conv.id}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={`/?chat=${conv.id}`}
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

        {/* Navigation Links */}
        <SidebarGroup className="mt-auto">
          {open && <SidebarGroupLabel className="text-xs">Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/conversations"
                    className={({ isActive }) => 
                      `${isActive ? 'bg-muted' : 'hover:bg-muted/50'}`
                    }
                  >
                    <Users className="h-4 w-4" />
                    {open && <span>Public Conversations</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/directory"
                    className={({ isActive }) => 
                      `${isActive ? 'bg-muted' : 'hover:bg-muted/50'}`
                    }
                  >
                    <Grid className="h-4 w-4" />
                    {open && <span>Sim Directory</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile at Bottom */}
        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/edit-sim')}
              className="flex items-center gap-3 flex-1 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={userSim?.avatar_url} />
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
      </SidebarContent>
    </Sidebar>
  );
}
