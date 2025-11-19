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
          <div className="inline-flex items-center justify-center px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6 animate-fade-in">
            🚀 Simple Yet Powerful
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 font-montserrat">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transform your store into an AI-powered sales machine in three simple steps. 
            No technical expertise required.
          </p>
        </div>

        {/* Main Steps */}
        <div className="space-y-32 mb-32">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                {/* Content Side */}
                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''} space-y-6`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-xl mb-4">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div>
                    <div className="inline-block px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-3">
                      Step {index + 1}
                    </div>
                    <h3 className="text-4xl font-bold text-foreground mb-2 font-montserrat">
                      {step.title}
                    </h3>
                    <p className="text-lg text-primary font-medium mb-4">
                      {step.subtitle}
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                      {step.description}
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {step.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-foreground">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual Side */}
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''} relative`}>
                  <div className={`relative bg-gradient-to-br ${step.gradient} backdrop-blur-sm border border-primary/20 rounded-3xl p-12 aspect-square flex flex-col items-center justify-center transition-all duration-500 hover:scale-105 hover:shadow-2xl`}>
                    {/* Decorative elements */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent rounded-3xl"></div>
                    
                    {/* Visual representation */}
                    <div className="relative z-10 text-center">
                      <div className="flex items-center justify-center gap-4 mb-8">
                        {step.visualElements.map((emoji, idx) => (
                          <div 
                            key={idx} 
                            className="text-6xl animate-fade-in"
                            style={{ animationDelay: `${idx * 0.2}s` }}
                          >
                            {emoji}
                          </div>
                        ))}
                      </div>
                      
                      {/* Flow visualization */}
                      <div className="space-y-4">
                        <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full animate-slide-up" style={{ width: '100%' }}></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[...Array(3)].map((_, idx) => (
                            <div 
                              key={idx} 
                              className="h-16 bg-white/50 rounded-lg backdrop-blur-sm border border-primary/20"
                              style={{ animationDelay: `${idx * 0.1}s` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Corner accent */}
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-2xl opacity-20 blur-2xl"></div>
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex justify-center my-20">
                  <div className="w-px h-24 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent"></div>
                </div>
              )}
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
                className="group p-6 bg-white rounded-2xl border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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

        {/* Stats/Trust Section */}
        <div className="mt-32 grid sm:grid-cols-3 gap-8 text-center">
          <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl border border-primary/20">
            <div className="text-5xl font-bold text-primary mb-2 font-montserrat">98%</div>
            <div className="text-muted-foreground font-medium">Customer Satisfaction</div>
          </div>
          <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl border border-primary/20">
            <div className="text-5xl font-bold text-primary mb-2 font-montserrat">3.5x</div>
            <div className="text-muted-foreground font-medium">Average Conversion Increase</div>
          </div>
          <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl border border-primary/20">
            <div className="text-5xl font-bold text-primary mb-2 font-montserrat">&lt;5min</div>
            <div className="text-muted-foreground font-medium">Setup Time</div>
          </div>
        </div>
      </div>
    </section>
  );
};
