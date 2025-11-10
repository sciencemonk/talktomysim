import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect } from "react";
import simLogoWhite from "@/assets/sim-logo-white.png";
import simHeroLogo from "@/assets/sim-hero-logo.png";

const SimpleFooter = () => {
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

  return (
    <footer className="bg-card border-t border-border px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-8">
          {/* Left side - Logo and Copyright */}
          <div className="flex flex-col gap-2">
            <button onClick={() => navigate('/')} className="hover:opacity-80 transition-opacity">
              <img src={resolvedTheme === 'dark' ? simLogoWhite : simHeroLogo} alt="SIM" className="h-6" />
            </button>
            <p className="text-xs text-muted-foreground">
              © 2025 SIM Project. All rights reserved.
            </p>
          </div>
          
          {/* Right side - Navigation Links */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/')} 
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => navigate('/agents')} 
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Agent Directory
            </button>
            <button 
              onClick={() => navigate('/documentation')} 
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Documentation
            </button>
            <button 
              onClick={() => navigate('/simai')} 
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              $SIMAI
            </button>
            <button 
              onClick={() => navigate('/facilitator')} 
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              x402 Facilitator
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;