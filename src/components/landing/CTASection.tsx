import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";

interface CTASectionProps {
  onGetStarted: () => void;
  onViewWhitepaper: () => void;
  isAuthenticated: boolean;
}

export const CTASection = ({ onGetStarted, onViewWhitepaper, isAuthenticated }: CTASectionProps) => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(131,241,170,0.1),transparent_70%)]" />
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Start Building Your
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
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
              className="text-lg px-10 py-7 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-primary/25 transition-all duration-300"
            >
              {isAuthenticated ? "Create Your First Sim" : "Get Started Free"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onViewWhitepaper}
              className="text-lg px-10 py-7 border-2 hover:bg-accent/50"
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
