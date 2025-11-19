import { Database, Wand2, Rocket } from "lucide-react";

export const HowItWorksLanding = () => {
  const steps = [
    {
      icon: Database,
      title: "Convert Your Catalog",
      description: "We transform your entire product catalog into vector embeddings, creating a powerful knowledge base for your AI agent."
    },
    {
      icon: Wand2,
      title: "Customize & Test",
      description: "Personalize your AI agent with custom branding, speech patterns, and interaction flows. Test it thoroughly before launch."
    },
    {
      icon: Rocket,
      title: "Deploy to Your Site",
      description: "Embed your AI agent directly on your website with a simple code snippet. Start selling immediately."
    }
  ];

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-4 font-montserrat">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Launch your AI sales agent in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
