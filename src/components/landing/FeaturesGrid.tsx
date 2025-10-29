import { Link2, Palette, DollarSign, BarChart3, Share2, Wallet } from "lucide-react";

export const FeaturesGrid = () => {
  const features = [
    {
      icon: Link2,
      title: "Powerful Integrations",
      description: "Web search, wallet analysis, token data, Google Calendar, and more. Expand your AI's capabilities."
    },
    {
      icon: Palette,
      title: "Full Customization",
      description: "Personality, knowledge base, appearance, welcome messages, and system prompts. Make it yours."
    },
    {
      icon: DollarSign,
      title: "x402 API Monetization",
      description: "Turn your Sims into revenue streams. Set pricing and get paid per API call automatically."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track conversations, usage patterns, performance metrics, and user engagement in real-time."
    },
    {
      icon: Share2,
      title: "Share Anywhere",
      description: "Custom URLs, website embeds, QR codes, social sharing. Deploy your AI everywhere."
    },
    {
      icon: Wallet,
      title: "Crypto-Native",
      description: "Wallet connections, on-chain verification, token gating, and blockchain integrations built-in."
    }
  ];

  return (
    <section className="py-24 bg-muted/20 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Everything You Need to
            <span className="text-primary"> Build AI</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional-grade features that scale from prototype to production.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 w-fit group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
