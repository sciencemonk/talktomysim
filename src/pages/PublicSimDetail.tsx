import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Globe, Wallet, ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatInterface from "@/components/ChatInterface";
import AuthModal from "@/components/AuthModal";
import SimpleFooter from "@/components/SimpleFooter";
import { AgentType } from "@/types/agent";

const PublicSimDetail = () => {
  const { customUrl } = useParams<{ customUrl: string }>();
  const navigate = useNavigate();
  const [sim, setSim] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    if (customUrl) {
      fetchSim();
    }
  }, [customUrl]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const handleCreateSimClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      navigate('/dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  const fetchSim = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('custom_url', customUrl)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        navigate('/404');
        return;
      }

      // Transform to AgentType with social links
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
        voiceTraits: [],
        twitter_url: data.twitter_url,
        website_url: data.website_url,
        crypto_wallet: data.crypto_wallet
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
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img src="/sim-logo.png" alt="Sim Logo" className="h-8 w-8" />
          </button>
          
          <Button 
            onClick={handleCreateSimClick}
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

            <div className="pt-8">
              <Button 
                size="lg" 
                onClick={() => setShowChat(true)}
                className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-full px-12 py-6 text-lg font-medium shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Start Chatting
              </Button>
            </div>

            {/* Social Links - Linktree Style */}
            {(sim.twitter_url || sim.website_url || sim.crypto_wallet) && (
              <div className="pt-8 space-y-3 max-w-md mx-auto">
                {sim.twitter_url && (
                  <a
                    href={sim.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group"
                  >
                    <svg className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Follow on X</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                  </a>
                )}

                {sim.website_url && (
                  <a
                    href={sim.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group"
                  >
                    <Globe className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Visit Website</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                  </a>
                )}

                {sim.crypto_wallet && (
                  <div className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-full bg-white/5 border border-white/10">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">{sim.crypto_wallet}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(sim.crypto_wallet || '');
                      }}
                      className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground/60 pt-6">
              This is a user-created AI sim. Chat responsibly.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />

      {/* Footer */}
      <SimpleFooter />

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        defaultMode="signup"
      />
    </div>
  );
};

export default PublicSimDetail;
