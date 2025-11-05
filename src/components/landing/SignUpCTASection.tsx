import { Button } from "@/components/ui/button";
import { Twitter } from "lucide-react";
import xIcon from "@/assets/x-icon.png";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SignUpCTASectionProps {
  onSignUp: () => void;
}

export const SignUpCTASection = ({ onSignUp }: SignUpCTASectionProps) => {
  const handleXSignIn = async () => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Error signing in with X:', error);
      toast.error(error?.message || 'Failed to sign in with X');
    }
  };

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
          src="https://uovhemqkztmkoozlmqxq.supabase.co/storage/v1/object/sign/trimtab/4426378-uhd_3840_2160_25fps.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDZlOGY2My1iYjgzLTQwOGQtYjc1Mi1mOWM0OTMxZjU3OGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0cmltdGFiLzQ0MjYzNzgtdWhkXzM4NDBfMjE2MF8yNWZwcy5tcDQiLCJpYXQiOjE3NjIzMTYzOTgsImV4cCI6MTc5Mzg1MjM5OH0.m-yCbNjzr3XR15fzejjFmaZNqbtC-fU0_J9aUDlTEd8"
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
          onClick={handleXSignIn}
          size="lg"
          className="gap-2 font-bold px-8 py-5 text-base transition-all duration-300 bg-[#82f3aa] hover:bg-[#6dd991] text-black border-0 shadow-xl shadow-[#82f3aa]/30 hover:shadow-2xl hover:shadow-[#82f3aa]/40 hover:scale-105 whitespace-nowrap"
        >
          Get Started with <img src={xIcon} alt="X" className="h-5 w-5 inline-block" />
        </Button>
      </div>
    </section>
  );
};
