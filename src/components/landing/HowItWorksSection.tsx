import { Store, Share2, Wallet } from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      icon: Store,
      title: "Connect your X account",
      description: "Sign in with X to instantly create your crypto-enabled store. Customize your offerings, set prices in USDC, and add your Solana wallet address—all in minutes, no coding required."
    },
    {
      number: "2",
      icon: Share2,
      title: "Share your store",
      description: "Your unique store link can be shared anywhere—X bio, Discord, Telegram, or embedded on your website. One link, unlimited reach across all your channels."
    },
    {
      number: "3",
      icon: Wallet,
      title: "Receive instant payments",
      description: "Get notified instantly when customers pay. USDC transfers directly to your Solana wallet with zero transaction fees—no middlemen, no waiting, just pure profit."
    }
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Accept crypto payments in minutes, without writing code
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.number}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Connector line - hidden on mobile, shown on desktop between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#82f3aa] to-transparent opacity-30" />
                )}
                
                {/* Number badge */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#82f3aa]/20 to-[#82f3aa]/5 border border-[#82f3aa]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-9 h-9 text-[#82f3aa]" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#82f3aa] text-black font-bold flex items-center justify-center text-sm shadow-lg">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl md:text-2xl font-bold mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA hint */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Join creators already earning with <span className="text-[#82f3aa] font-semibold">zero fees</span>
          </p>
        </div>
      </div>
    </section>
  );
};
