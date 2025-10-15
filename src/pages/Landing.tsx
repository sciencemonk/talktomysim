import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Brain, MessageSquare, Users, Coins, FileText, Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-bg via-bgMuted to-bg">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-bg/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-fg">SIMAI</h1>
          </div>
          <Button variant="brandGradient" onClick={() => window.open("https://pump.fun", "_blank")}>
            Buy $SIMAI
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">The Future of AI Simulations</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-fg via-primary to-fg bg-clip-text text-transparent leading-tight">
            Think With AI.
            <br />
            Powered by $SIMAI
          </h1>
          
          <p className="text-xl md:text-2xl text-fgMuted max-w-2xl mx-auto">
            Create, interact, and invest in the next generation of AI simulation technology.
            Join the revolution.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button 
              size="lg" 
              variant="brandGradient"
              className="text-lg px-8"
              onClick={() => window.open("https://pump.fun", "_blank")}
            >
              <Coins className="mr-2 h-5 w-5" />
              Buy $SIMAI Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8"
              onClick={() => navigate("/live")}
            >
              Try It Free
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${
                  feature.featured ? 'border-brandAccent md:col-span-2 lg:col-span-1' : 'border-border'
                } bg-gradient-to-br ${feature.gradient}`}
                onClick={feature.action}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                    feature.featured ? 'ring-2 ring-brandAccent' : ''
                  }`}>
                    <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-fg">
                    {feature.title}
                    {feature.featured && (
                      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-brandAccent text-white">
                        Featured
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-fgMuted">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant={feature.featured ? "brandGradient" : "outline"} 
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

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-3xl my-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <h3 className="text-4xl md:text-5xl font-bold text-primary">10K+</h3>
            <p className="text-fgMuted">Active Simulations</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl md:text-5xl font-bold text-accent">50K+</h3>
            <p className="text-fgMuted">Conversations</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl md:text-5xl font-bold text-secondary">24/7</h3>
            <p className="text-fgMuted">AI Availability</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6 p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-border">
          <h2 className="text-3xl md:text-5xl font-bold text-fg">
            Ready to Join the AI Revolution?
          </h2>
          <p className="text-xl text-fgMuted">
            Get $SIMAI tokens today and be part of the future of AI simulations.
          </p>
          <Button 
            size="lg" 
            variant="brandGradient"
            className="text-lg px-12"
            onClick={() => window.open("https://pump.fun", "_blank")}
          >
            <Coins className="mr-2 h-5 w-5" />
            Buy $SIMAI
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
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
