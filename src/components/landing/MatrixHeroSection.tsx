import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";

interface MatrixHeroSectionProps {
  onCreateAgent: () => void;
}

export const MatrixHeroSection = ({ onCreateAgent }: MatrixHeroSectionProps) => {
  const [visibleChars, setVisibleChars] = useState(0);
  const text = "ai agent everything";
  const { theme } = useTheme();
  
  useEffect(() => {
    if (visibleChars < text.length) {
      const timeout = setTimeout(() => {
        setVisibleChars(prev => prev + 1);
      }, 100); // Adjust speed of character appearance
      
      return () => clearTimeout(timeout);
    }
  }, [visibleChars, text.length]);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      {/* Top Bar with Logo and Theme Toggle */}
      <div className="relative z-50 w-full px-4 py-6 flex items-center justify-between">
        <img 
          src={theme === "dark" ? "/sim-logo-dark.png" : "/sim-logo-light-final.png"}
          alt="Sim Logo" 
          className="h-10 w-10 object-contain"
          onError={(e) => {
            e.currentTarget.src = "/sim-logo.png";
          }}
        />
        <ThemeToggle />
      </div>

      {/* Matrix-style grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background"></div>
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold mb-12 tracking-tight">
          {text.split('').map((char, index) => (
            <span
              key={index}
              className={`inline-block transition-all duration-300 ${
                index < visibleChars 
                  ? 'opacity-100 text-[#82f2aa]' 
                  : 'opacity-0'
              }`}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
        
        {visibleChars >= text.length && (
          <Button
            onClick={onCreateAgent}
            size="lg"
            className="animate-fade-in gap-2 font-semibold text-black hover:opacity-90 px-12 py-8 text-xl transition-all duration-300"
            style={{
              backgroundColor: '#83f1aa',
            }}
          >
            Create Agent
          </Button>
        )}
      </div>
    </section>
  );
};
