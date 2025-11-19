import { Check, Sparkles } from "lucide-react";

export const PricingLanding = () => {
  return (
    <section className="relative bg-gradient-to-b from-white to-primary/5 py-24 overflow-hidden">
      {/* Decorative grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
            💰 Transparent Pricing
          </div>
          <h2 className="text-5xl font-bold text-foreground mb-6 font-montserrat">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Launch your AI agent and start selling
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary/50 to-primary rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition duration-300"></div>
            
            {/* Card */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-10 border-2 border-primary/20">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2 shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  Most Popular
                </div>
              </div>

              <div className="text-center mb-10 mt-4">
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">$495</span>
                </div>
                <div className="text-muted-foreground font-medium">One-time setup fee</div>
              </div>

              <ul className="space-y-5 mb-10">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">Complete catalog conversion to vector embeddings</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">Custom AI agent training and personalization</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">Full integration and deployment support</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">Pay-as-you-go chat credits after launch</span>
                </li>
              </ul>

              <div className="pt-8 border-t border-primary/10">
                <p className="text-center text-sm text-muted-foreground leading-relaxed">
                  Chat credits are charged based on usage after your agent launches. Scale as you grow with transparent, usage-based pricing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
