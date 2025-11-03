import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import xLogo from "@/assets/x-logo.png";

interface SignUpCTASectionProps {
  onSignUp: () => void;
}

export const SignUpCTASection = ({ onSignUp }: SignUpCTASectionProps) => {
  return (
    <section className="relative h-[60vh] flex flex-col overflow-hidden bg-background border-b">
      {/* Matrix-style grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background"></div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto w-full">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold mb-6 tracking-tight text-foreground">
          Ready to Start Selling?
        </h2>

        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl">
          Create your agentic storefront in minutes. No technical knowledge required.
        </p>

        <Button
          onClick={onSignUp}
          size="lg"
          className="gap-2 font-semibold px-8 py-6 text-base sm:text-lg transition-all duration-300 bg-[#82f3aa] hover:bg-[#6dd991] text-black border-0 group"
        >
          Sign in with <img src={xLogo} alt="X" className="h-4 w-4 inline-block" />
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  );
};
