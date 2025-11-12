import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const LAUNCH_DATE = new Date('2025-11-14T17:00:00-06:00'); // November 14th, 5pm CT
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
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
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
      content: (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">Coming Soon</h3>
            <p className="text-muted-foreground">
              SIM is officially launching to the public on Friday, November 14th at 5pm CT
            </p>
          </div>
          
          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
            {[
              { label: 'Days', value: countdown.days },
              { label: 'Hours', value: countdown.hours },
              { label: 'Minutes', value: countdown.minutes },
              { label: 'Seconds', value: countdown.seconds }
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded-lg p-4">
                <div className="text-3xl font-bold text-foreground">{item.value}</div>
                <div className="text-xs text-muted-foreground uppercase">{item.label}</div>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Click "Learn More" to explore what SIM offers
          </p>
        </div>
      )
    },
    {
      title: 'Agentic Sales Platform',
      content: (
        <div className="space-y-4 text-center">
          <h3 className="text-2xl font-bold text-foreground">AI-Powered Sales</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            A knowledgeable AI Agent right on your store that drives more sales and happier customers
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-4xl mb-2">🤖</div>
              <div className="font-semibold text-foreground mb-1">Smart AI Agent</div>
              <div className="text-sm text-muted-foreground">Understands your products and customers</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-4xl mb-2">💬</div>
              <div className="font-semibold text-foreground mb-1">Natural Conversations</div>
              <div className="text-sm text-muted-foreground">Engages customers like a real sales assistant</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-4xl mb-2">📈</div>
              <div className="font-semibold text-foreground mb-1">Drive Sales</div>
              <div className="text-sm text-muted-foreground">Increases conversions and revenue</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'How It Works',
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-foreground text-center">Simple Setup Process</h3>
          <div className="space-y-4 max-w-lg mx-auto">
            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <div className="font-semibold text-foreground">Store Catalog Conversion</div>
                <div className="text-sm text-muted-foreground">Convert your entire store catalog to vector embeddings for AI understanding</div>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <div className="font-semibold text-foreground">Agent Personalization</div>
                <div className="text-sm text-muted-foreground">Customize your AI agent with brand alignment, avatars, and interaction flows</div>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <div className="font-semibold text-foreground">Site Integration</div>
                <div className="text-sm text-muted-foreground">Embed on your website with a simple code snippet</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Try the Demo',
      content: (
        <div className="space-y-4 text-center">
          <h3 className="text-2xl font-bold text-foreground">See It In Action</h3>
          <p className="text-muted-foreground">
            Experience our AI shopping assistant in the floating widget on the bottom right of this page
          </p>
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="text-4xl">💬</div>
            <div className="space-y-2">
              <div className="font-semibold text-foreground">Interactive Demo Available</div>
              <div className="text-sm text-muted-foreground">
                Our AI agent understands your products, answers questions, and guides customers through the buying journey. Close this modal to try the demo on the bottom right of the page.
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-left">
              <div className="text-sm font-semibold text-foreground mb-1">✨ Features</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Product recommendations</li>
                <li>• Natural conversation</li>
                <li>• Purchase assistance</li>
              </ul>
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-foreground mb-1">🎯 Benefits</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 24/7 availability</li>
                <li>• Instant responses</li>
                <li>• Higher conversions</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Contract Address',
      content: (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">Join the SIM Token</h3>
            <p className="text-muted-foreground">
              Be part of the agentic sales revolution
            </p>
          </div>
          
          <div className="bg-muted rounded-lg p-6 space-y-4">
            <div className="text-sm text-muted-foreground uppercase font-semibold">
              Contract Address
            </div>
            <div className="bg-background rounded-lg p-4 font-mono text-sm break-all text-foreground">
              {CONTRACT_ADDRESS}
            </div>
            <Button
              onClick={copyCA}
              variant="outline"
              className="w-full gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Contract Address
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Official launch: November 14th, 2025 at 5pm CT
          </p>
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

  const closeModal = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">{slides[currentSlide].title}</DialogTitle>
        
        <div className="space-y-6 py-4">
          {/* Slide Content */}
          <div className="animate-fade-in">
            {slides[currentSlide].content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="gap-2"
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
                      ? 'bg-primary w-8'
                      : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            {currentSlide < slides.length - 1 ? (
              <Button
                onClick={nextSlide}
                className="gap-2"
              >
                {currentSlide === 0 ? 'Learn More' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={closeModal}
                className="gap-2"
              >
                Get Started
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
