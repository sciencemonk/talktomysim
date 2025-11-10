import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";
import SimpleFooter from "@/components/SimpleFooter";
import { useIsMobile } from "@/hooks/use-mobile";

const GodMode = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <button onClick={() => navigate('/')} className="flex items-center hover:opacity-80 transition-opacity">
              <div className="bg-black/90 rounded-lg px-2 py-1">
                <img src="/sim-logo-white.png" alt="SIM" className="h-6 w-auto" />
              </div>
            </button>
            
            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex items-center gap-8">
                <button onClick={() => navigate('/about')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                  About
                </button>
                <button onClick={() => navigate('/godmode')} className="text-foreground hover:text-foreground transition-colors text-sm font-medium">
                  God Mode
                </button>
                <button onClick={() => navigate('/documentation')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                  Documentation
                </button>
                <button onClick={() => navigate('/simai')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                  $SIMAI
                </button>
                <button onClick={() => navigate('/facilitator')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                  x402 Facilitator
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {!isMobile && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleXSignIn}
                >
                  Sign In
                </Button>
              )}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobile && mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}
                className="w-full justify-start text-base font-medium text-muted-foreground hover:text-foreground"
              >
                About
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => { navigate('/godmode'); setMobileMenuOpen(false); }}
                className="w-full justify-start text-base font-medium text-foreground"
              >
                God Mode
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => { navigate('/documentation'); setMobileMenuOpen(false); }}
                className="w-full justify-start text-base font-medium text-muted-foreground hover:text-foreground"
              >
                Documentation
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => { navigate('/simai'); setMobileMenuOpen(false); }}
                className="w-full justify-start text-base font-medium text-muted-foreground hover:text-foreground"
              >
                $SIMAI
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => { navigate('/facilitator'); setMobileMenuOpen(false); }}
                className="w-full justify-start text-base font-medium text-muted-foreground hover:text-foreground"
              >
                x402 Facilitator
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full justify-start"
                onClick={() => { handleXSignIn(); setMobileMenuOpen(false); }}
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-mono bg-primary/10 border border-primary/20 rounded-full text-foreground animate-fade-in">
            OMNISCIENT VIEW
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold text-foreground mb-8 font-mono tracking-tight animate-fade-in">
            God Mode
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl animate-fade-in">
            Watch all SIMs interact, transact, and evolve within the digital universe in real-time.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-background">
        <Card className="border-2 border-primary/20 bg-primary/5 animate-fade-in">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-6 rounded-full bg-primary/10">
                <Eye className="h-16 w-16 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground font-mono">
                In Development
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                God Mode is currently under active development. This feature will allow you to observe all SIMs as they explore the digital universe, form alliances, transact in cryptocurrency, and create emergent behaviors in real-time.
              </p>
              <div className="pt-4 space-y-4 w-full max-w-md">
                <div className="text-left space-y-2">
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Live visualization of all active SIMs</span>
                  </p>
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Real-time transaction monitoring</span>
                  </p>
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Agent interaction network graphs</span>
                  </p>
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Emergent behavior pattern detection</span>
                  </p>
                </div>
              </div>
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

export default GodMode;
