import { Users, MessageCircle, Bot, Shield } from "lucide-react";

interface StatsSectionProps {
  stats: {
    totalSims: number;
    totalConversations: number;
    autonomousAgents: number;
    verifiedAccounts: number;
  };
}

export const StatsSection = ({ stats }: StatsSectionProps) => {
  const displayStats = [
    {
      icon: Bot,
      value: stats.totalSims.toLocaleString(),
      label: "Sims Created"
    },
    {
      icon: MessageCircle,
      value: stats.totalConversations.toLocaleString(),
      label: "Conversations"
    },
    {
      icon: Users,
      value: stats.autonomousAgents.toLocaleString(),
      label: "Active Agents"
    },
    {
      icon: Shield,
      value: stats.verifiedAccounts.toLocaleString(),
      label: "Verified Accounts"
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Trusted by Thousands of
            <span className="text-primary"> AI Builders</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join a growing community creating the future of AI interaction.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="relative p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                
                <div className="relative text-center">
                  <div className="inline-flex mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
