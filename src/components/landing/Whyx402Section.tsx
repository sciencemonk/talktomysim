import { Zap, Shield, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Whyx402Section = () => {
  return (
    <section className="container mx-auto px-3 sm:px-4 py-16 border-b">
      <div className="max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-[#83f1aa]/50 bg-gradient-to-br from-card to-card/50">
            <CardContent className="flex flex-col items-center text-center space-y-4 p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#83f1aa]/20 to-[#83f1aa]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-[#83f1aa]" />
              </div>
              <h3 className="font-bold text-xl">Zero Platform Fees</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Keep 100% of your revenue. No 3% Stripe fees, no 2.9% Shopify fees, no hidden charges.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-[#83f1aa]/50 bg-gradient-to-br from-card to-card/50">
            <CardContent className="flex flex-col items-center text-center space-y-4 p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#83f1aa]/20 to-[#83f1aa]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-[#83f1aa]" />
              </div>
              <h3 className="font-bold text-xl">Instant Settlement</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Payments settle instantly on-chain. No waiting 2-7 days for payouts like traditional processors.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-[#83f1aa]/50 bg-gradient-to-br from-card to-card/50">
            <CardContent className="flex flex-col items-center text-center space-y-4 p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#83f1aa]/20 to-[#83f1aa]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Globe className="h-8 w-8 text-[#83f1aa]" />
              </div>
              <h3 className="font-bold text-xl">Global & Permissionless</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Accept payments from anyone, anywhere. No bank accounts, no geographic restrictions, no approval process.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-[#83f1aa]/50 bg-gradient-to-br from-[#83f1aa]/5 to-card">
          <CardContent className="text-center p-8">
            <p className="text-lg font-medium leading-relaxed">
              USDC stablecoins give you all the benefits of crypto — <span className="text-[#83f1aa] font-bold">instant settlement</span>, <span className="text-[#83f1aa] font-bold">zero fees</span>, <span className="text-[#83f1aa] font-bold">global reach</span> — with the stability of the US dollar.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
