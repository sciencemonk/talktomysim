import { Check, X, Zap, TrendingDown, Shield, Users, Package } from "lucide-react";

export const SimVsStripeSection = () => {
  const comparisons = [
    {
      feature: "Transaction Fees",
      sim: "0%",
      stripe: "2.9% + $0.30",
      shopify: "2.9% + $0.30 + monthly fee",
      simIcon: <Check className="h-5 w-5 text-[#82f3aa]" />,
      stripeIcon: <X className="h-5 w-5 text-destructive" />,
      shopifyIcon: <X className="h-5 w-5 text-destructive" />,
      highlight: true
    },
    {
      feature: "Settlement Time",
      sim: "Instant",
      stripe: "2-7 business days",
      shopify: "2-7 business days",
      simIcon: <Zap className="h-5 w-5 text-[#82f3aa]" />,
      stripeIcon: <TrendingDown className="h-5 w-5 text-muted-foreground" />,
      shopifyIcon: <TrendingDown className="h-5 w-5 text-muted-foreground" />
    },
    {
      feature: "Chargebacks",
      sim: "None (crypto finality)",
      stripe: "Risk of chargebacks",
      shopify: "Risk of chargebacks",
      simIcon: <Shield className="h-5 w-5 text-[#82f3aa]" />,
      stripeIcon: <X className="h-5 w-5 text-destructive" />,
      shopifyIcon: <X className="h-5 w-5 text-destructive" />
    },
    {
      feature: "Global Access",
      sim: "Anyone with crypto",
      stripe: "Limited countries",
      shopify: "Limited countries",
      simIcon: <Users className="h-5 w-5 text-[#82f3aa]" />,
      stripeIcon: <TrendingDown className="h-5 w-5 text-muted-foreground" />,
      shopifyIcon: <TrendingDown className="h-5 w-5 text-muted-foreground" />
    },
    {
      feature: "Setup Required",
      sim: "Verify X account",
      stripe: "Bank account, KYC, docs",
      shopify: "Store setup, inventory, KYC",
      simIcon: <Check className="h-5 w-5 text-[#82f3aa]" />,
      stripeIcon: <X className="h-5 w-5 text-destructive" />,
      shopifyIcon: <X className="h-5 w-5 text-destructive" />
    },
    {
      feature: "Best For",
      sim: "Digital products & services",
      stripe: "Standard payments",
      shopify: "Physical products only",
      simIcon: <Zap className="h-5 w-5 text-[#82f3aa]" />,
      stripeIcon: <Check className="h-5 w-5 text-muted-foreground" />,
      shopifyIcon: <Package className="h-5 w-5 text-muted-foreground" />
    }
  ];
  return <section className="relative container mx-auto px-3 sm:px-4 py-16 border-b overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#82f3aa]/5 to-transparent" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#82f3aa]/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#82f3aa]/10 border border-[#82f3aa]/30 mb-4">
            <Zap className="h-4 w-4 text-[#82f3aa]" />
            <span className="text-sm font-semibold text-[#82f3aa]">Crypto-native payments</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            SIM vs Stripe vs Shopify
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Keep 100% of your revenue with crypto-native payments powered by x402
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-card/50 backdrop-blur-sm border-2 border-border rounded-2xl overflow-hidden shadow-2xl">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 p-6 border-b-2 border-border bg-muted/30">
            <div className="text-sm font-semibold text-muted-foreground">Feature</div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#82f3aa]/20 border border-[#82f3aa]/40">
                <span className="text-base font-bold text-foreground">SIM</span>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                <span className="text-base font-bold text-muted-foreground">Stripe</span>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                <span className="text-base font-bold text-muted-foreground">Shopify</span>
              </div>
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="divide-y divide-border">
            {comparisons.map((comparison, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-4 gap-4 p-6 transition-all duration-300 hover:bg-muted/20 ${
                  comparison.highlight ? 'bg-[#82f3aa]/5' : ''
                }`}
              >
                {/* Feature Name */}
                <div className="flex items-center">
                  <span className="font-semibold text-foreground">
                    {comparison.feature}
                  </span>
                </div>

                {/* SIM Column */}
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  {comparison.simIcon}
                  <span className="text-sm font-semibold text-foreground">
                    {comparison.sim}
                  </span>
                </div>

                {/* Stripe Column */}
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  {comparison.stripeIcon}
                  <span className="text-sm text-muted-foreground">
                    {comparison.stripe}
                  </span>
                </div>

                {/* Shopify Column */}
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  {comparison.shopifyIcon}
                  <span className="text-sm text-muted-foreground">
                    {comparison.shopify}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="p-6 bg-gradient-to-r from-[#82f3aa]/10 via-[#82f3aa]/5 to-transparent border-t-2 border-[#82f3aa]/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-bold text-foreground mb-1">
                  Save thousands on fees every month
                </p>
                <p className="text-sm text-muted-foreground">
                  On $10,000 in sales, save $290+ compared to traditional platforms
                </p>
              </div>
              <div className="text-3xl font-bold text-[#82f3aa]">
                0%
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid sm:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-6 rounded-xl bg-card/30 border border-border">
            <div className="text-3xl font-bold text-[#82f3aa] mb-2">$0</div>
            <p className="text-sm text-muted-foreground">In hidden fees</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-card/30 border border-border">
            <div className="text-3xl font-bold text-[#82f3aa] mb-2">&lt;1 min</div>
            <p className="text-sm text-muted-foreground">Setup time</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-card/30 border border-border">
            <div className="text-3xl font-bold text-[#82f3aa] mb-2">100%</div>
            <p className="text-sm text-muted-foreground">Of your revenue</p>
          </div>
        </div>
      </div>
    </section>;
};