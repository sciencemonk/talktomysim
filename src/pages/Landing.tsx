import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import SimpleFooter from "@/components/SimpleFooter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch historical sims with full data
  const { data: historicalSims } = useQuery({
    queryKey: ['historical-sims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisors')
        .select('id, name, avatar_url, custom_url')
        .eq('sim_type', 'historical')
        .eq('is_active', true)
        .limit(4);
      
      if (error) throw error;
      return data || [];
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
      title: "Create Your Own AI",
      description: "Build custom AI simulations tailored to your needs with our powerful creation tools.",
      action: () => navigate("/dashboard"),
      gradient: "from-primary/20 to-primary/5",
      gridArea: "create",
    },
    {
      title: "Talk to a Sim",
      description: "Engage in conversations with AI personalities across various domains and expertise.",
      action: () => navigate("/live"),
      gradient: "from-accent/20 to-accent/5",
      gridArea: "talk",
      showSims: true,
    },
    {
      title: "Watch Sims Debate",
      description: "Experience dynamic debates between AI simulations on trending topics and ideas.",
      action: () => navigate("/sim-directory"),
      gradient: "from-secondary/20 to-secondary/5",
      gridArea: "debate",
    },
    {
      title: "Read the Whitepaper",
      description: "Dive deep into our vision, technology, and roadmap for AI simulation platforms.",
      action: () => navigate("/whitepaper"),
      gradient: "from-muted/20 to-muted/5",
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
              "whitepaper whitepaper talk talk"
            `,
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "auto auto auto"
          }}
        >
          {features.map((feature, index) => {
            const isMainFeature = ['create', 'talk', 'debate'].includes(feature.gridArea);
            return (
              <Card 
                key={index}
                className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 border-border bg-gradient-to-br ${feature.gradient} flex flex-col`}
                style={{ gridArea: feature.gridArea }}
                onClick={!feature.showSims ? feature.action : undefined}
              >
                <CardHeader className="pb-3 p-4">
                  <CardTitle className={`${isMainFeature ? 'text-lg' : 'text-base'} font-bold text-fg`}>
                    {feature.title}
                  </CardTitle>
                  <CardDescription className={`text-sm text-fgMuted ${isMainFeature ? '' : 'line-clamp-2'}`}>
                    {feature.description}
                  </CardDescription>
                  
                  {feature.showSims && historicalSims && historicalSims.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {historicalSims.map((sim) => (
                        <button
                          key={sim.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/sim/${sim.custom_url || sim.id}`);
                          }}
                          className="flex flex-col items-center gap-2 p-3 rounded-lg bg-bg/50 hover:bg-bg transition-colors"
                        >
                          <img 
                            src={sim.avatar_url} 
                            alt={sim.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-border shadow-sm"
                          />
                          <span className="text-xs font-medium text-fg text-center line-clamp-2">
                            {sim.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0 mt-auto p-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full group-hover:translate-x-1 transition-transform"
                    onClick={feature.showSims ? (e) => {
                      e.stopPropagation();
                      navigate("/sim-directory");
                    } : undefined}
                  >
                    {feature.showSims ? "View All" : "Learn More"}
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
