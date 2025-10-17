import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { AgentType } from '@/types/agent';
import ChatInterface from '@/components/ChatInterface';

const ChatWithSim = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chat');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Force new chat when no chatId is present
  const forceNewChat = !chatId;

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Chat Interface - Full Screen Seamless */}
      <div className="flex-1 flex flex-col w-full">
        <ChatInterface
          agent={userSim}
          hideHeader={true}
          transparentMode={false}
          isCreatorChat={true}
          forceNewChat={forceNewChat}
        />
      </div>
    </div>
  );
};

export default ChatWithSim;
