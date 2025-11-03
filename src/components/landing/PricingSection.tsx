import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingSectionProps {
  onSignUp: () => void;
}

export const PricingSection = ({ onSignUp }: PricingSectionProps) => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with agentic commerce",
      features: [
        "Verified agentic storefront",
        "Up to 1 product listing",
        "Zero transaction fees",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Creator",
      price: "$20",
      period: "per month",
      description: "For creators ready to scale their offerings",
      features: [
        "Verified agentic storefront",
        "Up to 5 product listings",
        "Zero transaction fees",
        "Priority support",
      ],
      cta: "Start Creating",
      highlighted: true,
    },
    {
      name: "Laser Eyes",
      price: "$100",
      period: "per month",
      description: "For power users and businesses",
      features: [
        "Verified agentic storefront",
        "Unlimited product listings",
        "Zero transaction fees",
        "Priority support",
        "Agentic Workflows (APIs) listings",
      ],
      cta: "Go Unlimited",
      highlighted: false,
    },
  ];

  return (
    <section className="container mx-auto px-3 sm:px-4 py-16 border-b">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include zero transaction fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-[#82f3aa]/10 border-2 border-[#82f3aa] shadow-xl shadow-[#82f3aa]/20"
                  : "bg-card border-2 border-border"
              } transition-all duration-300 hover:scale-105`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#82f3aa] text-black text-sm font-bold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#82f3aa] flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={onSignUp}
                className={`w-full ${
                  plan.highlighted
                    ? "bg-[#82f3aa] hover:bg-[#6dd991] text-black font-bold"
                    : "bg-foreground/10 hover:bg-foreground/20 text-foreground"
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include 0% transaction fees compared to Stripe's 2.9%
        </p>
      </div>
    </section>
  );
};
