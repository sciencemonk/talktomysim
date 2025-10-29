import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollingSims } from "./ScrollingSims";
import { AgentType } from "@/types/agent";

interface MatrixHeroSectionProps {
  onCreateAgent: () => void;
  onSimClick: (sim: AgentType) => void;
  onViewAllAgents: () => void;
}

export const MatrixHeroSection = ({ onCreateAgent, onSimClick, onViewAllAgents }: MatrixHeroSectionProps) => {
  const { theme } = useTheme();
  const rotatingWords = ["richer", "smarter", "better", "funnier"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      {/* Top Bar with Logo and Theme Toggle */}
      <div className="absolute top-0 left-0 right-0 z-50 w-full px-4 py-6 flex items-center justify-between">
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
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background"></div>
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center pb-64">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-semibold mb-8 tracking-tight text-foreground">
          AI Agents that make you{" "}
          <span className="inline-block min-w-[200px] text-left transition-all duration-500">
            {rotatingWords[currentWordIndex]}
          </span>
        </h1>
        
        <Button
          onClick={onCreateAgent}
          size="lg"
          className="gap-2 font-semibold px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl transition-all duration-300 mb-4 bg-[#82f3aa] hover:bg-[#6dd991] text-black border-0"
        >
          Create an Agent in Seconds
        </Button>
        
        <button
          onClick={onViewAllAgents}
          className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-all duration-300"
        >
          View All Agents
        </button>
      </div>

      {/* Scrolling Sims at bottom */}
      <ScrollingSims onSimClick={onSimClick} />
    </section>
  );
};
