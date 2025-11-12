import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { FloatingAgentDemo } from './FloatingAgentDemo';
import shopifyLogo from '@/assets/shopify-logo.png';
import visaLogo from '@/assets/visa-logo.png';
import callCenterAgent from '@/assets/call-center-agent.png';


interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const LAUNCH_DATE = new Date('2025-11-13T20:00:00-06:00'); // November 13th, 8pm CT
const CONTRACT_ADDRESS = 'FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump';

export const LaunchCountdownModal = () => {
  const [open, setOpen] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date().getTime();
      const distance = LAUNCH_DATE.getTime() - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(distance / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const copyCA = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Contract address copied to clipboard');
  };

  const slides = [
    {
      title: 'Official Launch',
      hasVideoBackground: true,
      content: (
        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <img src="/sim-logo-white.png" alt="SIM" className="h-16 w-auto" />
            </div>
            <h3 className="text-3xl font-bold text-white">Official Public Launch</h3>
            <p className="text-lg text-white/80 max-w-md mx-auto">
              Join us as we revolutionize e-commerce with AI-powered sales agents
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { label: 'Hours', value: countdown.hours },
              { label: 'Minutes', value: countdown.minutes },
              { label: 'Seconds', value: countdown.seconds }
            ].map((item) => (
              <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-4xl font-bold text-white">{item.value}</div>
                <div className="text-xs text-white/70 uppercase font-medium">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto border border-white/20">
            <p className="text-sm font-semibold text-white mb-1">
              📅 Thursday, November 13th, 2025
            </p>
            <p className="text-sm text-white/80">
              8:00 PM Central Time
            </p>
          </div>

          <p className="text-sm text-white/70">
            Click "Learn More" to see what SIM offers
          </p>
        </div>
      )
    },
    {
      title: 'Agentic Sales Platform',
      hasVideoBackground: false,
      content: (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-foreground">Agentic Sales Platform</h3>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              A knowledgeable AI Agent right on your store that drives more sales and happier customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl p-6 border border-violet-500/20">
              <div className="text-5xl mb-3">🤖</div>
              <div className="font-bold text-foreground mb-2">Smart AI Agent</div>
              <div className="text-sm text-muted-foreground">Understands your products and customers deeply</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/20">
              <div className="text-5xl mb-3">💬</div>
              <div className="font-bold text-foreground mb-2">Natural Conversations</div>
              <div className="text-sm text-muted-foreground">Engages customers like a real sales assistant</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl p-6 border border-emerald-500/20">
              <div className="text-5xl mb-3">📈</div>
              <div className="font-bold text-foreground mb-2">Drive Sales</div>
              <div className="text-sm text-muted-foreground">Increases conversions and customer satisfaction</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t">
            <img src={shopifyLogo} alt="Shopify" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
            <img src={visaLogo} alt="Visa" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
            <div className="text-2xl font-bold text-primary opacity-70 hover:opacity-100 transition-opacity">x402</div>
          </div>
        </div>
      )
    },
    {
      title: 'How It Works',
      hasVideoBackground: false,
      content: (
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-foreground text-center">Simple Setup Process</h3>
          <div className="space-y-4 max-w-xl mx-auto mt-8">
            <div className="flex gap-4 items-start bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20">
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                1
              </div>
              <div className="space-y-1">
                <div className="font-bold text-foreground text-lg">Store Catalog Conversion</div>
                <div className="text-sm text-muted-foreground">Transform your entire store catalog into vector embeddings that AI can understand and reason about</div>
              </div>
            </div>
            <div className="flex gap-4 items-start bg-gradient-to-br from-violet-500/5 to-violet-500/10 rounded-xl p-5 border border-violet-500/20">
              <div className="bg-violet-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                2
              </div>
              <div className="space-y-1">
                <div className="font-bold text-foreground text-lg">Agent Personalization</div>
                <div className="text-sm text-muted-foreground">Customize your AI agent with brand-specific avatars, speech patterns, and interaction flows</div>
              </div>
            </div>
            <div className="flex gap-4 items-start bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 rounded-xl p-5 border border-emerald-500/20">
              <div className="bg-emerald-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                3
              </div>
              <div className="space-y-1">
                <div className="font-bold text-foreground text-lg">Site Integration</div>
                <div className="text-sm text-muted-foreground">Embed on your website with a simple code snippet - works with Shopify and any platform</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Contract Address',
      hasVideoBackground: false,
      content: (
        <div className="space-y-6 text-center">
          <div className="space-y-3">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-full p-4">
                <img src="/sim-logo-white.png" alt="SIM" className="h-12 w-auto" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-foreground">Join the SIM Revolution</h3>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Be part of the future of agentic e-commerce
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 space-y-4 border border-primary/20 max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground uppercase font-bold tracking-wider">
              <div className="w-8 h-px bg-primary/30"></div>
              Contract Address
              <div className="w-8 h-px bg-primary/30"></div>
            </div>
            <div className="bg-background rounded-lg p-5 font-mono text-xs sm:text-sm break-all text-foreground font-semibold shadow-inner">
              {CONTRACT_ADDRESS}
            </div>
            <Button
              onClick={copyCA}
              variant="default"
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              size="lg"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  Copy Contract Address
                </>
              )}
            </Button>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm font-semibold text-foreground mb-1">
              🚀 Launch Date
            </p>
            <p className="text-sm text-muted-foreground">
              November 13th, 2025 • 8:00 PM CT
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-2xl max-h-[90vh] overflow-hidden p-0 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">{slides[currentSlide].title}</DialogTitle>
        
        {/* Video Background - Only for first slide */}
        {slides[currentSlide].hasVideoBackground && (
          <>
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="https://uovhemqkztmkoozlmqxq.supabase.co/storage/v1/object/public/sim/4962796-uhd_3840_2160_25fps.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/60" />
          </>
        )}
        
        <div className="relative z-10 space-y-6 py-4">
          {/* Slide Content */}
          <div className="px-6 animate-fade-in">
            {slides[currentSlide].content}
          </div>

          {/* Navigation */}
          <div className={`flex items-center justify-between px-6 pt-4 border-t ${slides[currentSlide].hasVideoBackground ? 'border-white/20' : 'border-border'}`}>
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`gap-2 ${slides[currentSlide].hasVideoBackground ? 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white' : ''}`}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentSlide
                      ? `w-8 ${slides[currentSlide].hasVideoBackground ? 'bg-white' : 'bg-primary'}`
                      : slides[currentSlide].hasVideoBackground ? 'bg-white/30' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className={`gap-2 ${slides[currentSlide].hasVideoBackground ? 'bg-white text-black hover:bg-white/90' : ''}`}
            >
              {currentSlide === 0 ? 'Learn More' : currentSlide < slides.length - 1 ? 'Next' : 'View CA'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
