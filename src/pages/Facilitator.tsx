import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";
import SimpleFooter from "@/components/SimpleFooter";
import simHeroLogo from "@/assets/sim-hero-logo.png";
import simLogoWhite from "@/assets/sim-logo-white.png";
import xIcon from "@/assets/x-icon.png";

const Facilitator = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);

  const handleXSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Error signing in with X:', error);
        toast.error('Failed to sign in with X');
      }
    } catch (error) {
      console.error('Error signing in with X:', error);
      toast.error('Failed to sign in with X');
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Navigation */}
      <nav className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => navigate('/')} className="flex items-center hover:opacity-80 transition-opacity">
              <img src="/sim-logo-white.png" alt="SIM" className="h-6 w-auto" />
            </button>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate('/about')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                About
              </button>
              <button onClick={() => navigate('/agents')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                Agent Directory
              </button>
              <button onClick={() => navigate('/documentation')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                Documentation
              </button>
              <button onClick={() => navigate('/simai')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                $SIMAI
              </button>
              <button onClick={() => navigate('/facilitator')} className="text-white hover:text-white transition-colors text-sm font-medium">
                x402 Facilitator
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:text-white"
                onClick={handleXSignIn}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-mono bg-primary/10 border border-primary/20 rounded-full text-foreground animate-fade-in">
            x402 PROTOCOL
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold text-foreground mb-8 font-mono tracking-tight animate-fade-in">
            x402 Facilitator
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl animate-fade-in">
            A decentralized payment facilitation protocol for autonomous AI agents and digital commerce.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-background">
        <Card className="border-2 border-primary/20 bg-primary/5 animate-fade-in">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-6 rounded-full bg-primary/10">
                <Construction className="h-16 w-16 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground font-mono">
                In Development
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                The x402 Facilitator is currently under active development. This protocol will enable seamless payment facilitation for AI agents and digital services using the x402 standard.
              </p>
              <div className="pt-4">
                <Button onClick={() => navigate('/')} variant="default" size="lg">
                  Return to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SimpleFooter />
    </div>
  );
};

export default Facilitator;
