import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, TrendingUp, Zap, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ApplicationsGridProps {
  stats?: {
    chatSims: number;
    pumpFunAgents: number;
    autonomousAgents: number;
    cryptoMail: number;
  };
}

export const ApplicationsGrid = ({ stats }: ApplicationsGridProps) => {
  const applications = [
    {
      icon: MessageCircle,
      title: "Chatbot Sims",
      description: "Create AI personalities - historical figures, influencers, experts, or custom characters. Chat naturally with specialized knowledge.",
      examples: ["Einstein", "Elon Musk", "Crypto Experts", "Custom Personalities"],
      badge: "Most Popular",
      badgeVariant: "default" as const,
      metric: stats?.chatSims || 0,
      metricLabel: "Active Chatbots",
      gradient: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-500"
    },
    {
      icon: TrendingUp,
      title: "PumpFun Token Agents",
      description: "Auto-generate AI agents for any PumpFun token. Real-time market analysis, wallet scanning, and token insights.",
      examples: ["Market Cap Tracking", "Holder Analysis", "Trade Insights", "Price Alerts"],
      badge: "Trending",
      badgeVariant: "secondary" as const,
      metric: stats?.pumpFunAgents || 0,
      metricLabel: "Token Agents",
      gradient: "from-green-500/10 to-emerald-500/10",
      iconColor: "text-green-500"
    },
    {
      icon: Zap,
      title: "Autonomous Agents",
      description: "Set-and-forget AI that works 24/7. Daily briefs, automated research, scheduled tasks, and intelligent workflows.",
      examples: ["Daily Crypto Briefs", "News Summaries", "Portfolio Updates", "Market Reports"],
      badge: "Automated",
      badgeVariant: "outline" as const,
      metric: stats?.autonomousAgents || 0,
      metricLabel: "Running 24/7",
      gradient: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-500"
    },
    {
      icon: Mail,
      title: "Crypto Mail",
      description: "Verified on-chain communication. Send and receive messages tied to crypto wallets with proof of identity.",
      examples: ["Verified Influencer Contact", "Wallet-to-Wallet Messages", "On-Chain Identity", "Secure DMs"],
      badge: "Verified",
      badgeVariant: "outline" as const,
      metric: stats?.cryptoMail || 0,
      metricLabel: "Verified Accounts",
      gradient: "from-orange-500/10 to-red-500/10",
      iconColor: "text-orange-500"
    }
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Four Powerful Applications,
            <br />
            <span className="text-primary">One Platform</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the type of AI that fits your needs. Mix and match capabilities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {applications.map((app, index) => {
            const Icon = app.icon;
            return (
              <Card 
                key={index}
                className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <CardHeader className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-card border-2 ${app.iconColor} border-current/20`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <Badge variant={app.badgeVariant} className="text-xs">
                      {app.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">{app.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {app.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {app.examples.map((example, i) => (
                      <span 
                        key={i}
                        className="text-xs px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">{app.metric}+</span>
                      <span className="text-sm text-muted-foreground">{app.metricLabel}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
