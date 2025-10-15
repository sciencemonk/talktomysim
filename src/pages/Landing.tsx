import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Brain, MessageSquare, Users, Coins, FileText } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "Create Your Own AI",
      description: "Build custom AI simulations tailored to your needs with our powerful creation tools.",
      action: () => navigate("/dashboard"),
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
    },
    {
      icon: MessageSquare,
      title: "Talk to a Sim",
      description: "Engage in conversations with AI personalities across various domains and expertise.",
      action: () => navigate("/live"),
      gradient: "from-accent/20 to-accent/5",
      iconColor: "text-accent",
    },
    {
      icon: Users,
      title: "Watch Sims Debate",
      description: "Experience dynamic debates between AI simulations on trending topics and ideas.",
      action: () => navigate("/sim-directory"),
      gradient: "from-secondary/20 to-secondary/5",
      iconColor: "text-secondary",
    },
    {
      icon: Coins,
      title: "Buy $SIMAI",
      description: "Invest in the future of AI simulations. Get $SIMAI tokens and join our ecosystem.",
      action: () => window.open("https://pump.fun", "_blank"),
      gradient: "from-brandAccent/20 to-brandAccent/5",
      iconColor: "text-brandAccent",
      featured: true,
    },
    {
      icon: FileText,
      title: "Read the Whitepaper",
      description: "Dive deep into our vision, technology, and roadmap for AI simulation platforms.",
      action: () => navigate("/whitepaper"),
      gradient: "from-muted/20 to-muted/5",
      iconColor: "text-fgMuted",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg via-bgMuted to-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-bg/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
              alt="Sim" 
              className="h-8 w-8 object-contain"
            />
          </div>
          <Button variant="brandGradient" onClick={() => window.open("https://pump.fun", "_blank")}>
            Buy $SIMAI
          </Button>
        </div>
      </header>

      {/* Main Section - All Features */}
      <section className="flex-1 flex items-center justify-center container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-7xl w-full">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${
                  feature.featured ? 'border-brandAccent' : 'border-border'
                } bg-gradient-to-br ${feature.gradient}`}
                onClick={feature.action}
              >
                <CardHeader className="pb-3">
                  <div className={`w-10 h-10 rounded-lg bg-bg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${
                    feature.featured ? 'ring-2 ring-brandAccent' : ''
                  }`}>
                    <Icon className={`h-5 w-5 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-base font-bold text-fg">
                    {feature.title}
                    {feature.featured && (
                      <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-brandAccent text-white">
                        Hot
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm text-fgMuted line-clamp-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant={feature.featured ? "brandGradient" : "outline"} 
                    size="sm"
                    className="w-full group-hover:translate-x-1 transition-transform"
                  >
                    {feature.featured ? "Get Started" : "Learn More"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-semibold text-fg">SIMAI</span>
            </div>
            <div className="flex gap-6">
              <button onClick={() => navigate("/whitepaper")} className="text-fgMuted hover:text-fg transition-colors">
                Whitepaper
              </button>
              <button onClick={() => navigate("/contact")} className="text-fgMuted hover:text-fg transition-colors">
                Contact
              </button>
              <button onClick={() => navigate("/sim-directory")} className="text-fgMuted hover:text-fg transition-colors">
                Sims
              </button>
            </div>
            <p className="text-sm text-fgMuted">© 2025 SIMAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
