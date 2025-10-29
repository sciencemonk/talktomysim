import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface MatrixHeroSectionProps {
  onCreateAgent: () => void;
}

export const MatrixHeroSection = ({ onCreateAgent }: MatrixHeroSectionProps) => {
  const [visibleChars, setVisibleChars] = useState(0);
  const text = "ai agent everything";
  
  useEffect(() => {
    if (visibleChars < text.length) {
      const timeout = setTimeout(() => {
        setVisibleChars(prev => prev + 1);
      }, 100); // Adjust speed of character appearance
      
      return () => clearTimeout(timeout);
    }
  }, [visibleChars, text.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Matrix-style grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-12 tracking-tight">
          {text.split('').map((char, index) => (
            <span
              key={index}
              className={`inline-block transition-all duration-300 ${
                index < visibleChars 
                  ? 'opacity-100 text-[#82f2aa]' 
                  : 'opacity-0'
              }`}
              style={{
                textShadow: index < visibleChars 
                  ? '0 0 20px #82f2aa, 0 0 40px #82f2aa' 
                  : 'none'
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
        
        {visibleChars >= text.length && (
          <Button
            onClick={onCreateAgent}
            size="lg"
            className="animate-fade-in px-12 py-6 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: '#82f2aa',
              color: '#000',
            }}
          >
            Create Agent
          </Button>
        )}
      </div>
    </section>
  );
};
