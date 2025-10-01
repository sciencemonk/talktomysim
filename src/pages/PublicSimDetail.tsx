import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/30">
      {/* Header */}
      <header className="border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Avatar className="h-32 w-32 mx-auto mb-6 border-4 border-white dark:border-neutral-800 shadow-lg">
            <AvatarImage src={sim.avatar || ''} alt={sim.name} />
            <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-blue-600 text-white">
              {sim.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <h1 className="text-4xl font-bold mb-3 text-neutral-900 dark:text-white">
            {sim.name}
          </h1>

          {sim.title && (
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-6">
              {sim.title}
            </p>
          )}

          {sim.description && (
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-xl mx-auto">
              {sim.description}
            </p>
          )}

          <Button 
            size="lg" 
            onClick={() => setShowChat(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-8 shadow-lg"
          >
            Start Chatting
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            This is a user-created AI sim. Chat responsibly.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PublicSimDetail;
