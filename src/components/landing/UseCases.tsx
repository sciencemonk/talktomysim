import { Card, CardContent } from "@/components/ui/card";
import { Coins, Users, Building2, User } from "lucide-react";

export const UseCases = () => {
  const useCases = [
    {
      icon: Coins,
      title: "For Crypto Projects",
      description: "Launch a token agent for your community in 30 seconds. Provide real-time market data, holder insights, and automated engagement.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "For Content Creators",
      description: "Create a verified Crypto Mail for fan engagement. Build AI versions of yourself to interact with your community 24/7.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Building2,
      title: "For Businesses",
      description: "Deploy autonomous agents for customer support, lead generation, and automated workflows. Scale without hiring.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: User,
      title: "For Individuals",
      description: "Build your personal AI assistant with custom knowledge. Daily briefs, research automation, and personalized insights.",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
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
                className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <CardContent className="relative p-8">
                  <div className={`mb-4 p-4 rounded-xl bg-gradient-to-br ${useCase.gradient} w-fit`}>
                    <Icon className="h-8 w-8 text-white" />
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
