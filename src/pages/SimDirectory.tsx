import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Award, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AgentType } from '@/types/agent';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarUrl } from '@/lib/avatarUtils';
import SimDetailModal from '@/components/SimDetailModal';

const SimDirectory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSim, setSelectedSim] = useState<AgentType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();

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
        voiceTraits: [],
        price: sim.price || 0, // Include price
      } as AgentType));
    },
  });

  const filteredSims = allSims?.filter(sim => 
    sim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sim.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sim.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSimClick = (sim: AgentType) => {
    setSelectedSim(sim);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header with Menu */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
          <div className="flex items-center justify-between p-3">
            <SidebarTrigger className="h-10 w-10">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="text-lg font-semibold">Sim Directory</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className={`h-full p-8 ${isMobile ? 'pt-[73px]' : ''}`}>
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
                  <Avatar className="w-24 h-24 border-3 border-border shadow-lg group-hover:shadow-2xl transition-shadow">
                    <AvatarImage
                      src={getAvatarUrl(sim.avatar)} 
                      alt={sim.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                      {sim.name?.charAt(0)?.toUpperCase() || 'S'}
                    </AvatarFallback>
                  </Avatar>
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
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary text-primary">
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

      {/* Sim Detail Modal */}
      <SimDetailModal
        sim={selectedSim}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default SimDirectory;
