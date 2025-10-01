import { ArrowRight, TrendingUp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TopNavigation from "@/components/TopNavigation";
import SimpleFooter from "@/components/SimpleFooter";
import { useNavigate } from "react-router-dom";

const WhitePaper = () => {
  const navigate = useNavigate();
  const copyCAToClipboard = async () => {
    const ca = "ca coming soon";
    try {
      await navigator.clipboard.writeText(ca);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavigation 
        onShowAdvisorDirectory={() => navigate('/')}
      />
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            White Paper v1.0
          </Badge>
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
              alt="Sim" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Democratizing access to history's greatest minds through AI, powered by the $SIM ecosystem
          </p>
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground mb-2">Contract Address:</p>
            <button
              onClick={copyCAToClipboard}
              className="text-sm font-mono bg-muted px-4 py-2 rounded-lg text-foreground hover:bg-muted/80 transition-colors cursor-pointer border"
              title="Click to copy contract address"
            >
              ca coming soon
            </button>
          </div>
        </div>

        {/* Vision Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">The Vision</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-lg mb-6">
              Throughout history, humanity's greatest breakthrough moments have come from the minds of extraordinary individuals—Einstein's theories of relativity, Tesla's electrical innovations, Leonardo's artistic genius, Socrates' philosophical insights. Yet access to their wisdom has been limited to books, recordings, and second-hand interpretations.
            </p>
            <p className="text-lg mb-6">
              <strong className="text-foreground">Sim Protocol</strong> is building the infrastructure to democratize access to these intellectual giants through advanced AI simulations. Our platform creates interactive, conversational AI representations of history's most influential minds, allowing anyone to engage directly with their thoughts, methodologies, and creative processes.
            </p>
          </div>
        </section>

        {/* The Three Stages */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">The Three-Stage Roadmap</h2>
          
          <div className="grid gap-6 mb-12">
            {/* Stage 1 */}
            <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-primary tracking-wide">STAGE 01</div>
                    <CardTitle className="text-xl">Complex System Prompts</CardTitle>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Currently Live
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Our foundation begins with meticulously crafted system prompts that capture the essence of each historical figure.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Personality traits and communication styles</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Core philosophical frameworks</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Historical context awareness</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Signature thought patterns</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stage 2 */}
            <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-primary tracking-wide">STAGE 02</div>
                    <CardTitle className="text-xl">Vector Embeddings Integration</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Deep knowledge integration through vector embeddings of complete works and historical documents.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Full text analysis of published works</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Real-time retrieval of specific quotes</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Contextual understanding over time</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Cross-referencing capabilities</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stage 3 */}
            <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-primary tracking-wide">STAGE 03</div>
                    <CardTitle className="text-xl">Real-Time Voice Synthesis</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  The ultimate experience—natural voice conversations with historical figures through advanced AI synthesis.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">AI-generated voice synthesis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Real-time conversational flow</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Emotional intelligence responses</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Multi-language support</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tokenomics */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">$SIM Tokenomics & Platform Economics</h2>
          
          <div className="grid md:grid-cols-1 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                  Creator Rewards System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Platform development and maintenance is funded through $SIM creator rewards distributed to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Historical Sim developers</li>
                  <li>Content researchers and validators</li>
                  <li>Community moderators</li>
                  <li>Platform infrastructure contributors</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">Future: Monetizable Custom Sims</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                <strong>Stage 4 Vision:</strong> $SIM holders will be empowered to create their own monetizable Sims, opening new revenue streams:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Creator Economy</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Build Sims of modern thought leaders</li>
                    <li>Create fictional character interactions</li>
                    <li>Develop specialized expert consultants</li>
                    <li>Design educational tutoring personas</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Monetization Models</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Per-conversation pricing</li>
                    <li>Subscription-based access</li>
                    <li>Premium feature unlocks</li>
                    <li>Revenue sharing with platform</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Market Opportunity */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Market Opportunity</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Education Market</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-2">$366B</p>
                <p className="text-sm text-muted-foreground">
                  Global education technology market size, with increasing demand for personalized learning experiences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Market</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-2">$1.8T</p>
                <p className="text-sm text-muted-foreground">
                  Projected AI market value by 2030, with conversational AI representing a major growth segment.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Creator Economy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-2">$104B</p>
                <p className="text-sm text-muted-foreground">
                  Current creator economy size, representing the monetization potential for custom Sim creators.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Join the Revolution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Be part of democratizing access to human wisdom. The $SIM protocol represents the convergence of AI advancement, historical preservation, and decentralized economics.
              </p>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Contract Address:</p>
                <button
                  onClick={copyCAToClipboard}
                  className="text-sm font-mono bg-muted px-4 py-2 rounded-lg text-foreground hover:bg-muted/80 transition-colors cursor-pointer border"
                  title="Click to copy contract address"
                >
                  ca coming soon
                </button>
              </div>
            </CardContent>
          </Card>
        </section>
        </div>
      </div>
      <SimpleFooter />
    </div>
  );
};

export default WhitePaper;