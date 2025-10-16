import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageCircle, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import TopNavigation from '@/components/TopNavigation';
import SimpleFooter from '@/components/SimpleFooter';

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
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

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

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      setSelectedConversation(conversationId);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                All Conversations ({conversations.length})
              </h2>
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-3 pr-4">
                  {conversations.map((conversation) => (
                    <Card
                      key={conversation.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedConversation === conversation.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => loadMessages(conversation.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.advisor?.avatar_url} />
                              <AvatarFallback>
                                {conversation.advisor?.name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">
                                {conversation.title || 'Untitled Conversation'}
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
                            {conversation.messageCount} msgs
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
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div>
              {selectedConversation ? (
                <Card className="h-[calc(100vh-280px)] flex flex-col">
                  <CardHeader>
                    <CardTitle>Conversation Messages</CardTitle>
                  </CardHeader>
                  <ScrollArea className="flex-1 px-6">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4 pb-4">
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
                  </ScrollArea>
                </Card>
              ) : (
                <Card className="h-[calc(100vh-280px)] flex items-center justify-center">
                  <CardContent className="text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a conversation to view messages
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
      <SimpleFooter />
    </div>
  );
};

export default SimConversations;
