import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bot, Wallet, Users } from "lucide-react";
import { useState, useEffect } from "react";

const Index = () => {
  const { user, loading } = useAuth();
  const [cyclingWord, setCyclingWord] = useState("money");
  const words = ["money", "smarter", "healthier", "happier"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCyclingWord((prev) => {
        const currentIndex = words.indexOf(prev);
        const nextIndex = (currentIndex + 1) % words.length;
        return words[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect authenticated users to the main app
  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/55ccce33-98a1-45d2-9e9e-7b446a02a417.png" 
            alt="Think With Me" 
            className="h-8 w-8"
          />
          <h1 className="font-bold text-xl">Think With Me</h1>
        </div>
        <Link to="/login">
          <Button variant="outline">Sign In</Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-7xl font-bold font-mono tracking-tight text-foreground mb-6">
            AI Agents that make you{" "}
            <span className="text-primary inline-block min-w-[200px] transition-all duration-300">
              {cyclingWord}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-4xl mx-auto">
            ChatGPT is one-size-fits-all. Sim is uniquely yours. Create your own AI—a personal assistant, 
            financial advisor, or trusted friend. Connect your crypto wallet, customize personality and knowledge, 
            and build an AI that truly understands you.
          </p>
          
          <div className="flex gap-4 justify-center mb-16">
            <Link to="/login">
              <Button size="lg" className="px-8">
                Get Started Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8">
              Watch Demo
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 rounded-xl bg-card shadow-sm border-border border hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-black/10 dark:bg-white/10 rounded-lg flex items-center justify-center mb-4 mx-auto border border-black/20 dark:border-white/20">
                <Bot className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 font-mono">Your AI, Your Way</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Customize your Sim's personality, knowledge base, and capabilities to match your needs and style.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card shadow-sm border-border border hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-black/10 dark:bg-white/10 rounded-lg flex items-center justify-center mb-4 mx-auto border border-black/20 dark:border-white/20">
                <Wallet className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 font-mono">Crypto-Connected</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect your crypto wallet for a truly personalized financial advisor that understands your portfolio.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card shadow-sm border-border border hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-black/10 dark:bg-white/10 rounded-lg flex items-center justify-center mb-4 mx-auto border border-black/20 dark:border-white/20">
                <Users className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 font-mono">Truly Personal</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Unlike generic AI, your Sim learns your preferences, context, and goals to provide genuinely personalized assistance.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
