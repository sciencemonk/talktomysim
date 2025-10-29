import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollingSims } from "./ScrollingSims";
import { AgentType } from "@/types/agent";

interface MatrixHeroSectionProps {
  onCreateAgent: () => void;
  onSimClick: (sim: AgentType) => void;
}

export const MatrixHeroSection = ({ onCreateAgent, onSimClick }: MatrixHeroSectionProps) => {
  const [chars, setChars] = useState<string[]>([]);
  const text = "ai agent everything";
  const { theme } = useTheme();
  const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*";
  
  // Matrix-style animation effect
  useEffect(() => {
    const finalChars = text.split('');
    const currentChars = new Array(text.length).fill('');
    const iterations = new Array(text.length).fill(0);
    const maxIterations = 8; // How many times each char cycles before settling
    
    const interval = setInterval(() => {
      let allDone = true;
      
      currentChars.forEach((_, index) => {
        if (iterations[index] < maxIterations) {
          allDone = false;
          // Random character cycling
          currentChars[index] = possibleChars[Math.floor(Math.random() * possibleChars.length)];
          iterations[index]++;
        } else {
          // Settle on final character
          currentChars[index] = finalChars[index];
        }
      });
      
      setChars([...currentChars]);
      
      if (allDone) {
        clearInterval(interval);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [text]);

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
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold mb-8 tracking-tight text-[#82f2aa]">
          {chars.map((char, index) => (
            <span
              key={index}
              className="inline-block"
              style={{
                textShadow: '0 0 10px #82f2aa',
                animation: `flicker ${Math.random() * 0.3 + 0.1}s ease-in-out infinite alternate`
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
        
        {chars.length === text.length && chars.every((c, i) => c === text[i]) && (
          <Button
            onClick={onCreateAgent}
            size="lg"
            variant="outline"
            className="animate-fade-in gap-2 font-semibold px-8 py-6 text-lg transition-all duration-300 border-[#83f1aa] text-[#83f1aa] hover:bg-[#83f1aa]/10"
          >
            Create Agent
          </Button>
        )}
      </div>

      {/* Scrolling Sims at bottom */}
      <ScrollingSims onSimClick={onSimClick} />
    </section>
  );
};
