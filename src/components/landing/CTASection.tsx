import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";

interface CTASectionProps {
  onGetStarted: () => void;
  onViewWhitepaper: () => void;
  isAuthenticated: boolean;
}

export const CTASection = ({ onGetStarted, onViewWhitepaper, isAuthenticated }: CTASectionProps) => {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Futuristic background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Start Building Your
            <br />
            <span className="text-primary">
              AI Agent Today
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Join thousands of builders creating the future of AI interaction.
            <br />
            No credit card required. Deploy in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="text-lg px-10 py-7 bg-primary hover:bg-primary/80 text-primary-foreground shadow-xl transition-all duration-300 hover-scale"
            >
              {isAuthenticated ? "Create Your First Sim" : "Get Started Free"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onViewWhitepaper}
              className="text-lg px-10 py-7 border-2 hover:bg-muted transition-all duration-300"
            >
              <FileText className="mr-2 h-5 w-5" />
              Read Whitepaper
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-6 justify-center items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>Free tier available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>No coding required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>Deploy instantly</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>Full customization</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
