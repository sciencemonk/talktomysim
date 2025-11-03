import { Zap, Shield, Sparkles } from "lucide-react";

export const AgenticCommerceSection = () => {
  return (
    <section className="container mx-auto px-3 sm:px-4 py-16 border-b">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
          What is Agentic Commerce?
        </h2>
        
        <p className="text-lg text-muted-foreground mb-8 text-center max-w-3xl mx-auto">
          Accepting payments online has traditionally meant forcing users into accounts, managing API keys, and handling manual billing cycles. x402 removes these barriers by offering:
        </p>

        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[#83f1aa]/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-[#83f1aa]" />
            </div>
            <h3 className="font-semibold text-lg">Seamless Per-Request Payments</h3>
            <p className="text-sm text-muted-foreground">
              No subscriptions, no prepayments, no lock-in.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[#83f1aa]/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#83f1aa]" />
            </div>
            <h3 className="font-semibold text-lg">Instant, Finalized Transactions</h3>
            <p className="text-sm text-muted-foreground">
              No chargebacks, no fraud risks, no intermediaries.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[#83f1aa]/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-[#83f1aa]" />
            </div>
            <h3 className="font-semibold text-lg">AI-Native Monetization</h3>
            <p className="text-sm text-muted-foreground">
              Let AI agents and human users pay dynamically without pre-approvals or API keys.
            </p>
          </div>
        </div>

        <div className="text-center p-8 rounded-xl bg-card border-2 border-[#83f1aa]">
          <p className="text-lg font-medium">
            For developers and businesses, this means <span className="text-[#83f1aa] font-bold">higher revenue</span>, <span className="text-[#83f1aa] font-bold">lower costs</span>, and a <span className="text-[#83f1aa] font-bold">seamless payment experience</span>.
          </p>
        </div>
      </div>
    </section>
  );
};
