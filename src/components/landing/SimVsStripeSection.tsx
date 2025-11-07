import { Check, X, Zap, TrendingDown, Shield, Users, Package } from "lucide-react";

export const SimVsStripeSection = () => {
  const comparisons = [
    {
      feature: "Transaction Fees",
      sim: "0%",
      stripe: "2.9% + $0.30",
      simIcon: <Check className="h-5 w-5 text-[#635BFF]" />,
      stripeIcon: <X className="h-5 w-5 text-destructive" />,
      highlight: true
    },
    {
      feature: "Settlement Time",
      sim: "Instant",
      stripe: "2-7 business days",
      simIcon: <Zap className="h-5 w-5 text-[#635BFF]" />,
      stripeIcon: <TrendingDown className="h-5 w-5 text-muted-foreground" />
    },
    {
      feature: "Chargebacks",
      sim: "None (crypto finality)",
      stripe: "Risk of chargebacks",
      simIcon: <Shield className="h-5 w-5 text-[#635BFF]" />,
      stripeIcon: <X className="h-5 w-5 text-destructive" />
    },
    {
      feature: "Global Access",
      sim: "Anyone with crypto",
      stripe: "Limited countries",
      simIcon: <Users className="h-5 w-5 text-[#635BFF]" />,
      stripeIcon: <TrendingDown className="h-5 w-5 text-muted-foreground" />
    },
    {
      feature: "Setup Required",
      sim: "Verify X account",
      stripe: "Bank account, KYC, docs",
      simIcon: <Check className="h-5 w-5 text-[#635BFF]" />,
      stripeIcon: <X className="h-5 w-5 text-destructive" />
    },
    {
      feature: "Best For",
      sim: "Products, services, digital goods, AI agents",
      stripe: "Standard payments",
      simIcon: <Zap className="h-5 w-5 text-[#635BFF]" />,
      stripeIcon: <Check className="h-5 w-5 text-muted-foreground" />
    }
  ];
  return <section className="relative w-full py-16 border-b border-gray-200 overflow-hidden bg-white">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#635BFF]/5 to-transparent" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#635BFF]/10 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-3 sm:px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#635BFF]/10 border border-[#635BFF]/30 mb-4">
            <Zap className="h-4 w-4 text-[#635BFF]" />
            <span className="text-sm font-semibold text-[#635BFF]">Crypto-native payments</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Permissionless Commerce
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Keep 100% of your revenue with crypto-native payments
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white backdrop-blur-sm border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 p-6 border-b-2 border-gray-200 bg-gray-50">
            <div className="text-sm font-semibold text-gray-600">Feature</div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#635BFF]/20 border border-[#635BFF]/40">
                <span className="text-base font-bold text-gray-900">SIM</span>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100">
                <span className="text-base font-bold text-gray-600">Stripe</span>
              </div>
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="divide-y divide-gray-200">
            {comparisons.map((comparison, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-3 gap-4 p-6 transition-all duration-300 hover:bg-gray-50 ${
                  comparison.highlight ? 'bg-[#635BFF]/5' : ''
                }`}
              >
                {/* Feature Name */}
                <div className="flex items-center">
                  <span className="font-semibold text-gray-900">
                    {comparison.feature}
                  </span>
                </div>

                {/* SIM Column */}
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  {comparison.simIcon}
                  <span className="text-sm font-semibold text-gray-900">
                    {comparison.sim}
                  </span>
                </div>

                {/* Stripe Column */}
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  {comparison.stripeIcon}
                  <span className="text-sm text-gray-600">
                    {comparison.stripe}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="p-6 bg-gradient-to-r from-[#635BFF]/10 via-[#635BFF]/5 to-transparent border-t-2 border-[#635BFF]/20">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <p className="font-bold text-gray-900">
                Save thousands on fees every month
              </p>
              <p className="text-sm text-gray-700">
                On $10,000 in sales, save $290+ compared to traditional platforms
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid sm:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-6 rounded-xl bg-white border border-gray-200">
            <div className="text-3xl font-bold text-[#635BFF] mb-2">$0</div>
            <p className="text-sm text-gray-600">In hidden fees</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-white border border-gray-200">
            <div className="text-3xl font-bold text-[#635BFF] mb-2">&lt;1 min</div>
            <p className="text-sm text-gray-600">Setup time</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-white border border-gray-200">
            <div className="text-3xl font-bold text-[#635BFF] mb-2">100%</div>
            <p className="text-sm text-gray-600">Of your revenue</p>
          </div>
        </div>
      </div>
    </section>;
};