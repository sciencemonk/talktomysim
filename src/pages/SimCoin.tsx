import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, ExternalLink, TrendingUp, Users, Wallet, Zap } from "lucide-react";
import { toast } from "sonner";
import simHeroLogo from "@/assets/sim-hero-logo.png";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const SimCoin = () => {
  const navigate = useNavigate();
  const contractAddress = "FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump";

  const copyCA = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      toast.success("Contract address copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy contract address");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate('/')} className="flex items-center hover:opacity-80 transition-opacity">
              <img src={simHeroLogo} alt="SIM" className="h-8" />
            </button>
            
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate('/')} className="text-foreground/80 hover:text-foreground transition-colors text-sm font-medium">
                Home
              </button>
              <button onClick={() => navigate('/agents')} className="text-foreground/80 hover:text-foreground transition-colors text-sm font-medium">
                Agent Directory
              </button>
              <button onClick={() => navigate('/simcoin')} className="text-foreground hover:text-foreground transition-colors text-sm font-medium">
                SIM Coin
              </button>
            </div>
            
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
            $SIMAI Token
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            The official cryptocurrency that fuels the SIM platform
          </p>
          
          {/* Contract Address */}
          <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-2">Contract Address</p>
                  <code className="text-sm font-mono break-all text-foreground">
                    {contractAddress}
                  </code>
                </div>
                <Button onClick={copyCA} variant="outline" size="sm" className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <Card className="border-border bg-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Agent Rewards</h3>
              <p className="text-sm text-muted-foreground">
                All agents earn $SIMAI rewards the more they're used on the platform
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Treasury Funded</h3>
              <p className="text-sm text-muted-foreground">
                The $SIMAI treasury comes from creator rewards and platform revenue
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Usage Based</h3>
              <p className="text-sm text-muted-foreground">
                Earn more tokens as your agents gain popularity and engagement
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Zero Fees</h3>
              <p className="text-sm text-muted-foreground">
                Create and monetize AI agents with no platform fees
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            How $SIMAI Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Create Agents</h3>
              <p className="text-muted-foreground">
                Build AI agents on the SIM platform and share them with the community
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Get Used</h3>
              <p className="text-muted-foreground">
                As users interact with your agents, engagement metrics increase
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Earn Rewards</h3>
              <p className="text-muted-foreground">
                Receive $SIMAI tokens proportional to your agent's usage and popularity
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="border-border bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create your AI agent today and start earning $SIMAI rewards from the platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/')} size="lg" className="gap-2">
                Create Your Agent
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2"
                onClick={() => window.open(`https://solscan.io/token/${contractAddress}`, '_blank')}
              >
                View on Solscan
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img src={simHeroLogo} alt="SIM" className="h-5" />
              <span className="text-xs text-muted-foreground">© 2024 SIM. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Home
              </button>
              <button onClick={() => navigate('/agents')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Agent Directory
              </button>
              <button onClick={() => navigate('/simcoin')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                SIM Coin
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimCoin;
