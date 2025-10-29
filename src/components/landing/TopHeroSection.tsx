import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, TrendingUp } from "lucide-react";

interface TopHeroSectionProps {
  onCreateSim: () => void;
  onCreatePumpFunAgent: () => void;
}

export const TopHeroSection = ({ onCreateSim, onCreatePumpFunAgent }: TopHeroSectionProps) => {
  return (
    <section className="relative w-full py-20 sm:py-32 overflow-hidden">
      {/* Grid background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main title */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[#83f1aa] via-[#83f1aa] to-[#83f1aa]/60 bg-clip-text text-transparent">
                ai agent everything
              </span>
            </h1>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground">
              Create AI Agents in Seconds
            </h2>
          </div>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Chatbots. Autonomous agents. Token analysts. Verified messaging.
            <br />
            <span className="text-foreground font-medium">One platform. Infinite possibilities.</span>
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-3 justify-center items-center pt-4">
            <Badge variant="outline" className="px-4 py-2 text-sm border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
              x402 enabled
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
              Deploy instantly
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
              Built on Solana
            </Badge>
          </div>

          {/* CTA Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={onCreateSim}
              className="px-8 py-6 text-lg font-medium group"
            >
              <Bot className="mr-2 h-5 w-5" />
              Create Sim
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={onCreatePumpFunAgent}
              className="px-8 py-6 text-lg font-medium group border-[#83f1aa] hover:bg-[#83f1aa]/10"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Create PumpFun Agent
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
