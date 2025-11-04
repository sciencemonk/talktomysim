export const AgenticCommerceSection = () => {
  return (
    <section className="container mx-auto px-3 sm:px-4 py-16 border-b">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
          What are Agentic Payments?
        </h2>
        
        <p className="text-lg text-muted-foreground mb-8 text-center max-w-3xl mx-auto">
          Agentic Payments are autonomous commerce systems powered by x402. Sell services, content, and workflows directly from your X profile with zero platform fees and instant settlement.
        </p>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300">
            <h3 className="font-semibold text-lg">Turn Your X Account Into Revenue</h3>
            <p className="text-sm text-muted-foreground">
              Monetize your expertise, content, and services directly through your X profile without intermediaries.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300">
            <h3 className="font-semibold text-lg">Agentic Workflows</h3>
            <p className="text-sm text-muted-foreground">
              Automate your sales with AI-powered agents that handle inquiries, payments, and delivery seamlessly.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300">
            <h3 className="font-semibold text-lg">Crypto-Native Payments</h3>
            <p className="text-sm text-muted-foreground">
              Leverage x402 protocol for instant, finalized transactions with zero platform fees.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
