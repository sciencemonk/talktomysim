import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatInterface from "@/components/ChatInterface";
import { AgentType } from "@/types/agent";

const PublicSimDetail = () => {
  const { customUrl } = useParams<{ customUrl: string }>();
  const navigate = useNavigate();
  const [sim, setSim] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (customUrl) {
      fetchSim();
    }
  }, [customUrl]);

  const fetchSim = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('custom_url', customUrl)
        .eq('sim_type', 'living')
        .eq('is_public', true)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        navigate('/404');
        return;
      }

      // Transform to AgentType
      const transformedSim: AgentType = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        type: 'General Tutor',
        status: 'active',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        avatar: data.avatar_url,
        prompt: data.prompt,
        title: data.title,
        sim_type: (data.sim_type || 'living') as 'historical' | 'living',
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
        voiceTraits: []
      };

      setSim(transformedSim);
    } catch (error) {
      console.error('Error fetching sim:', error);
      navigate('/404');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-blue-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!sim) {
    return null;
  }

  if (showChat) {
    return (
      <div className="h-screen">
        <ChatInterface
          agent={sim}
          onBack={() => setShowChat(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Futuristic background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5" />
      
      {/* Header */}
      <header className="relative border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/sim-logo.png" alt="Sim Logo" className="h-8 w-8" />
          </div>
          
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-full px-8 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Create a Sim
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto">
          {/* Glow effect behind avatar */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            </div>
            <Avatar className="relative h-40 w-40 mx-auto border-4 border-background shadow-2xl shadow-primary/20 ring-2 ring-primary/10">
              <AvatarImage src={sim.avatar || ''} alt={sim.name} />
              <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-primary to-accent text-primary-foreground">
                {sim.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              {sim.name}
            </h1>

            {sim.title && (
              <p className="text-xl text-muted-foreground font-medium">
                {sim.title}
              </p>
            )}

            {sim.description && (
              <p className="text-base text-muted-foreground/80 max-w-xl mx-auto leading-relaxed pt-2">
                {sim.description}
              </p>
            )}

            <div className="pt-6">
              <Button 
                size="lg" 
                onClick={() => setShowChat(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-12 py-6 text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Start Chatting
              </Button>
            </div>

            <p className="text-sm text-muted-foreground/60 pt-4">
              This is a user-created AI sim. Chat responsibly.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />
    </div>
  );
};

export default PublicSimDetail;
