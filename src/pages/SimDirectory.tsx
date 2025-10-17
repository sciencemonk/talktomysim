import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="h-full p-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sims by name, title, or description..."
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>

          {/* Sims Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredSims?.map((sim) => (
              <button
                key={sim.id}
                onClick={() => handleSimClick(sim)}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-card hover:bg-muted border-2 hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="relative">
                  <img 
                    src={sim.avatar} 
                    alt={sim.name}
                    className="w-24 h-24 rounded-full object-cover border-3 border-border shadow-lg group-hover:shadow-2xl transition-shadow"
                  />
                </div>
                <div className="w-full text-center space-y-1">
                  <span className="text-sm font-semibold line-clamp-2 leading-tight">
                    {sim.name}
                  </span>
                  {sim.title && (
                    <span className="text-xs text-muted-foreground line-clamp-1 block">
                      {sim.title}
                    </span>
                  )}
                </div>
                {sim.sim_type === 'historical' && sim.is_official && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                    <Award className="h-3 w-3 mr-1" />
                    Official
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {filteredSims?.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">No sims found matching your search.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimDirectory;
