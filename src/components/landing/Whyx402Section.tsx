import { Zap, Shield, Globe } from "lucide-react";

export const Whyx402Section = () => {
  return (
    <section className="container mx-auto px-3 sm:px-4 py-16 border-b">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
          Why Crypto?
        </h2>
        
        <p className="text-lg text-muted-foreground mb-8 text-center max-w-3xl mx-auto">
          We use USDC stablecoins powered by x402 protocol to enable instant, global payments with zero platform fees. Unlike traditional payment processors like Stripe or Shopify that take 3-5% of every transaction, crypto payments let you keep 100% of your revenue.
        </p>

        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[#83f1aa]/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-[#83f1aa]" />
            </div>
            <h3 className="font-semibold text-lg">Zero Platform Fees</h3>
            <p className="text-sm text-muted-foreground">
              Keep 100% of your revenue. No 3% Stripe fees, no 2.9% Shopify fees, no hidden charges.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[#83f1aa]/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#83f1aa]" />
            </div>
            <h3 className="font-semibold text-lg">Instant Settlement</h3>
            <p className="text-sm text-muted-foreground">
              Payments settle instantly on-chain. No waiting 2-7 days for payouts like traditional processors.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[#83f1aa]/20 flex items-center justify-center">
              <Globe className="h-6 w-6 text-[#83f1aa]" />
            </div>
            <h3 className="font-semibold text-lg">Global & Permissionless</h3>
            <p className="text-sm text-muted-foreground">
              Accept payments from anyone, anywhere. No bank accounts, no geographic restrictions, no approval process.
            </p>
          </div>
        </div>

        <div className="text-center p-8 rounded-xl bg-card border-2 border-[#83f1aa]">
          <p className="text-lg font-medium">
            USDC stablecoins give you all the benefits of crypto — <span className="text-[#83f1aa] font-bold">instant settlement</span>, <span className="text-[#83f1aa] font-bold">zero fees</span>, <span className="text-[#83f1aa] font-bold">global reach</span> — with the stability of the US dollar.
          </p>
        </div>
      </div>
    </section>
  );
};
