import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Settings, Rocket } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      icon: Sparkles,
      title: "Create",
      description: "Name your Sim, choose type (Chat, PumpFun Agent, Autonomous, or Crypto Mail), and customize personality and knowledge base."
    },
    {
      icon: Settings,
      title: "Configure",
      description: "Add powerful integrations like web search, wallet analysis, token data, Google Calendar, and more to enhance capabilities."
    },
    {
      icon: Rocket,
      title: "Deploy",
      description: "Share publicly with custom URLs, embed on websites, monetize with x402 API, or keep private for personal use."
    }
  ];

  return (
    <section className="py-24 bg-background relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      <div className="container relative mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Get Started in
            <span className="text-primary"> Three Steps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Building your AI agent is quick and straightforward. No coding required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/4 left-full w-full h-px bg-gradient-to-r from-primary/30 to-transparent -z-10" />
                )}
                
                <Card className="relative overflow-hidden border hover:border-primary/50 transition-all duration-300 h-full bg-card/50 backdrop-blur-sm group">
                  <CardContent className="p-6 text-center">
                    <div className="relative inline-flex mb-6">
                      <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative p-4 rounded-2xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300">
                        <Icon className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                    
                    <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{index + 1}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
