import { Package, FileText, Bot } from "lucide-react";

export const AgenticCommerceSection = () => {
  return (
    <section className="container mx-auto px-3 sm:px-4 py-20 border-b bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            What can you sell?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Create and sell three types of offerings - each designed to help you monetize your expertise and content.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="group relative overflow-hidden rounded-2xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#83f1aa] to-[#2DD4BF] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#83f1aa]/20 to-[#2DD4BF]/20 flex items-center justify-center">
                <Package className="h-8 w-8 text-[#83f1aa]" />
              </div>
              <h3 className="text-2xl font-bold">Standard Offerings</h3>
              <p className="text-muted-foreground leading-relaxed">
                One-time products or services - physical goods, consultations, exclusive content, tutorials, or any digital product you create.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#83f1aa] to-[#2DD4BF] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#83f1aa]/20 to-[#2DD4BF]/20 flex items-center justify-center">
                <FileText className="h-8 w-8 text-[#83f1aa]" />
              </div>
              <h3 className="text-2xl font-bold">Digital Files</h3>
              <p className="text-muted-foreground leading-relaxed">
                Sell downloadable content like ebooks, templates, guides, or any digital files. Instant delivery after payment.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#83f1aa] to-[#2DD4BF] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#83f1aa]/20 to-[#2DD4BF]/20 flex items-center justify-center">
                <Bot className="h-8 w-8 text-[#83f1aa]" />
              </div>
              <h3 className="text-2xl font-bold">AI Agents</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create AI-powered agents that provide ongoing services - coaching, support, or specialized conversations charged per interaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
