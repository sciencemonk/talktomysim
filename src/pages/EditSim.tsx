import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, ArrowLeft } from 'lucide-react';
import { SimSettingsModal } from '@/components/SimSettingsModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import landingBackground from '@/assets/landing-background.jpg';
import { toast } from 'sonner';
import { AgentType } from '@/types/agent';

const EditSim = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

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

  const { data: userSim, refetch: refetchUserSim } = useQuery({
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  if (!userSim) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
          <p className="text-white">Loading your sim...</p>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: `url(${landingBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/40 z-0" />
      
      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-md bg-black/20 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <img 
              src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
              alt="Sim" 
              className="h-8 w-8 object-contain"
            />
            <h1 className="text-white font-semibold text-lg">Edit Your Sim</h1>
          </div>
          <Button
            onClick={handleSignOut}
            className="bg-white text-black hover:bg-white/90 font-medium h-10 w-10 p-0"
            size="sm"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <section className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-white/10 backdrop-blur-md border-2 border-white/20">
            <div className="flex items-center gap-6 mb-8">
              <Avatar className="h-24 w-24 border-4 border-white/30">
                <AvatarImage src={userSim.avatar} alt={userSim.name} />
                <AvatarFallback className="text-3xl text-white bg-primary">
                  {userSim.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">{userSim.name}</h2>
                {userSim.title && (
                  <p className="text-lg text-white/70">{userSim.title}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h3 className="text-sm font-medium text-white/60 mb-2">Description</h3>
                <p className="text-white">{userSim.description || 'No description set'}</p>
              </div>

              {userSim.custom_url && (
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h3 className="text-sm font-medium text-white/60 mb-2">Custom URL</h3>
                  <p className="text-white font-mono">{window.location.origin}/{userSim.custom_url}</p>
                </div>
              )}

              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h3 className="text-sm font-medium text-white/60 mb-2">Type</h3>
                <p className="text-white capitalize">{userSim.sim_type}</p>
              </div>

              <Button
                onClick={() => setSettingsModalOpen(true)}
                className="w-full bg-white text-black hover:bg-white/90 font-medium py-6 text-lg"
              >
                Edit Sim Settings
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {userSim && (
        <SimSettingsModal
          open={settingsModalOpen}
          onOpenChange={setSettingsModalOpen}
          sim={userSim}
          onSimUpdate={(updatedSim) => {
            refetchUserSim();
            toast.success('Sim updated successfully!');
          }}
        />
      )}
    </div>
  );
};

export default EditSim;
