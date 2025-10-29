import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
  onExploreSims: () => void;
  isAuthenticated: boolean;
}

export const HeroSection = ({ onGetStarted, onExploreSims, isAuthenticated }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Futuristic background */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />
      
      <div className="container relative z-10 mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm animate-fade-in">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">AI Agent Everything</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight animate-slide-up">
          <span className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Create AI Agents
          </span>
          <br />
          <span className="text-primary">in Seconds</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          Chatbots. Autonomous agents. Token analysts. Verified messaging.
          <br />
          <span className="text-foreground font-medium">One platform. Infinite possibilities.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={onGetStarted}
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover-scale"
          >
            {isAuthenticated ? "Create Your Sim" : "Get Started Free"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onExploreSims}
            className="text-lg px-8 py-6 border-2 hover:bg-muted transition-all duration-300"
          >
            Explore Sims
          </Button>
        </div>
        
        <div className="mt-16 flex flex-wrap gap-8 justify-center items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Deploy instantly</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Fully customizable</span>
          </div>
        </div>
      </div>
    </section>
  );
};
