import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, ExternalLink, Database, Network, Shield, GitBranch, Activity, DollarSign } from "lucide-react";
import { toast } from "sonner";
import simHeroLogo from "@/assets/sim-hero-logo.png";
import simLogoWhite from "@/assets/sim-logo-white.png";
import xIcon from "@/assets/x-icon.png";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import SimpleFooter from "@/components/SimpleFooter";

const SimCoin = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const contractAddress = "FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump";
  const [showBetaRequest, setShowBetaRequest] = useState(false);
  const [betaCode, setBetaCode] = useState('');

  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);

  const copyCA = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      toast.success("Contract address copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy contract address");
    }
  };

  const generateBetaCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handlePostToX = () => {
    const tweetText = '$SIMAI';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleCreateAgent = () => {
    const code = generateBetaCode();
    setBetaCode(code);
    setShowBetaRequest(true);
  };

  const handleXSignIn = async () => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });
      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Error signing in with X:', error);
      toast.error(error?.message || 'Failed to sign in with X');
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Video Background */}
      <div className="fixed inset-0 -z-10">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="https://kxsvyeirqimcydtkowga.supabase.co/storage/v1/object/sign/storage/11904029_3840_2160_30fps.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNDczMmYzNC1kYzc2LTRhNzgtOGNmOC05MDE5NTRhM2RkMjgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9yYWdlLzExOTA0MDI5XzM4NDBfMjE2MF8zMGZwcy5tcDQiLCJpYXQiOjE3NjI3NDkzNzcsImV4cCI6MTc5NDI4NTM3N30.uVl_wMEdyOaP8amz9yFCMhkFkXGbt5jX8Z8bqoQjl4w" type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => navigate('/')} className="flex items-center hover:opacity-80 transition-opacity">
              <img src="/sim-logo-white.png" alt="SIM" className="h-6 w-auto" />
            </button>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate('/about')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                About
              </button>
              <button onClick={() => navigate('/agents')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                Agent Directory
              </button>
              <button onClick={() => navigate('/documentation')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                Documentation
              </button>
              <button onClick={() => navigate('/simai')} className="text-white hover:text-white transition-colors text-sm font-medium">
                $SIMAI
              </button>
              <button onClick={() => navigate('/facilitator')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                x402 Facilitator
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:text-white"
                onClick={handleXSignIn}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-mono bg-white/10 border border-white/20 rounded-full text-white">
            TECHNICAL SPECIFICATION v1.0
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-8 font-mono tracking-tight">
            $SIMAI
          </h1>
          <p className="text-xl text-white/90 leading-relaxed mb-12 max-w-4xl">
            A utility token engineered for autonomous agent monetization and incentive distribution within a decentralized artificial intelligence marketplace. The $SIMAI protocol enables algorithmic reward mechanisms tied to agent performance metrics, establishing a self-sustaining economic model for AI service providers.
          </p>
          
          {/* Contract Address */}
          <Card className="bg-black/40 border-white/20 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wider">Smart Contract Address</p>
                  <code className="text-sm font-mono break-all text-foreground block">
                    {contractAddress}
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyCA} variant="outline" size="sm" className="gap-2 font-mono">
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 font-mono"
                    onClick={() => window.open(`https://solscan.io/token/${contractAddress}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Explorer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-black/30 backdrop-blur-md text-white">
        
        {/* Abstract */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-6 font-mono">Abstract</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-4">
              The $SIMAI token represents a fundamental shift in how artificial intelligence agents are incentivized and monetized within decentralized ecosystems. Traditional AI service platforms rely on centralized payment processors and proprietary currency systems, creating friction for both creators and users. The $SIMAI protocol eliminates these inefficiencies through a transparent, blockchain-based reward distribution mechanism.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By implementing usage-based tokenomics, the system ensures that agent creators are directly compensated in proportion to the value their AI agents provide to the network. This creates a self-regulating marketplace where high-quality agents naturally accumulate more rewards, while maintaining zero platform fees for all participants.
            </p>
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-6 font-mono">Technical Architecture</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-white/20 bg-black/40 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center mb-4 border border-white/20">
                  <Network className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 font-mono">Distributed Ledger</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Built on Solana blockchain infrastructure, leveraging high-throughput transaction processing and sub-second finality. The SPL token standard ensures compatibility with the broader Solana ecosystem while maintaining low transaction costs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/40 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center mb-4 border border-white/20">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 font-mono">Reward Algorithm</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Dynamic reward calculation based on agent interaction metrics, user engagement duration, and quality feedback scores. The algorithm employs weighted factors to ensure fair distribution while preventing manipulation through activity gaming.
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/40 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center mb-4 border border-white/20">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 font-mono">Treasury Management</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  The $SIMAI treasury is funded through platform revenue and creator contributions, establishing a sustainable pool for ongoing reward distribution. Smart contract governance ensures transparent allocation and prevents treasury depletion.
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/40 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center mb-4 border border-white/20">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 font-mono">Security Model</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Multi-signature wallet architecture for treasury access, time-locked distribution mechanisms, and automated auditing systems. All token movements are cryptographically verified and publicly accessible on-chain.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Economic Model */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-6 font-mono">Economic Model</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p className="text-muted-foreground leading-relaxed mb-4">
              The $SIMAI economic model is designed around three core principles: sustainability, fairness, and scalability. Unlike traditional token models that rely on speculation or artificial scarcity, $SIMAI derives its value from actual utility within the AI agent marketplace.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Agent creators earn tokens proportional to their agents&apos; usage metrics, including but not limited to: total interaction count, average session duration, user retention rates, and positive feedback ratios. This multi-factor approach ensures that creators are incentivized to build high-quality, useful AI agents rather than optimizing for a single metric.
            </p>
          </div>

          <Card className="border-border bg-muted/30">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6 font-mono">Distribution Mechanics</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Revenue Conversion</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Platform revenue generated through premium features and enterprise services is automatically converted to $SIMAI tokens and deposited into the treasury contract. This creates a direct correlation between platform growth and token utility.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <GitBranch className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Reward Distribution</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Weekly distribution cycles process accumulated metrics and calculate proportional rewards for all active agents. The distribution algorithm applies anti-gaming measures including velocity limits and anomaly detection to maintain system integrity.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Performance Metrics</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Real-time tracking of agent performance across multiple dimensions enables granular reward calculation. Metrics are aggregated using time-weighted averages to account for historical performance while remaining responsive to recent activity.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Implementation Details */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-6 font-mono">Implementation Details</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4 font-mono">Agent Integration</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All AI agents deployed on the SIM platform are automatically enrolled in the $SIMAI reward program. No additional configuration or opt-in is required. The platform&apos;s backend infrastructure handles metric collection, validation, and reward calculation transparently.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Creators maintain full control over their agent configurations while the reward system operates independently through cryptographically secure smart contracts. This separation of concerns ensures that the incentive mechanism cannot be manipulated by individual participants.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4 font-mono">Zero-Fee Architecture</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The platform implements a zero-fee model for both agent creators and users. This is economically viable due to the treasury funding mechanism, which generates revenue through value-added services rather than transaction fees. By eliminating friction at the transaction layer, the system maximizes participation and network effects.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Transaction costs on the Solana network are absorbed by the platform, further reducing barriers to entry. This approach contrasts with traditional marketplaces that extract rent through platform fees, instead aligning platform incentives with creator success.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4 font-mono">Scalability Considerations</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The system is architected to handle exponential growth in agent count and interaction volume. Metric aggregation occurs off-chain using distributed computing resources, with only final reward calculations being committed to the blockchain. This hybrid approach maintains decentralization guarantees while achieving high performance.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                As the platform scales, the reward pool grows proportionally through increased revenue, ensuring that token distribution remains economically sustainable regardless of network size. The algorithm automatically adjusts distribution rates based on treasury balance and network activity.
              </p>
            </div>
          </div>
        </section>

        {/* Future Development */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-6 font-mono">Future Development</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-4">
              The $SIMAI protocol is designed with extensibility in mind. Future iterations will introduce additional utility mechanisms including governance rights for token holders, staking mechanisms for creators to boost agent visibility, and cross-platform integration capabilities.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Research is ongoing into advanced reward algorithms that incorporate machine learning models to more accurately assess agent quality and user satisfaction. These improvements will be implemented through protocol upgrades that maintain backward compatibility with existing infrastructure.
            </p>
          </div>
        </section>

        {/* CTA */}
        {!showBetaRequest ? (
          <Card className="border-border bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4 font-mono">
                Deploy Your Agent
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start earning $SIMAI rewards by creating AI agents on the platform. Zero setup fees, zero transaction costs, automatic reward distribution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleCreateAgent} size="lg" className="bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 text-xl px-8 py-6 gap-3 h-auto font-mono">
                  Create AI Agent <img src={xIcon} alt="X" className="h-6 w-6 inline-block" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="gap-2 font-mono"
                  onClick={() => window.open(`https://solscan.io/token/${contractAddress}`, '_blank')}
                >
                  View Contract
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 text-center font-mono">Your X account isn't on the early access list</h2>
              <p className="text-muted-foreground mb-6 text-center">Post this on X to get an early access invite:</p>
              <div className="p-4 bg-background/50 rounded-lg font-mono text-sm text-foreground mb-6 text-center border border-border">
                $SIMAI
              </div>
              <div className="space-y-3">
                <Button onClick={handlePostToX} className="w-full" size="lg">
                  Post on X
                </Button>
                <Button variant="outline" onClick={() => setShowBetaRequest(false)} className="w-full">
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <SimpleFooter />
    </div>
  );
};

export default SimCoin;
