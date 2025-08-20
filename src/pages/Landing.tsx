
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const SAMPLE_ADVISORS = [
  {
    id: "jobs",
    name: "Steve Jobs",
    role: "entrepreneur",
    field: "Technology, Innovation",
    avatar: "/lovable-uploads/steve-jobs.jpg",
    description: "Co-founder of Apple Inc. Visionary entrepreneur who revolutionized personal computing, animated movies, music, phones, tablet computing, and digital publishing.",
  },
  {
    id: "musk",
    name: "Elon Musk",
    role: "entrepreneur", 
    field: "SpaceX, Tesla, Innovation",
    avatar: "/lovable-uploads/elon-musk.jpg",
    description: "CEO of SpaceX and Tesla. Entrepreneur focused on advancing sustainable transport and space exploration.",
  },
  {
    id: "gates",
    name: "Bill Gates",
    role: "entrepreneur",
    field: "Technology, Philanthropy", 
    avatar: "/lovable-uploads/bill-gates.jpg",
    description: "Co-founder of Microsoft. Philanthropist focused on global health, education, and sustainability.",
  },
  {
    id: "buffett",
    name: "Warren Buffett",
    role: "investor",
    field: "Investment, Finance",
    avatar: "/lovable-uploads/warren-buffett.jpg", 
    description: "Chairman and CEO of Berkshire Hathaway. One of the most successful investors in the world.",
  },
  {
    id: "dalio",
    name: "Ray Dalio",
    role: "investor",
    field: "Investment, Economics",
    avatar: "/lovable-uploads/ray-dalio.jpg",
    description: "Founder of Bridgewater Associates. Advocate for understanding economic cycles and principles-based decision making.",
  },
  {
    id: "obama",
    name: "Barack Obama", 
    role: "politician",
    field: "Politics, Leadership",
    avatar: "/lovable-uploads/barack-obama.jpg",
    description: "Former President of the United States. Known for his leadership, oratory skills, and policy initiatives.",
  },
  {
    id: "socrates",
    name: "Socrates",
    role: "philosopher",
    field: "Philosophy, Ethics",
    avatar: "/lovable-uploads/socrates.jpg",
    description: "Classical Greek philosopher credited as one of the founders of Western philosophy.",
  },
  {
    id: "aristotle", 
    name: "Aristotle",
    role: "philosopher",
    field: "Philosophy, Science",
    avatar: "/lovable-uploads/aristotle.jpg",
    description: "Greek philosopher and polymath during the Classical period in Ancient Greece. Founder of the Lyceum and the Peripatetic school of philosophy and science.",
  },
  {
    id: "jefferson",
    name: "Thomas Jefferson",
    role: "founding father",
    field: "Politics, Law", 
    avatar: "/lovable-uploads/thomas-jefferson.jpg",
    description: "One of the Founding Fathers of the United States and the principal author of the Declaration of Independence.",
  },
  {
    id: "franklin",
    name: "Benjamin Franklin",
    role: "founding father",
    field: "Science, Diplomacy",
    avatar: "/lovable-uploads/benjamin-franklin.jpg",
    description: "One of the Founding Fathers of the United States. A polymath, printer, scientist, inventor, statesman, diplomat, and political philosopher.",
  },
  {
    id: "keynes",
    name: "John Maynard Keynes",
    role: "economist",
    field: "Economics, Finance",
    avatar: "/lovable-uploads/john-maynard-keynes.jpg",
    description: "British economist whose ideas fundamentally changed the theory and practice of macroeconomics and the economic policies of governments.",
  },
  {
    id: "friedman",
    name: "Milton Friedman", 
    role: "economist",
    field: "Economics, Monetary Policy",
    avatar: "/lovable-uploads/milton-friedman.jpg",
    description: "American economist and statistician who received the 1976 Nobel Memorial Prize in Economic Sciences for his research on consumption analysis, monetary history and theory and the complexity of stabilization policy.",
  }
];

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { user } = useAuth();

  const handleSignInWithGoogle = async () => {
    try {
      setIsSigningIn(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
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
    
    // Open chat with advisor in new tab
    const chatUrl = `/advisor-chat/${advisor.id}`;
    window.open(chatUrl, '_blank');
  };

  const filteredAdvisors = SAMPLE_ADVISORS.filter(advisor => {
    const matchesSearch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advisor.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advisor.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || advisor.role.toLowerCase() === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-bg">
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
            Get personalized guidance from history's greatest minds. From entrepreneurs to philosophers,<br />
            our AI advisors are here to help you navigate any challenge.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-bgMuted py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-fgMuted" />
              <Input
                placeholder="Search advisors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-input bg-bg rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-system"
              />
            </div>
            <select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-6 py-3 border border-input rounded-xl bg-bg text-fg min-w-[160px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-system shadow-sm"
            >
              <option value="all">All Roles</option>
              <option value="entrepreneur">Entrepreneurs</option>
              <option value="investor">Investors</option>
              <option value="politician">Politicians</option>
              <option value="philosopher">Philosophers</option>
              <option value="founding father">Founding Fathers</option>
              <option value="economist">Economists</option>
            </select>
          </div>

          {/* Advisors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAdvisors.map((advisor) => (
              <div key={advisor.id} className="bg-bg rounded-2xl p-8 border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="h-16 w-16 border-2 border-border/30 group-hover:border-primary/30 transition-colors">
                    <AvatarImage src={advisor.avatar} alt={advisor.name} />
                    <AvatarFallback className="bg-bgMuted">
                      <User className="h-8 w-8 text-fgMuted" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xl text-fg mb-2 font-system">{advisor.name}</h3>
                    <Badge variant="secondary" className="text-sm mb-3 bg-bgMuted text-fgMuted border-0 font-system">
                      {advisor.role}
                    </Badge>
                    <p className="text-sm text-primary font-medium mb-1 font-system">{advisor.field}</p>
                  </div>
                </div>
                
                <p className="text-fgMuted text-sm leading-relaxed mb-8 font-system">
                  {advisor.description}
                </p>
                
                <Button 
                  onClick={() => handleTalkClick(advisor)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium py-3 inline-flex items-center justify-center gap-2 transition-all shadow-sm font-system"
                >
                  <MessageCircle className="h-4 w-4" />
                  {!user ? 'Sign In to Talk' : 'Start Conversation'}
                </Button>
              </div>
            ))}
          </div>

          {filteredAdvisors.length === 0 && (
            <div className="text-center py-16">
              <p className="text-fgMuted text-lg font-system">No advisors found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg border-t border-border/30 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-fgMuted font-system">
            Built with cutting-edge AI technology to bring you the wisdom of history's greatest minds.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
