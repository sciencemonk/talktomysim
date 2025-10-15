import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Brain, MessageSquare, Users, Coins, FileText } from "lucide-react";
import SimpleFooter from "@/components/SimpleFooter";
import { useToast } from "@/hooks/use-toast";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const copyCAToClipboard = async () => {
    const ca = "FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump";
    try {
      await navigator.clipboard.writeText(ca);
      toast({
        title: "Copied!",
        description: "Contract address copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const features = [
    {
      icon: Brain,
      title: "Create Your Own AI",
      description: "Build custom AI simulations tailored to your needs with our powerful creation tools.",
      action: () => navigate("/dashboard"),
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
      size: "large",
    },
    {
      icon: MessageSquare,
      title: "Talk to a Sim",
      description: "Engage in conversations with AI personalities across various domains and expertise.",
      action: () => navigate("/live"),
      gradient: "from-accent/20 to-accent/5",
      iconColor: "text-accent",
      size: "large",
      showAvatars: true,
    },
    {
      icon: Users,
      title: "Watch Sims Debate",
      description: "Experience dynamic debates between AI simulations on trending topics and ideas.",
      action: () => navigate("/sim-directory"),
      gradient: "from-secondary/20 to-secondary/5",
      iconColor: "text-secondary",
      size: "large",
    },
    {
      icon: Coins,
      title: "Buy $SIMAI",
      description: "Invest in the future of AI simulations. Get $SIMAI tokens and join our ecosystem.",
      action: () => window.open("https://pump.fun", "_blank"),
      gradient: "from-brandAccent/20 to-brandAccent/5",
      iconColor: "text-brandAccent",
      featured: true,
      size: "small",
    },
    {
      icon: FileText,
      title: "Read the Whitepaper",
      description: "Dive deep into our vision, technology, and roadmap for AI simulation platforms.",
      action: () => navigate("/whitepaper"),
      gradient: "from-muted/20 to-muted/5",
      iconColor: "text-fgMuted",
      size: "small",
    },
  ];

  const avatarPreviews = [
    "/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png",
    "/lovable-uploads/1bcbaef9-d3ee-43db-88b5-00437f50935e.png",
    "/lovable-uploads/29ef3bcb-9544-4a2c-bfbd-57ce889d1989.png",
    "/lovable-uploads/31a26b17-27fc-463a-9eb2-a5e764de804e.png",
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
          <button
            onClick={copyCAToClipboard}
            className="text-[10px] sm:text-xs font-mono bg-muted hover:bg-muted/80 px-2 sm:px-3 py-1 rounded-md text-fg transition-colors cursor-pointer"
            title="Click to copy contract address"
          >
            FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump
          </button>
        </div>
      </header>

      {/* Main Section - All Features */}
      <section className="flex-1 flex items-center justify-center container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl w-full auto-rows-fr">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLarge = feature.size === "large";
            return (
              <Card 
                key={index}
                className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${
                  feature.featured ? 'border-brandAccent' : 'border-border'
                } bg-gradient-to-br ${feature.gradient} ${
                  isLarge ? 'md:row-span-2' : ''
                } flex flex-col`}
                onClick={feature.action}
              >
                <CardHeader className={isLarge ? "pb-4" : "pb-3"}>
                  <div className={`${isLarge ? 'w-12 h-12' : 'w-10 h-10'} rounded-lg bg-bg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${
                    feature.featured ? 'ring-2 ring-brandAccent' : ''
                  }`}>
                    <Icon className={`${isLarge ? 'h-6 w-6' : 'h-5 w-5'} ${feature.iconColor}`} />
                  </div>
                  <CardTitle className={`${isLarge ? 'text-xl' : 'text-base'} font-bold text-fg`}>
                    {feature.title}
                    {feature.featured && (
                      <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-brandAccent text-white">
                        Hot
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className={`${isLarge ? 'text-base' : 'text-sm'} text-fgMuted ${isLarge ? '' : 'line-clamp-2'}`}>
                    {feature.description}
                  </CardDescription>
                  
                  {feature.showAvatars && (
                    <div className="flex gap-2 mt-4 flex-wrap">
                      {avatarPreviews.map((avatar, i) => (
                        <img 
                          key={i}
                          src={avatar} 
                          alt={`Sim avatar ${i + 1}`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-bg shadow-sm"
                        />
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0 mt-auto">
                  <Button 
                    variant={feature.featured ? "brandGradient" : "outline"} 
                    size={isLarge ? "default" : "sm"}
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

      <SimpleFooter />
    </div>
  );
};

export default Landing;
