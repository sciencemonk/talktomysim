import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import xLogo from "@/assets/x-logo.png";

interface SignUpCTASectionProps {
  onSignUp: () => void;
}

export const SignUpCTASection = ({ onSignUp }: SignUpCTASectionProps) => {
  return (
    <section className="relative h-[60vh] flex flex-col overflow-hidden bg-background border-b">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://uovhemqkztmkoozlmqxq.supabase.co/storage/v1/object/sign/trimtab/7585041-hd_1920_1080_25fps.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDZlOGY2My1iYjgzLTQwOGQtYjc1Mi1mOWM0OTMxZjU3OGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0cmltdGFiLzc1ODUwNDEtaGRfMTkyMF8xMDgwXzI1ZnBzLm1wNCIsImlhdCI6MTc2MjMxNzcyNiwiZXhwIjoxNzkzODUzNzI2fQ.YazfV5ZLdQvHRutUaHvxn1i_Ok4gMX9AnCqw-TbuX_o"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50"></div>

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
          Generate with <img src={xLogo} alt="X" className="h-4 w-4 inline-block" />
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  );
};
