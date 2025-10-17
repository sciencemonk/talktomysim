import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import landingBackground from '@/assets/landing-background.jpg';
import { AgentType } from '@/types/agent';

const SimDirectory = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSimClick = (sim: AgentType) => {
    if (sim.custom_url) {
      navigate(`/${sim.custom_url}`);
    }
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${landingBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-pink-900/40 backdrop-blur-sm z-0" />
      
      {/* Main Content */}
      <div className="relative z-10 h-full p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Sim Directory</h1>
            <p className="text-white/60">Discover and chat with AI sims</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sims by name, title, or description..."
                className="pl-12 h-14 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white placeholder:text-white/40 text-lg focus:bg-white/15 focus:border-white/30"
              />
            </div>
          </div>

          {/* Sims Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredSims?.map((sim) => (
              <button
                key={sim.id}
                onClick={() => handleSimClick(sim)}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-md hover:scale-105 hover:shadow-xl"
              >
                <div className="relative">
                  <img 
                    src={sim.avatar} 
                    alt={sim.name}
                    className="w-24 h-24 rounded-full object-cover border-3 border-white/30 shadow-lg group-hover:shadow-2xl transition-shadow"
                  />
                </div>
                <div className="w-full text-center space-y-1">
                  <span className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                    {sim.name}
                  </span>
                  {sim.title && (
                    <span className="text-xs text-white/70 line-clamp-1 block">
                      {sim.title}
                    </span>
                  )}
                </div>
                {sim.sim_type === 'historical' && sim.is_official && (
                  <Badge variant="outline" className="bg-white/10 border-white/40 text-white text-[10px] px-2 py-0.5 backdrop-blur-sm">
                    <Award className="h-3 w-3 mr-1" />
                    Official
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {filteredSims?.length === 0 && (
            <Card className="p-12 bg-white/10 backdrop-blur-md border-2 border-white/20 text-center">
              <p className="text-white/60 text-lg">No sims found matching your search.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimDirectory;
