import { Button } from "@/components/ui/button";
import { AgentType } from "@/types/agent";
import xIcon from "@/assets/x-icon.png";
import solanaLogo from "@/assets/solana-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
interface MatrixHeroSectionProps {
  onCreateXAgent: () => void;
  onSimClick: (sim: AgentType) => void;
  onViewAllAgents: () => void;
}
export const MatrixHeroSection = ({
  onCreateXAgent,
  onSimClick,
  onViewAllAgents
}: MatrixHeroSectionProps) => {
  const navigate = useNavigate();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = ["Products", "Services", "AI Agents", "Digital Goods"];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex(prev => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText("FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump");
      toast.success("Address copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };
  const handleXSignIn = async () => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const {
        data,
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false
        }
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
  return <section className="relative min-h-[80vh] flex flex-col overflow-hidden bg-background pb-0">
      {/* Video Background */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="https://uovhemqkztmkoozlmqxq.supabase.co/storage/v1/object/sign/trimtab/4426378-uhd_3840_2160_25fps.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDZlOGY2My1iYjgzLTQwOGQtYjc1Mi1mOWM0OTMxZjU3OGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0cmltdGFiLzQ0MjYzNzgtdWhkXzM4NDBfMjE2MF8yNWZwcy5tcDQiLCJpYXQiOjE3NjIzMTYzOTgsImV4cCI6MTc5Mzg1MjM5OH0.m-yCbNjzr3XR15fzejjFmaZNqbtC-fU0_J9aUDlTEd8" type="video/mp4" />
      </video>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Top Bar with Sign In Button */}
      <div className="absolute top-0 left-0 right-0 z-50 w-full px-4 py-6 flex items-center justify-end">
        <Button onClick={handleXSignIn} size="sm" className="bg-[#635BFF] hover:bg-[#5046E5] text-white font-semibold px-6 py-2 transition-all duration-300 hover:scale-105">
          Sign In
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-24 text-center max-w-5xl mx-auto w-full">
        {/* $SIMAI badge */}
        <button onClick={handleCopyAddress} className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm transition-all cursor-pointer shadow-sm text-slate-950 bg-[#000a0e]/[0.39]">
          <img src={solanaLogo} alt="Solana" className="h-5 w-5" />
          <span className="text-xs sm:text-sm font-bold text-zinc-50">Solana Internet Market</span>
        </button>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold mb-4 tracking-tight text-white text-center w-full">
          Sell your{" "}
          <span key={currentWordIndex} className="inline-block text-white animate-fade-in">
            {words[currentWordIndex]}
          </span>
        </h1>
        
        {/* Zero fees text */}
        <p className="text-sm sm:text-base text-white font-semibold mb-3">
          Accept crypto payments instantly with zero fees
        </p>
        
        <Button onClick={handleXSignIn} size="lg" className="gap-2 font-bold px-8 py-5 text-base transition-all duration-300 bg-[#635cff] hover:bg-[#5046E5] text-white border-0 shadow-xl shadow-[#635cff]/30 hover:shadow-2xl hover:shadow-[#635cff]/40 hover:scale-105 whitespace-nowrap mb-12">
          Create Your Store with <img src={xIcon} alt="X" className="h-5 w-5 inline-block" />
        </Button>
      </div>
    </section>;
};