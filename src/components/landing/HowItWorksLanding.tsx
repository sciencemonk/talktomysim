import { Database, Wand2, Rocket, MessageSquare, ShoppingCart, BarChart3, Zap, Shield, Clock, Brain, Target, TrendingUp } from "lucide-react";

export const HowItWorksLanding = () => {
  const steps = [
    {
      icon: Database,
      title: "Catalog Intelligence",
      subtitle: "Smart Product Understanding",
      description: "We transform your entire product catalog into advanced vector embeddings, creating a sophisticated knowledge base that understands context, relationships, and customer intent.",
      features: [
        "Automatic product attribute extraction",
        "Semantic search capabilities",
        "Real-time inventory sync"
      ],
      gradient: "from-primary/20 to-primary/10",
      visualElements: ["📦", "🔄", "🧠"]
    },
    {
      icon: Wand2,
      title: "AI Personalization",
      subtitle: "Your Brand, Amplified",
      description: "Customize your AI agent's personality, tone, and expertise to perfectly match your brand voice. Train it on your unique selling points and customer service approach.",
      features: [
        "Custom brand voice training",
        "Multi-language support",
        "A/B testing capabilities"
      ],
      gradient: "from-primary/15 to-primary/5",
      visualElements: ["🎨", "💬", "✨"]
    },
    {
      icon: Rocket,
      title: "Seamless Deployment",
      subtitle: "Launch in Minutes",
      description: "One-click integration with your existing e-commerce platform. Our lightweight embed works anywhere and scales automatically with your traffic.",
      features: [
        "Universal platform compatibility",
        "Zero infrastructure setup",
        "Auto-scaling architecture"
      ],
      gradient: "from-primary/10 to-transparent",
      visualElements: ["⚡", "🚀", "📈"]
    }
  ];

  const capabilities = [
    {
      icon: MessageSquare,
      title: "Natural Conversations",
      description: "Engages customers in human-like dialogue"
    },
    {
      icon: ShoppingCart,
      title: "Smart Recommendations",
      description: "Suggests perfect products based on needs"
    },
    {
      icon: Brain,
      title: "Context Awareness",
      description: "Remembers preferences throughout journey"
    },
    {
      icon: Target,
      title: "Intent Recognition",
      description: "Understands what customers really want"
    },
    {
      icon: Zap,
      title: "Instant Responses",
      description: "Answers questions in milliseconds"
    },
    {
      icon: TrendingUp,
      title: "Continuous Learning",
      description: "Gets smarter with every interaction"
    }
  ];

  return (
    <section className="relative bg-gradient-to-b from-white via-primary/5 to-white py-32 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
      <div className="absolute top-40 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-24">
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 font-montserrat">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transform your store into an AI-powered sales machine in three simple steps. 
            No technical expertise required.
          </p>
        </div>

        {/* Main Steps - Grid Layout */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className={`h-full min-h-[600px] bg-gradient-to-br ${step.gradient} backdrop-blur-sm border border-primary/20 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105 flex flex-col`}>
                {/* Step Number Badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">{index + 1}</span>
                </div>

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-xl mb-4">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                
                <div className="space-y-3 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-foreground font-montserrat leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-base text-primary font-medium">
                    {step.subtitle}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {step.description}
                  </p>

                  <ul className="space-y-2.5 pt-3">
                    {step.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-foreground text-sm">
                        <div className="flex-shrink-0 w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        </div>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Agent Capabilities Grid */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
              🤖 AI Capabilities
            </div>
            <h3 className="text-4xl font-bold text-foreground mb-4 font-montserrat">
              What Your AI Agent Can Do
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powered by advanced language models and trained specifically for e-commerce
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability, index) => (
              <div 
                key={index} 
                className="p-6 bg-white rounded-2xl border border-primary/10 transition-all duration-300 hover:border-primary/30 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                    <capability.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2 text-lg">
                      {capability.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {capability.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
