import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AgentType } from "@/types/agent";
import xLogo from "@/assets/x-logo.png";

interface MatrixHeroSectionProps {
  onCreateXAgent: () => void;
  onSimClick: (sim: AgentType) => void;
  onViewAllAgents: () => void;
}

export const MatrixHeroSection = ({ onCreateXAgent, onSimClick, onViewAllAgents }: MatrixHeroSectionProps) => {
  const { theme } = useTheme();


  return (
    <section className="relative min-h-[80vh] flex flex-col overflow-hidden bg-background pb-0">
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
        {/* Powered by badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50">
          <span className="text-xs sm:text-sm text-muted-foreground font-medium">Powered by</span>
          <span className="text-xs sm:text-sm font-bold text-foreground">x402</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold mb-4 tracking-tight text-foreground text-center w-full">
          Turn your X account into an AI Agent that makes you money
        </h1>
        
        {/* Zero fees text */}
        <p className="text-sm sm:text-base text-[#82f3aa] font-semibold mb-3">
          Accept crypto payments instantly with zero fees — powered by x402
        </p>
        
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl leading-relaxed">
          Create an autonomous storefront that accepts payments directly from your customers. No middlemen. No platform fees. Just pure revenue.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-10 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#82f3aa] text-black font-bold text-base shrink-0 shadow-lg shadow-[#82f3aa]/20 transition-transform group-hover:scale-110">
              1
            </div>
            <p className="text-sm sm:text-base text-foreground font-semibold">Verify X account</p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[#82f3aa]">
            <div className="w-8 h-0.5 bg-[#82f3aa]/30"></div>
            <span className="text-lg">→</span>
            <div className="w-8 h-0.5 bg-[#82f3aa]/30"></div>
          </div>

          <div className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#82f3aa] text-black font-bold text-base shrink-0 shadow-lg shadow-[#82f3aa]/20 transition-transform group-hover:scale-110">
              2
            </div>
            <p className="text-sm sm:text-base text-foreground font-semibold">Create storefront</p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[#82f3aa]">
            <div className="w-8 h-0.5 bg-[#82f3aa]/30"></div>
            <span className="text-lg">→</span>
            <div className="w-8 h-0.5 bg-[#82f3aa]/30"></div>
          </div>

          <div className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#82f3aa] text-black font-bold text-base shrink-0 shadow-lg shadow-[#82f3aa]/20 transition-transform group-hover:scale-110">
              3
            </div>
            <p className="text-sm sm:text-base text-foreground font-semibold">Start selling</p>
          </div>
        </div>

        <Button
          onClick={onCreateXAgent}
          size="lg"
          className="gap-2 font-bold px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl transition-all duration-300 mb-4 bg-[#82f3aa] hover:bg-[#6dd991] text-black border-0 shadow-xl shadow-[#82f3aa]/30 hover:shadow-2xl hover:shadow-[#82f3aa]/40 hover:scale-105"
        >
          Generate with <img src={xLogo} alt="X" className="h-5 w-5 inline-block" />
        </Button>

        <button
          onClick={onViewAllAgents}
          className="text-sm text-muted-foreground hover:text-[#82f3aa] hover:underline transition-all duration-300 font-medium"
        >
          Learn More
        </button>
      </div>

    </section>
  );
};
