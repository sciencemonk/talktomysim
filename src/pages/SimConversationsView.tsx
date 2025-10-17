import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, MessageSquare } from 'lucide-react';
import { ConversationModal } from '@/components/ConversationModal';
import { toast } from 'sonner';
import { AgentType } from '@/types/agent';

const SimConversationsView = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      if (!session) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (!session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
      if (!data) return null;
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        type: 'General Tutor' as const,
        status: 'active' as const,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        avatar: data.avatar_url,
        prompt: data.prompt,
        title: data.title,
        sim_type: data.sim_type as 'historical' | 'living',
        custom_url: data.custom_url,
        is_featured: false,
        model: 'GPT-4',
        interactions: 0,
        studentsSaved: 0,
        helpfulnessScore: 0,
        avmScore: 0,
        csat: 0,
        performance: 0,
        channels: [],
        channelConfigs: {},
        isPersonal: false,
        voiceTraits: [],
        twitter_url: data.twitter_url,
        website_url: data.website_url,
        crypto_wallet: data.crypto_wallet,
        background_image_url: data.background_image_url
      } as AgentType;
    },
    enabled: !!currentUser
  });

  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ['all-conversations', userSim?.id],
    queryFn: async () => {
      if (!userSim) return [];
      
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, created_at, title, updated_at')
        .eq('tutor_id', userSim.id)
        .eq('is_creator_conversation', false)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      const conversationsWithMessages = await Promise.all(
        (conversations || []).map(async (conv) => {
          const { data: messages, count } = await supabase
            .from('messages')
            .select('content, role, created_at', { count: 'exact' })
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: true });
          
          const firstUserMessage = messages?.find(m => m.role === 'user')?.content;
          
          return {
            ...conv,
            messageCount: count || 0,
            firstMessage: firstUserMessage || null
          };
        })
      );
      
      return conversationsWithMessages;
    },
    enabled: !!userSim
  });

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);
      
      if (messagesError) throw messagesError;
      
      const { error: convError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);
      
      if (convError) throw convError;
      
      toast.success('Conversation deleted');
      refetchConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  if (!userSim) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-6">
          <p>Loading your sim...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="h-full p-8">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="h-6 w-6" />
              <h2 className="text-2xl font-bold">
                Public Conversations with {userSim.name}
              </h2>
            </div>
            <p className="text-muted-foreground">
              {conversations?.length || 0} total conversation{conversations?.length !== 1 ? 's' : ''}
            </p>
          </Card>

          {conversations && conversations.length > 0 ? (
            <div className="space-y-3">
              {conversations.map((conv: any) => (
                <Card 
                  key={conv.id}
                  className="p-4 hover:bg-muted/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedConversationId(conv.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="font-medium truncate mb-1">
                        {conv.firstMessage || conv.title || `Conversation from ${new Date(conv.created_at).toLocaleDateString()}`}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(conv.created_at).toLocaleDateString()} at {new Date(conv.created_at).toLocaleTimeString()}</span>
                        <span>{conv.messageCount} message{conv.messageCount !== 1 ? 's' : ''}</span>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteConversation(conv.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
              <p className="text-muted-foreground">
                When people chat with your sim on its public page, conversations will appear here.
              </p>
            </Card>
          )}
        </div>
      </div>

      {selectedConversationId && userSim && (
        <ConversationModal
          open={!!selectedConversationId}
          onOpenChange={(open) => !open && setSelectedConversationId(null)}
          conversationId={selectedConversationId}
          simAvatar={userSim.avatar}
          simName={userSim.name}
        />
      )}
    </div>
  );
};

export default SimConversationsView;
