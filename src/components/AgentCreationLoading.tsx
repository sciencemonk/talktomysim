import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Bot, Zap, Network, Shield } from "lucide-react";

const AgentCreationLoading = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Shield, text: "Verifying X Account Identity", delay: 0 },
    { icon: Network, text: "Establishing Neural Pathways", delay: 1500 },
    { icon: Zap, text: "Initializing Utility Function", delay: 3000 },
    { icon: Bot, text: "Deploying Autonomous Agent", delay: 4500 }
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    steps.forEach((step, index) => {
      setTimeout(() => setCurrentStep(index), step.delay);
    });

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-border bg-card/80 backdrop-blur-sm p-8 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1.5 mb-4 text-xs font-mono bg-primary/10 border border-primary/20 rounded-full text-primary animate-fade-in">
            SIM INITIALIZATION PROTOCOL
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2 font-mono">
            Creating Your AI Agent
          </h2>
          <p className="text-muted-foreground">
            Establishing secure connection and deploying autonomous systems
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2 font-mono">
            {progress}% Complete
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;
            
            return (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 ${
                  isActive 
                    ? 'border-primary bg-primary/5 animate-fade-in' 
                    : isComplete
                    ? 'border-border bg-muted/30'
                    : 'border-border/50 bg-background/50 opacity-50'
                }`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/20 border-2 border-primary animate-pulse'
                    : isComplete
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-muted border border-border'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    isActive || isComplete ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <p className={`font-mono text-sm ${
                  isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                }`}>
                  {step.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground font-mono">
            Powered by cryptographic identity verification • Social proof mechanisms active
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AgentCreationLoading;
