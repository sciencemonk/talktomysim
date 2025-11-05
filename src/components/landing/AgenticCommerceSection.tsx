export const AgenticCommerceSection = () => {
  return (
    <section className="container mx-auto px-3 sm:px-4 py-16 border-b">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
          What can you sell?
        </h2>
        
        <p className="text-lg text-muted-foreground mb-8 text-center max-w-3xl mx-auto">
          Create and sell three types of offerings on $SIMAI - each designed to help you monetize your expertise and content.
        </p>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300">
            <h3 className="font-semibold text-lg">Standard Offerings</h3>
            <p className="text-sm text-muted-foreground">
              One-time products or services - consultations, exclusive content, tutorials, or any digital product you create.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300">
            <h3 className="font-semibold text-lg">Digital Files</h3>
            <p className="text-sm text-muted-foreground">
              Sell downloadable content like ebooks, templates, guides, or any digital files. Instant delivery after payment.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300">
            <h3 className="font-semibold text-lg">AI Agents</h3>
            <p className="text-sm text-muted-foreground">
              Create AI-powered agents that provide ongoing services - coaching, support, or specialized conversations charged per interaction.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
