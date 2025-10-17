import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LogOut, ArrowLeft, Search, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import landingBackground from '@/assets/landing-background.jpg';
import { toast } from 'sonner';
import { AgentType } from '@/types/agent';

const SimDirectory = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: allSims } = useQuery({
    queryKey: ['all-sims-directory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(sim => ({
        id: sim.id,
        name: sim.name,
        description: sim.description || '',
        type: 'General Tutor' as const,
        status: 'active' as const,
        createdAt: sim.created_at,
        updatedAt: sim.updated_at,
        avatar: sim.avatar_url,
        prompt: sim.prompt,
        title: sim.title,
        sim_type: sim.sim_type as 'historical' | 'living',
        custom_url: sim.custom_url,
        is_featured: false,
        is_official: sim.is_official,
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
        voiceTraits: []
      } as AgentType));
    },
  });

  const filteredSims = allSims?.filter(sim => 
    sim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sim.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sim.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const handleSimClick = (sim: AgentType) => {
    if (sim.custom_url) {
      navigate(`/${sim.custom_url}`);
    }
  };

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
            <h1 className="text-white font-semibold text-lg">Sim Directory</h1>
          </div>
          {currentUser && (
            <Button
              onClick={handleSignOut}
              className="bg-white text-black hover:bg-white/90 font-medium h-10 w-10 p-0"
              size="sm"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <section className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <Card className="p-4 mb-6 bg-white/10 backdrop-blur-md border-2 border-white/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sims by name, title, or description..."
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </Card>

          {/* Sims Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredSims?.map((sim) => (
              <button
                key={sim.id}
                onClick={() => handleSimClick(sim)}
                className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-md hover:scale-105"
              >
                <img 
                  src={sim.avatar} 
                  alt={sim.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/30 shadow-lg group-hover:shadow-xl transition-shadow"
                />
                <span className="text-sm font-medium text-white text-center line-clamp-2 leading-tight">
                  {sim.name}
                </span>
                {sim.title && (
                  <span className="text-xs text-white/60 text-center line-clamp-1">
                    {sim.title}
                  </span>
                )}
                {sim.sim_type === 'historical' && sim.is_official && (
                  <Badge variant="outline" className="bg-transparent border-white text-white text-[10px] px-1.5 py-0">
                    <Award className="h-3 w-3 mr-1" />
                    Official
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {filteredSims?.length === 0 && (
            <Card className="p-12 bg-white/10 backdrop-blur-md border-2 border-white/20 text-center">
              <p className="text-white/60">No sims found matching your search.</p>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default SimDirectory;
