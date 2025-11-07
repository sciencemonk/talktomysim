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
    <section className="relative h-[60vh] flex flex-col overflow-hidden bg-white border-b border-gray-200">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://kxsvyeirqimcydtkowga.supabase.co/storage/v1/object/sign/storage/5404707-uhd_3840_2160_25fps.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNDczMmYzNC1kYzc2LTRhNzgtOGNmOC05MDE5NTRhM2RkMjgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9yYWdlLzU0MDQ3MDctdWhkXzM4NDBfMjE2MF8yNWZwcy5tcDQiLCJpYXQiOjE3NjI0ODU3MDUsImV4cCI6MTc5NDAyMTcwNX0.Pytq982adrUXc9sNaK_Z0yivbwROhesiqMIjyWRe-ME"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto w-full">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold mb-6 tracking-tight text-white">
          Ready to Start Selling?
        </h2>

        <p className="text-lg sm:text-xl text-white mb-8 max-w-2xl">
          Accept crypto payments instantly with zero fees
        </p>

        <Button
          onClick={handleXSignIn}
          size="lg"
          className="gap-2 font-bold px-8 py-5 text-base transition-all duration-300 bg-[#635BFF] hover:bg-[#5046E5] text-white border-0 shadow-xl hover:shadow-2xl hover:scale-105 whitespace-nowrap"
        >
          Get Started with <img src={xIcon} alt="X" className="h-5 w-5 inline-block" />
        </Button>
      </div>
    </section>
  );
};
