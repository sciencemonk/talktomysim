import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollingSims } from "./ScrollingSims";
import { TokenModal } from "./TokenModal";

interface MatrixHeroSectionProps {
  onCreateAgent: () => void;
}

export const MatrixHeroSection = ({ onCreateAgent }: MatrixHeroSectionProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const text = "ai agent everything";
  const { theme } = useTheme();
  
  // Typing animation effect
  useEffect(() => {
    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [displayedText, text]);

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      {/* Top Bar with Logo, $SIMAI, and Theme Toggle */}
      <div className="relative z-50 w-full px-4 py-6 flex items-center justify-between">
        <img 
          src={theme === "dark" ? "/sim-logo-dark.png" : "/sim-logo-light-final.png"}
          alt="Sim Logo" 
          className="h-10 w-10 object-contain"
          onError={(e) => {
            e.currentTarget.src = "/sim-logo.png";
          }}
        />
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setTokenModalOpen(true)}
            variant="outline"
            className="gap-2 font-semibold"
          >
            $SIMAI
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Scrolling Sims */}
      <ScrollingSims />

      {/* Matrix-style grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background"></div>
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold mb-12 tracking-tight text-[#82f2aa]">
          {displayedText}
          {showCursor && displayedText.length < text.length && (
            <span className="inline-block w-1 h-12 md:h-16 lg:h-20 bg-[#82f2aa] ml-1 animate-pulse"></span>
          )}
        </h1>
        
        {displayedText.length >= text.length && (
          <Button
            onClick={onCreateAgent}
            size="lg"
            variant="outline"
            className="animate-fade-in gap-2 font-semibold px-12 py-8 text-xl transition-all duration-300 border-[#83f1aa] text-[#83f1aa] hover:bg-[#83f1aa]/10"
          >
            Create Agent
          </Button>
        )}
      </div>

      <TokenModal open={tokenModalOpen} onOpenChange={setTokenModalOpen} />
    </section>
  );
};
