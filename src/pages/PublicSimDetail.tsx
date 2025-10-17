import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Globe, Wallet, ExternalLink, Copy, Check, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatInterface from "@/components/ChatInterface";
import AuthModal from "@/components/AuthModal";
import { AgentType } from "@/types/agent";
import { useToast } from "@/hooks/use-toast";
import landingBackground from "@/assets/landing-background.jpg";

const PublicSimDetail = () => {
  const { customUrl } = useParams<{ customUrl: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sim, setSim] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [walletCopied, setWalletCopied] = useState(false);

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
        crypto_wallet: data.crypto_wallet,
        background_image_url: data.background_image_url
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
      <div 
        className="flex items-center justify-center min-h-screen relative"
        style={{
          backgroundImage: `url(${landingBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <Loader2 className="h-8 w-8 animate-spin text-white relative z-10" />
      </div>
    );
  }

  if (!sim) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen relative"
        style={{
          backgroundImage: `url(${landingBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="text-center space-y-4 relative z-10 p-8 backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl max-w-md">
          <h1 className="text-2xl font-bold text-white">Sim Not Found</h1>
          <p className="text-white/70">This sim doesn't exist or has been deactivated.</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-white text-black hover:bg-white/90"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: `url(${sim.background_image_url || landingBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {showChat ? (
        <div className="flex-1 flex flex-col relative z-10">
          <div className="border-b border-white/20 px-4 py-3 flex items-center justify-between backdrop-blur-md bg-black/30">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white/30">
                <AvatarImage src={sim.avatar} alt={sim.name} />
                <AvatarFallback className="bg-white/10 text-white">{sim.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm text-white">{sim.name}</p>
                {sim.title && <p className="text-xs text-white/60">{sim.title}</p>}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(false)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1">
            <ChatInterface
              agent={sim}
              hideHeader={true}
              transparentMode={true}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <div className="max-w-xl w-full">
            {/* Main Card */}
            <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-3xl p-8 sm:p-12 shadow-2xl">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse" />
                  <Avatar className="relative h-28 w-28 sm:h-36 sm:w-36 border-4 border-white/30 shadow-2xl">
                    <AvatarImage src={sim.avatar} alt={sim.name} className="object-cover" />
                    <AvatarFallback className="text-4xl sm:text-5xl bg-white/20 text-white">{sim.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Name and Title */}
              <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{sim.name}</h1>
                {sim.title && (
                  <p className="text-lg sm:text-xl text-white/70">{sim.title}</p>
                )}
                {sim.description && (
                  <p className="text-sm sm:text-base text-white/60 mt-4 leading-relaxed">
                    {sim.description}
                  </p>
                )}
              </div>

              {/* Start Chatting Button */}
              <Button
                size="lg"
                className="w-full h-14 text-base font-semibold bg-white text-black hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 mb-6 group"
                onClick={() => {
                  if (currentUser) {
                    setShowChat(true);
                  } else {
                    setShowAuthModal(true);
                  }
                }}
              >
                <MessageCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Chatting
              </Button>

              {/* Social Links & Wallet */}
              {(sim.twitter_url || sim.website_url || sim.crypto_wallet) && (
                <div className="flex flex-col gap-3 pt-4 border-t border-white/20">
                  {sim.twitter_url && (
                    <a
                      href={sim.twitter_url.startsWith('http') ? sim.twitter_url : `https://${sim.twitter_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-300 group"
                    >
                      <svg className="h-5 w-5 text-white/60 group-hover:text-white transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Follow on X</span>
                      <ExternalLink className="h-4 w-4 text-white/60 group-hover:text-white transition-colors ml-auto flex-shrink-0" />
                    </a>
                  )}

                  {sim.website_url && (
                    <a
                      href={sim.website_url.startsWith('http') ? sim.website_url : `https://${sim.website_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-300 group"
                    >
                      <Globe className="h-5 w-5 text-white/60 group-hover:text-white transition-colors flex-shrink-0" />
                      <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Visit Website</span>
                      <ExternalLink className="h-4 w-4 text-white/60 group-hover:text-white transition-colors ml-auto flex-shrink-0" />
                    </a>
                  )}

                  {sim.crypto_wallet && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(sim.crypto_wallet || '');
                        setWalletCopied(true);
                        setTimeout(() => setWalletCopied(false), 2000);
                        toast({
                          title: "Copied!",
                          description: "Wallet address copied to clipboard"
                        });
                      }}
                      className="flex items-center justify-between gap-3 w-full px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Wallet className="h-5 w-5 text-white/60 group-hover:text-white transition-colors flex-shrink-0" />
                        <span className="text-xs font-mono text-white/70 group-hover:text-white transition-colors truncate">
                          {sim.crypto_wallet}
                        </span>
                      </div>
                      {walletCopied ? (
                        <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                      ) : (
                        <Copy className="h-4 w-4 text-white/60 group-hover:text-white transition-colors flex-shrink-0" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
};

export default PublicSimDetail;
