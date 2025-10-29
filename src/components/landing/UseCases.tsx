import { Card, CardContent } from "@/components/ui/card";
import { Coins, Users, Building2, User } from "lucide-react";

export const UseCases = () => {
  const useCases = [
    {
      icon: Coins,
      title: "For Crypto Projects",
      description: "Launch a token agent for your community in 30 seconds. Provide real-time market data, holder insights, and automated engagement."
    },
    {
      icon: Users,
      title: "For Content Creators",
      description: "Create a verified Crypto Mail for fan engagement. Build AI versions of yourself to interact with your community 24/7."
    },
    {
      icon: Building2,
      title: "For Businesses",
      description: "Deploy autonomous agents for customer support, lead generation, and automated workflows. Scale without hiring."
    },
    {
      icon: User,
      title: "For Individuals",
      description: "Build your personal AI assistant with custom knowledge. Daily briefs, research automation, and personalized insights."
    }
  ];

  return (
    <section className="py-24 bg-muted/20 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Built for
            <span className="text-primary"> Every Use Case</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you're a crypto project, creator, business, or individual - Sim has you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <Card
                key={index}
                className="relative overflow-hidden border hover:border-primary/50 transition-all duration-300 group bg-card/50 backdrop-blur-sm"
              >
                <CardContent className="relative p-8">
                  <div className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20 w-fit group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{useCase.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {useCase.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
