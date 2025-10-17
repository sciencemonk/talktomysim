import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageCircle, Calendar, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import TopNavigation from '@/components/TopNavigation';
import SimpleFooter from '@/components/SimpleFooter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAvatarUrl } from '@/lib/avatarUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
  messageCount?: number;
  lastMessage?: string;
  advisor?: {
    name: string;
    avatar_url: string;
  };
}

const SimConversations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);

      // First get the user's advisors
      const { data: advisors, error: advisorsError } = await supabase
        .from('advisors')
        .select('id, name, avatar_url')
        .eq('user_id', user?.id);

      if (advisorsError) throw advisorsError;

      if (!advisors || advisors.length === 0) {
        setConversations([]);
        setIsLoading(false);
        return;
      }

      const advisorIds = advisors.map(a => a.id);

      // Get conversations where tutor_id is in the user's advisors
      // and user_id is NOT the current user (exclude creator's own conversations)
      const { data: convos, error: convosError } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          is_anonymous,
          tutor_id,
          user_id
        `)
        .in('tutor_id', advisorIds)
        .or(`user_id.neq.${user?.id},user_id.is.null`)
        .order('updated_at', { ascending: false });

      if (convosError) throw convosError;

      // Create a map of advisor data for easy lookup
      const advisorMap = new Map(advisors.map(a => [a.id, a]));

      // Get message counts for each conversation
      const conversationsWithCounts = await Promise.all(
        (convos || []).map(async (convo) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', convo.id);

          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content')
            .eq('conversation_id', convo.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get advisor data from our map
          const advisor = advisorMap.get(convo.tutor_id);

          return {
            ...convo,
            messageCount: count || 0,
            lastMessage: lastMsg?.content || '',
            advisor: advisor ? { name: advisor.name, avatar_url: advisor.avatar_url } : undefined
          };
        })
      );

      setConversations(conversationsWithCounts);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversation: Conversation) => {
    try {
      setLoadingMessages(true);
      setSelectedConversation(conversation);
      setIsModalOpen(true);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      // Remove from local state
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      // Close modal if this conversation is currently open
      if (selectedConversation?.id === conversationId) {
        setIsModalOpen(false);
        setSelectedConversation(null);
      }

      toast({
        title: "Success",
        description: "Conversation deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    } finally {
      setDeleteConversationId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavigation />
      <div className="container mx-auto py-8 px-4 flex-1">
        {conversations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Conversations Yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                When people start talking to your sim, their conversations will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              All Conversations ({conversations.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] relative group"
                >
                  <div onClick={() => loadMessages(conversation)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={getAvatarUrl(conversation.advisor?.avatar_url)} />
                            <AvatarFallback>
                              {conversation.advisor?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">
                              {conversation.advisor?.name || 'Unknown Sim'}
                            </CardTitle>
                            <CardDescription className="text-xs flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(conversation.updated_at), {
                                addSuffix: true,
                              })}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {conversation.messageCount}
                        </Badge>
                      </div>
                    </CardHeader>
                    {conversation.lastMessage && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {conversation.lastMessage}
                        </p>
                      </CardContent>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConversationId(conversation.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <DialogTitle className="flex items-center gap-3">
                {selectedConversation?.advisor && (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getAvatarUrl(selectedConversation.advisor.avatar_url)} />
                    <AvatarFallback>
                      {selectedConversation.advisor.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <div>{selectedConversation?.advisor?.name || 'Unknown Sim'}</div>
                  {selectedConversation && (
                    <p className="text-xs text-muted-foreground font-normal">
                      {formatDistanceToNow(new Date(selectedConversation.updated_at), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="px-6 py-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteConversationId} onOpenChange={() => setDeleteConversationId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this conversation? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConversationId && handleDeleteConversation(deleteConversationId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <SimpleFooter />
    </div>
  );
};

export default SimConversations;
