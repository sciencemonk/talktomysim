import { Database, Wand2, Rocket } from "lucide-react";

export const HowItWorksLanding = () => {
  const steps = [
    {
      icon: Database,
      title: "Convert Your Catalog",
      description: "We transform your entire product catalog into vector embeddings, creating a powerful knowledge base for your AI agent.",
      gradient: "from-primary/20 to-primary/10"
    },
    {
      icon: Wand2,
      title: "Customize & Test",
      description: "Personalize your AI agent with custom branding, speech patterns, and interaction flows. Test it thoroughly before launch.",
      gradient: "from-primary/15 to-primary/5"
    },
    {
      icon: Rocket,
      title: "Deploy to Your Site",
      description: "Embed your AI agent directly on your website with a simple code snippet. Start selling immediately.",
      gradient: "from-primary/10 to-transparent"
    }
  ];

  return (
    <section className="relative bg-gradient-to-b from-white via-primary/5 to-white py-24 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
            🚀 Simple Process
          </div>
          <h2 className="text-5xl font-bold text-foreground mb-6 font-montserrat">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Launch your AI sales agent in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className={`flex flex-col items-center text-center p-8 rounded-2xl bg-gradient-to-br ${step.gradient} backdrop-blur-sm border border-primary/10 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-primary/30`}>
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5">
                  <div className="h-full bg-gradient-to-r from-primary/30 to-primary/10"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
