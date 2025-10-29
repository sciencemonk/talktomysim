import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollingSims } from "./ScrollingSims";
import { AgentType } from "@/types/agent";

interface MatrixHeroSectionProps {
  onCreateAgent: () => void;
  onSimClick: (sim: AgentType) => void;
}

export const MatrixHeroSection = ({ onCreateAgent, onSimClick }: MatrixHeroSectionProps) => {
  const text = "ai agents in seconds";
  const { theme } = useTheme();

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
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-mono font-bold mb-8 tracking-tight text-foreground">
          {text}
        </h1>
        
        <Button
          onClick={onCreateAgent}
          size="lg"
          variant="outline"
          className="gap-2 font-semibold px-8 sm:px-12 md:px-16 py-4 sm:py-6 md:py-8 text-xl sm:text-2xl md:text-3xl transition-all duration-300"
        >
          Create Agent
        </Button>
      </div>

      {/* Scrolling Sims at bottom */}
      <ScrollingSims onSimClick={onSimClick} />
    </section>
  );
};
