
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, MessageCircle, User, Crown, Shield, Award } from "lucide-react";
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
          redirectTo: `${window.location.origin}/app`,
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/30">
      {/* Header */}
      <header className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border-b border-neutral-200/20 dark:border-neutral-800/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <img 
                  src="/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png" 
                  alt="Think With Me" 
                  className="h-7 w-7"
                />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                Think With Me
              </h1>
            </div>
            {!user && (
              <Button 
                onClick={handleSignInWithGoogle}
                disabled={isSigningIn}
                className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-full px-6 py-2 font-medium inline-flex items-center gap-2"
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-6 px-6 py-3 mb-8 bg-blue-50/80 dark:bg-blue-950/30 rounded-full border border-blue-100/50 dark:border-blue-900/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <Shield className="h-4 w-4" />
              <span>Privacy First</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <Crown className="h-4 w-4" />
              <span>Premium Advisors</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <Award className="h-4 w-4" />
              <span>Free to Start</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-neutral-900 dark:text-white mb-4 leading-none">
            Talk to the Greatest
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent font-medium">
              Minds Who Ever Lived
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Get personalized advice and mentorship from history's most influential thinkers, 
            leaders, and visionaries through AI-powered conversations.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-neutral-400" />
              <Input
                placeholder="Search advisors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-neutral-200/50 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm"
              />
            </div>
            <select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-200/50 dark:border-neutral-700/50 rounded-xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-neutral-900 dark:text-white"
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
        </div>

        {/* Advisors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {filteredAdvisors.map((advisor) => (
            <div key={advisor.id} className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-16 w-16 border-2 border-neutral-200/50 dark:border-neutral-700/50">
                  <AvatarImage src={advisor.avatar} alt={advisor.name} />
                  <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800">
                    <User className="h-8 w-8 text-neutral-500" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-neutral-900 dark:text-white truncate">{advisor.name}</h3>
                  <Badge variant="secondary" className="text-xs mb-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {advisor.role}
                  </Badge>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{advisor.field}</p>
                </div>
              </div>
              
              <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3 mb-6 leading-relaxed">
                {advisor.description}
              </p>
              
              <Button 
                onClick={() => handleTalkClick(advisor)}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                {!user ? 'Sign In to Talk' : 'Start Conversation'}
              </Button>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/50 dark:border-neutral-800/50 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                <img 
                  src="/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png" 
                  alt="Think With Me" 
                  className="h-6 w-6"
                />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">Think With Me</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Wisdom of the ages, conversations for today</p>
              </div>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              © 2024 Think With Me. Connecting minds across time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
