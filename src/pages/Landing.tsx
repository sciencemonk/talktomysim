import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import SimpleFooter from "@/components/SimpleFooter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BotCheck from "@/components/BotCheck";
import { useState, useEffect } from "react";
import { AgentType } from "@/types/agent";
import phantomIcon from "@/assets/phantom-icon.png";
import solflareIcon from "@/assets/solflare-icon.png";
import { toast as sonnerToast } from "sonner";
import bs58 from "bs58";
import AuthModal from "@/components/AuthModal";
import landingBackground from "@/assets/landing-background.jpg";
import { SimSettingsModal } from "@/components/SimSettingsModal";
import { Settings, LogOut, Link2, Copy, Check, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatInterface from "@/components/ChatInterface";
import { ConversationModal } from "@/components/ConversationModal";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showBotCheck, setShowBotCheck] = useState(false);
  const [selectedSim, setSelectedSim] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Check auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user's sim if signed in
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

  // Fetch recent conversations (only public visitor conversations)
  const { data: recentConversations, refetch: refetchConversations } = useQuery({
    queryKey: ['recent-conversations', userSim?.id],
    queryFn: async () => {
      if (!userSim) return [];
      
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, created_at, title')
        .eq('tutor_id', userSim.id)
        .eq('is_creator_conversation', false)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      // Fetch first message for each conversation
      const conversationsWithMessages = await Promise.all(
        (conversations || []).map(async (conv) => {
          const { data: messages } = await supabase
            .from('messages')
            .select('content, role')
            .eq('conversation_id', conv.id)
            .eq('role', 'user')
            .order('created_at', { ascending: true })
            .limit(1);
          
          return {
            ...conv,
            firstMessage: messages?.[0]?.content || null
          };
        })
      );
      
      return conversationsWithMessages;
    },
    enabled: !!userSim
  });

  const copyUrl = () => {
    const url = userSim?.custom_url ? `${window.location.origin}/${userSim.custom_url}` : '';
    navigator.clipboard.writeText(url);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Sim URL copied to clipboard"
    });
  };

  // Fetch all sims (both historical and living)
  const { data: allSims } = useQuery({
    queryKey: ['all-sims-landing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      // Transform to AgentType
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

  const handleSimClick = (sim: AgentType) => {
    // If sim has custom_url, navigate to their landing page
    if (sim.custom_url) {
      navigate(`/${sim.custom_url}`);
    } else {
      // Otherwise go to sim directory with state
      navigate('/sim-directory', { state: { selectedAdvisor: sim } });
    }
  };

  const copyCAToClipboard = async () => {
    const ca = "FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump";
    try {
      await navigator.clipboard.writeText(ca);
      toast({
        title: "Copied!",
        description: "Contract address copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleWalletSignIn = async (walletType: 'phantom' | 'solflare') => {
    setIsLoading(walletType);
    try {
      let wallet;
      
      if (walletType === 'phantom') {
        wallet = (window as any).solana;
        if (!wallet?.isPhantom) {
          sonnerToast.error('Please install Phantom wallet');
          setIsLoading(null);
          return;
        }
      } else {
        wallet = (window as any).solflare;
        if (!wallet) {
          sonnerToast.error('Please install Solflare wallet');
          setIsLoading(null);
          return;
        }
      }

      // Connect to wallet
      await wallet.connect();
      
      // Get public key
      const publicKey = wallet.publicKey.toString();

      // Create message to sign
      const message = `Sign in to Sim\n\nWallet: ${publicKey}\nTimestamp: ${new Date().toISOString()}`;
      const encodedMessage = new TextEncoder().encode(message);
      
      // Request signature
      const signedMessage = await wallet.signMessage(encodedMessage, 'utf8');
      const signature = bs58.encode(signedMessage.signature);

      // Authenticate with backend
      const { data, error } = await supabase.functions.invoke('solana-auth', {
        body: { 
          publicKey,
          signature,
          message 
        }
      });

      if (error) throw error;
      
      if (data?.access_token && data?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        
        sonnerToast.success('Connected successfully!');
        // Stay on current page (Landing) after sign in
      }
    } catch (error: any) {
      console.error('Error signing in with Solana:', error);
      sonnerToast.error(error?.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    sonnerToast.success('Signed out successfully');
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      // Delete messages first
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);
      
      if (messagesError) throw messagesError;
      
      // Then delete conversation
      const { error: convError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);
      
      if (convError) throw convError;
      
      sonnerToast.success('Conversation deleted');
      refetchConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      sonnerToast.error('Failed to delete conversation');
    }
  };

  const features = currentUser && userSim ? [
    {
      title: "Your Sim",
      description: userSim.description || "Your AI-powered page",
      action: () => {},
      gradient: "from-primary/20 to-primary/5",
      gridArea: "create",
      showSimOverview: true,
      sim: userSim,
      recentConversations,
    },
    {
      title: "Chat with Your Sim",
      description: "Your personal assistant and agent",
      action: () => {},
      gradient: "from-muted/20 to-muted/5",
      gridArea: "chat",
      showEmbeddedChat: true,
      sim: userSim,
    },
  ] : [
    {
      title: "Create Your Own AI",
      description: "Get a free ai powered Sim page. Linktree meets ai.",
      action: () => navigate("/dashboard"),
      gradient: "from-primary/20 to-primary/5",
      gridArea: "create",
      showWalletButtons: true,
    },
    {
      title: "$SIMAI - Join the Community",
      description: "Be part of the Sim revolution. Hold $SIMAI to join our community and profit from the future of AI.",
      action: copyCAToClipboard,
      gradient: "from-muted/20 to-muted/5",
      gridArea: "simai",
      showCA: true,
    },
  ];

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
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40 z-0" />
      
      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-md bg-black/20 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
              alt="Sim" 
              className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
            />
          </div>
          {currentUser ? (
            <Button
              onClick={handleSignOut}
              className="bg-white text-black hover:bg-white/90 font-medium h-10 w-10 p-0"
              size="sm"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="bg-white text-black hover:bg-white/90 font-medium px-6"
              size="sm"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Main Section - Features */}
      <section className="flex items-center justify-center container mx-auto px-3 sm:px-4 py-4 sm:py-6 relative z-10">
        <div className="grid gap-3 max-w-6xl w-full grid-cols-1 md:grid-cols-2">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 border-white/20 bg-white/10 backdrop-blur-md flex flex-col overflow-hidden ${
                feature.showEmbeddedChat ? 'p-0' : 'cursor-pointer'
              }`}
              onClick={!feature.showWalletButtons && !feature.showEmbeddedChat ? feature.action : undefined}
            >
              {feature.showEmbeddedChat && feature.sim ? (
                <div className="h-[500px] flex flex-col">
                  <div className="p-4 sm:p-6 pb-3">
                    <CardTitle className="text-lg sm:text-xl font-bold text-white">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base text-white/80">
                      {feature.description}
                    </CardDescription>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ChatInterface
                      agent={feature.sim}
                      hideHeader={true}
                      transparentMode={true}
                      isCreatorChat={true}
                    />
                  </div>
                </div>
              ) : (
                <CardHeader className="pb-3 p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl font-bold text-white">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-white/80">
                    {feature.description}
                  </CardDescription>
                  
                  {feature.showSimOverview && feature.sim && (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-white/30">
                          <AvatarImage src={feature.sim.avatar} alt={feature.sim.name} />
                          <AvatarFallback className="text-2xl">
                            {feature.sim.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{feature.sim.name}</h3>
                        {feature.sim.title && (
                          <p className="text-sm text-white/70">{feature.sim.title}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 h-8 px-3 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSettingsModalOpen(true);
                        }}
                      >
                        <Settings className="h-3.5 w-3.5" />
                        <span className="text-xs">Settings</span>
                      </Button>
                      </div>
                      
                      {/* Shareable Link */}
                      {feature.sim.custom_url && (
                        <div className="p-3 rounded-lg bg-black/30 border border-white/20">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <Link2 className="h-4 w-4 text-white/60 flex-shrink-0" />
                              <span className="text-xs text-white/80 font-mono truncate">
                                {window.location.origin}/{feature.sim.custom_url}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyUrl();
                              }}
                              className="flex-shrink-0 h-8 w-8 p-0"
                            >
                              {urlCopied ? (
                                <Check className="h-4 w-4 text-green-400" />
                              ) : (
                                <Copy className="h-4 w-4 text-white/60" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Recent Conversations */}
                      {feature.recentConversations && feature.recentConversations.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-white/60 font-medium">Recent Conversations</p>
                          <div className="space-y-1">
                            {feature.recentConversations.map((conv: any) => (
                              <div
                                key={conv.id}
                                className="flex items-center gap-2 p-2 rounded-lg bg-black/20 border border-white/10 hover:bg-black/30 hover:border-white/20 transition-all group"
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedConversationId(conv.id);
                                  }}
                                  className="flex-1 text-left min-w-0"
                                >
                                  <p className="text-xs text-white/80 truncate">
                                    {conv.firstMessage || `Conversation from ${new Date(conv.created_at).toLocaleDateString()}`}
                                  </p>
                                  <p className="text-[10px] text-white/50 mt-0.5">
                                    {new Date(conv.created_at).toLocaleDateString()}
                                  </p>
                                </button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteConversation(conv.id);
                                  }}
                                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {feature.showWalletButtons && (
                    <div className="flex flex-col gap-2 mt-4">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 h-auto py-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWalletSignIn('phantom');
                        }}
                        disabled={!!isLoading}
                      >
                        <img src={phantomIcon} alt="Phantom" className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {isLoading === 'phantom' ? 'Connecting...' : 'Connect Phantom'}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 h-auto py-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWalletSignIn('solflare');
                        }}
                        disabled={!!isLoading}
                      >
                        <img src={solflareIcon} alt="Solflare" className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {isLoading === 'solflare' ? 'Connecting...' : 'Connect Solflare'}
                        </span>
                      </Button>
                    </div>
                  )}
                  
                  {feature.showCA && (
                    <div className="mt-4 p-3 rounded-lg bg-black/30 border border-white/20">
                      <p className="text-xs text-white/60 mb-1">Contract Address:</p>
                      <p className="text-xs text-white font-mono break-all">FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump</p>
                    </div>
                  )}
                </CardHeader>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Sim Directory Section */}
      <section className="container mx-auto px-3 sm:px-4 pb-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {allSims?.map((sim) => (
              <button
                key={sim.id}
                onClick={() => handleSimClick(sim)}
                className="group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-md hover:scale-105"
              >
                <img 
                  src={sim.avatar} 
                  alt={sim.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/30 shadow-lg group-hover:shadow-xl transition-shadow"
                />
                <span className="text-xs sm:text-sm font-medium text-white text-center line-clamp-2 leading-tight">
                  {sim.name}
                </span>
                {sim.title && (
                  <span className="text-[10px] sm:text-xs text-white/60 text-center line-clamp-1">
                    {sim.title}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />

      {userSim && (
        <>
          <SimSettingsModal
            open={settingsModalOpen}
            onOpenChange={setSettingsModalOpen}
            sim={userSim}
            onSimUpdate={(updatedSim) => {
              refetchUserSim();
            }}
          />
          
          {selectedConversationId && (
            <ConversationModal
              open={!!selectedConversationId}
              onOpenChange={(open) => !open && setSelectedConversationId(null)}
              conversationId={selectedConversationId}
              simAvatar={userSim.avatar}
              simName={userSim.name}
            />
          )}
        </>
      )}

      <div className="relative z-10">
        <SimpleFooter />
      </div>
    </div>
  );
};

export default Landing;
