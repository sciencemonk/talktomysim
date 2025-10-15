import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Brain, MessageSquare, Users, Coins, FileText } from "lucide-react";
import SimpleFooter from "@/components/SimpleFooter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch historical sim avatars
  const { data: historicalSims } = useQuery({
    queryKey: ['historical-sims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisors')
        .select('avatar_url')
        .eq('sim_type', 'historical')
        .eq('is_active', true)
        .limit(4);
      
      if (error) throw error;
      return data?.map(sim => sim.avatar_url).filter(Boolean) || [];
    },
  });

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
      gridArea: "create",
    },
    {
      icon: MessageSquare,
      title: "Talk to a Sim",
      description: "Engage in conversations with AI personalities across various domains and expertise.",
      action: () => navigate("/live"),
      gradient: "from-accent/20 to-accent/5",
      iconColor: "text-accent",
      gridArea: "talk",
      showAvatars: true,
    },
    {
      icon: Users,
      title: "Watch Sims Debate",
      description: "Experience dynamic debates between AI simulations on trending topics and ideas.",
      action: () => navigate("/sim-directory"),
      gradient: "from-secondary/20 to-secondary/5",
      iconColor: "text-secondary",
      gridArea: "debate",
    },
    {
      icon: Coins,
      title: "Buy $SIMAI",
      description: "Invest in the future of AI simulations. Get $SIMAI tokens and join our ecosystem.",
      action: () => window.open("https://pump.fun", "_blank"),
      gradient: "from-brandAccent/20 to-brandAccent/5",
      iconColor: "text-brandAccent",
      featured: true,
      gridArea: "buy",
    },
    {
      icon: FileText,
      title: "Read the Whitepaper",
      description: "Dive deep into our vision, technology, and roadmap for AI simulation platforms.",
      action: () => navigate("/whitepaper"),
      gradient: "from-muted/20 to-muted/5",
      iconColor: "text-fgMuted",
      gridArea: "whitepaper",
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
      <section className="flex-1 flex items-center justify-center container mx-auto px-4 py-6">
        <div 
          className="grid gap-3 max-w-6xl w-full"
          style={{
            gridTemplateAreas: `
              "create create talk talk"
              "debate debate talk talk"
              "buy whitepaper talk talk"
            `,
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "auto auto auto"
          }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isMainFeature = ['create', 'talk', 'debate'].includes(feature.gridArea);
            return (
              <Card 
                key={index}
                className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 ${
                  feature.featured ? 'border-brandAccent' : 'border-border'
                } bg-gradient-to-br ${feature.gradient} flex flex-col`}
                style={{ gridArea: feature.gridArea }}
                onClick={feature.action}
              >
                <CardHeader className="pb-3 p-4">
                  <div className={`${isMainFeature ? 'w-10 h-10' : 'w-8 h-8'} rounded-lg bg-bg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${
                    feature.featured ? 'ring-2 ring-brandAccent' : ''
                  }`}>
                    <Icon className={`${isMainFeature ? 'h-5 w-5' : 'h-4 w-4'} ${feature.iconColor}`} />
                  </div>
                  <CardTitle className={`${isMainFeature ? 'text-lg' : 'text-base'} font-bold text-fg`}>
                    {feature.title}
                    {feature.featured && (
                      <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-brandAccent text-white">
                        Hot
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className={`text-sm text-fgMuted ${isMainFeature ? '' : 'line-clamp-2'}`}>
                    {feature.description}
                  </CardDescription>
                  
                  {feature.showAvatars && historicalSims && historicalSims.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {historicalSims.map((avatar, i) => (
                        <img 
                          key={i}
                          src={avatar} 
                          alt={`Historical sim ${i + 1}`}
                          className="w-10 h-10 rounded-full object-cover border-2 border-bg shadow-sm"
                        />
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0 mt-auto p-4">
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

      <SimpleFooter />
    </div>
  );
};

export default Landing;
