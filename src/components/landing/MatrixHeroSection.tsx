import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AgentType } from "@/types/agent";

interface MatrixHeroSectionProps {
  onCreateAgent: () => void;
  onSimClick: (sim: AgentType) => void;
  onViewAllAgents: () => void;
}

export const MatrixHeroSection = ({ onCreateAgent, onSimClick, onViewAllAgents }: MatrixHeroSectionProps) => {
  const { theme } = useTheme();

  return (
    <section className="relative h-[70vh] flex flex-col overflow-hidden bg-background">
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
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center max-w-5xl mx-auto w-full">
        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-semibold mb-4 tracking-tight text-foreground text-center w-full">
          Turn your X account into an AI Agent that makes you money.
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
          Add your X account. Generate an AI based on your posts. Create and sell offerings (paid in crypto with x402).
        </p>
        
        <Button
          onClick={onCreateAgent}
          size="lg"
          className="gap-2 font-semibold px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg transition-all duration-300 mb-3 bg-[#82f3aa] hover:bg-[#6dd991] text-black border-0"
        >
          Create an Agent in Seconds
        </Button>
        
        <button
          onClick={onViewAllAgents}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-all duration-300"
        >
          View All Agents
        </button>
      </div>
    </section>
  );
};
