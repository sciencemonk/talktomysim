import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { AgentType } from '@/types/agent';
import ChatInterface from '@/components/ChatInterface';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';

const ChatWithSim = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chat');
  const simId = searchParams.get('sim');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedSim, setSelectedSim] = useState<any>(null);
  const isMobile = useIsMobile();
  
  // Force new chat when no chatId is present and no specific sim is selected
  const forceNewChat = !chatId && !simId;
  
  // Determine if this is a creator chat (chatting with own sim)
  const isCreatorChat = !simId;

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
  
  // Load sim from URL parameter if provided
  useEffect(() => {
    if (simId) {
      console.log('Loading sim from URL:', simId);
      supabase
        .from('advisors')
        .select('*')
        .eq('id', simId)
        .single()
        .then(({ data, error }) => {
          if (data && !error) {
            console.log('Sim loaded:', data.name);
            const agent: AgentType = {
              ...data,
              type: 'General Tutor' as const,
              status: 'active' as const,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              avatar: data.avatar_url,
              welcome_message: data.welcome_message,
              social_links: data.social_links as any,
              sim_type: (data.sim_type === 'living' ? 'living' : 'historical') as 'historical' | 'living'
            };
            setSelectedSim(agent);
          } else {
            console.error('Error loading sim:', error);
          }
        });
    } else {
      setSelectedSim(null);
    }
  }, [simId]);

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
        welcome_message: data.welcome_message,
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
        social_links: data.social_links as any,
        background_image_url: data.background_image_url
      } as AgentType;
    },
    enabled: !!currentUser
  });

  // Use selected sim if available, otherwise use user's sim
  const chatAgent = selectedSim || userSim;

  if (!chatAgent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-6">
          <p>Loading your sim...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Mobile Header with Menu */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
          <div className="flex items-center justify-between p-3">
            <SidebarTrigger className="h-10 w-10">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <div className="flex items-center gap-2">
              <img 
                src="/sim-logo.png" 
                alt="Sim Logo" 
                className="h-8 w-8 object-contain dark:hidden"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <img 
                src="/sim-logo-dark.png" 
                alt="Sim Logo" 
                className="h-8 w-8 object-contain hidden dark:block"
                onError={(e) => {
                  e.currentTarget.src = '/sim-logo.png';
                }}
              />
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      )}
      
      {/* Chat Interface - Full Screen Seamless */}
      <div className={`flex-1 flex flex-col w-full min-h-0 ${isMobile ? 'pt-[57px]' : ''}`}>
        {chatAgent ? (
          <ChatInterface
            agent={chatAgent}
            hideHeader={true}
            transparentMode={false}
            isCreatorChat={isCreatorChat}
            forceNewChat={forceNewChat}
            conversationId={chatId}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWithSim;
