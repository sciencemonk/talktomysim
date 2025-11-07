import { Button } from "@/components/ui/button";
import { Shield, Zap, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SocialInternetMarketplace = () => {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate("/?scrollToAgents=true");
  };

  return (
    <section className="container mx-auto px-3 sm:px-4 py-20 border-b bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Social Internet Marketplace
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            We're building a new kind of online store. A future where your identity is verified by your X account 
            and payments are made in USDC—instantly, with zero fees. A future where the robber barons like Stripe 
            and Visa no longer take your money. This is permissionless commerce.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="group relative overflow-hidden rounded-2xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#83f1aa] to-[#2DD4BF] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#83f1aa]/20 to-[#2DD4BF]/20 flex items-center justify-center">
                <Shield className="h-8 w-8 text-[#83f1aa]" />
              </div>
              <h3 className="text-2xl font-bold">X-Verified Identity</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your X account is your storefront. Build trust through your social reputation and verified identity.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#83f1aa] to-[#2DD4BF] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#83f1aa]/20 to-[#2DD4BF]/20 flex items-center justify-center">
                <Zap className="h-8 w-8 text-[#83f1aa]" />
              </div>
              <h3 className="text-2xl font-bold">Instant USDC Payments</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get paid instantly in USDC stablecoin. No chargebacks, no holds, no intermediaries taking a cut.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-card border-2 border-border hover:border-[#83f1aa] transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#83f1aa] to-[#2DD4BF] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#83f1aa]/20 to-[#2DD4BF]/20 flex items-center justify-center">
                <Globe className="h-8 w-8 text-[#83f1aa]" />
              </div>
              <h3 className="text-2xl font-bold">Permissionless Commerce</h3>
              <p className="text-muted-foreground leading-relaxed">
                No gatekeepers. No approval process. Start selling to anyone, anywhere, immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={handleExploreClick}
            size="lg" 
            className="gap-2 font-bold px-8 py-5 text-base transition-all duration-300 bg-[#82f3aa] hover:bg-[#6dd991] text-black border-0 shadow-xl shadow-[#82f3aa]/30 hover:shadow-2xl hover:shadow-[#82f3aa]/40 hover:scale-105"
          >
            Explore the Marketplace
          </Button>
        </div>
      </div>
    </section>
  );
};
