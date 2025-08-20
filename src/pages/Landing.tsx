
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, MessageCircle, User, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdvisors } from "@/hooks/useAdvisors";
import ChatInterface from "@/components/ChatInterface";
import { AgentType } from "@/types/agent";
import AdvisorSearchModal from "@/components/AdvisorSearchModal";

const Landing = () => {
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [activeChats, setActiveChats] = useState<AgentType[]>([]);
  const [currentChat, setCurrentChat] = useState<AgentType | null>(null);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const { user } = useAuth();
  const { advisors, isLoading: advisorsLoading, error: advisorsError } = useAdvisors();

  const handleSignInWithGoogle = async () => {
    try {
      setIsSigningIn(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        toast({
          title: "Sign In Failed",
          description: error.message || "There was an error signing in with Google. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error during Google sign in:', error);
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleTalkClick = (advisor: any) => {
    if (!user) {
      handleSignInWithGoogle();
      return;
    }
    
    // Convert advisor to AgentType format for chat
    const agentForChat: AgentType = {
      id: advisor.id,
      name: advisor.name,
      type: 'General Tutor',
      subject: advisor.category || advisor.field || '',
      description: advisor.description || '',
      prompt: advisor.prompt || '',
      gradeLevel: '',
      learningObjective: '',
      avatar: advisor.avatar_url || advisor.avatar,
      status: 'active',
      createdAt: advisor.created_at || new Date().toISOString(),
      updatedAt: advisor.updated_at || new Date().toISOString()
    };
    
    // Hide the modal immediately
    setShowAdvisorModal(false);
    
    // Add to active chats if not already there
    if (!activeChats.find(chat => chat.id === agentForChat.id)) {
      setActiveChats(prev => [...prev, agentForChat]);
    }
    
    // Set as current chat
    setCurrentChat(agentForChat);
  };

  const handleCloseChat = (advisorId: string) => {
    setActiveChats(prev => prev.filter(chat => chat.id !== advisorId));
    if (currentChat?.id === advisorId) {
      const remainingChats = activeChats.filter(chat => chat.id !== advisorId);
      setCurrentChat(remainingChats.length > 0 ? remainingChats[remainingChats.length - 1] : null);
    }
  };

  const handleSwitchChat = (agent: AgentType) => {
    setCurrentChat(agent);
  };

  const handleBrowseAdvisors = () => {
    setShowAdvisorModal(true);
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left Sidebar - Active Chats */}
      {user && activeChats.length > 0 && (
        <div className="w-64 bg-bgMuted border-r border-border/30 flex flex-col">
          <div className="p-4 border-b border-border/30">
            <h3 className="font-semibold text-fg">Active Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeChats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 border-b border-border/20 cursor-pointer hover:bg-bg transition-colors flex items-center justify-between ${
                  currentChat?.id === chat.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                }`}
                onClick={() => handleSwitchChat(chat)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-fg truncate">{chat.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseChat(chat.id);
                  }}
                  className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Show chat interface if there's a current chat */}
        {currentChat ? (
          <div className="flex-1 flex flex-col">
            <div className="bg-bg border-b border-border/30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentChat.avatar} alt={currentChat.name} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-fg">{currentChat.name}</h2>
                  {currentChat.subject && (
                    <p className="text-sm text-fgMuted">{currentChat.subject}</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentChat(null)}
                className="gap-2"
              >
                Back to Browse
              </Button>
            </div>
            <ChatInterface 
              agent={currentChat} 
              onAgentUpdate={() => {}} 
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="bg-bg border-b border-border/30">
              <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold text-fg font-system tracking-tight">
                    AI Advisor Directory
                  </h1>
                  {!user && (
                    <Button 
                      onClick={handleSignInWithGoogle}
                      disabled={isSigningIn}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 py-2.5 font-medium inline-flex items-center gap-2 transition-all shadow-sm"
                    >
                      {isSigningIn ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <img 
                          src="/lovable-uploads/b0174e22-c5cc-4bc5-8b34-8df738173560.png" 
                          alt="Google" 
                          className="h-4 w-4"
                        />
                      )}
                      {isSigningIn ? "Signing in..." : "Sign In"}
                    </Button>
                  )}
                </div>
              </div>
            </header>

            {/* Hero Section */}
            <section className="bg-bg py-16">
              <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-5xl font-bold text-fg mb-6 font-system tracking-tight leading-tight">
                  Chat with world-class advisors<br />
                  <span className="text-primary">powered by AI</span>
                </h2>
                <p className="text-xl text-fgMuted mb-12 leading-relaxed font-system">
                  Get personalized guidance from expert advisors. From mathematics to science,<br />
                  our AI advisors are here to help you navigate any challenge.
                </p>
                <Button 
                  onClick={handleBrowseAdvisors}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium py-4 px-8 inline-flex items-center justify-center gap-2 transition-all shadow-sm font-system text-lg"
                >
                  <Search className="h-5 w-5" />
                  Browse Advisors
                </Button>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-bg border-t border-border/30 py-12 mt-auto">
              <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-fgMuted font-system">
                  Built with cutting-edge AI technology to bring you expert guidance and knowledge.
                </p>
              </div>
            </footer>
          </>
        )}
      </div>

      {/* Advisor Search Modal */}
      <AdvisorSearchModal
        open={showAdvisorModal}
        onOpenChange={setShowAdvisorModal}
        onSignInRequired={handleSignInWithGoogle}
        onTalkClick={handleTalkClick}
        isPublic={true}
      />
    </div>
  );
};

export default Landing;
