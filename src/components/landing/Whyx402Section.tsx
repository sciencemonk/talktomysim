import { Zap, Shield, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Whyx402Section = () => {
  return (
    <section className="container mx-auto px-3 sm:px-4 py-16 border-b border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-[#635BFF]/50 bg-white">
            <CardContent className="flex flex-col items-center text-center space-y-4 p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#635BFF]/20 to-[#635BFF]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-[#635BFF]" />
              </div>
              <h3 className="font-bold text-xl text-gray-900">Zero Platform Fees</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Keep 100% of your revenue. No 3% Stripe fees, no 2.9% Shopify fees, no hidden charges.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-[#635BFF]/50 bg-white">
            <CardContent className="flex flex-col items-center text-center space-y-4 p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#635BFF]/20 to-[#635BFF]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-[#635BFF]" />
              </div>
              <h3 className="font-bold text-xl text-gray-900">Instant Settlement</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Payments settle instantly on-chain. No waiting 2-7 days for payouts like traditional processors.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-[#635BFF]/50 bg-white">
            <CardContent className="flex flex-col items-center text-center space-y-4 p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#635BFF]/20 to-[#635BFF]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Globe className="h-8 w-8 text-[#635BFF]" />
              </div>
              <h3 className="font-bold text-xl text-gray-900">Global & Permissionless</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Accept payments from anyone, anywhere. No bank accounts, no geographic restrictions, no approval process.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-[#635BFF]/50 bg-white">
          <CardContent className="text-center p-8">
            <p className="text-lg font-medium leading-relaxed text-gray-800">
              USDC stablecoins give you all the benefits of crypto — <span className="text-[#635BFF] font-bold">instant settlement</span>, <span className="text-[#635BFF] font-bold">zero fees</span>, <span className="text-[#635BFF] font-bold">global reach</span> — with the stability of the US dollar.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
