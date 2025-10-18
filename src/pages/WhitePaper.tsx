import { ArrowRight, TrendingUp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TopNavigation from "@/components/TopNavigation";
import SimpleFooter from "@/components/SimpleFooter";
import { useNavigate } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";

const WhitePaper = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const copyCAToClipboard = async () => {
    const ca = "FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump";
    try {
      await navigator.clipboard.writeText(ca);
      toast({
        title: "Copied!",
        description: "Contract address copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavigation />
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            White Paper v2.0
          </Badge>
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
              alt="Sim" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create your own Web3-native AI with personalized landing pages, integrations, and full customization.
          </p>
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground mb-2">Contract Address:</p>
            <button
              onClick={copyCAToClipboard}
              className="text-sm font-mono bg-muted px-4 py-2 rounded-lg text-foreground hover:bg-muted/80 transition-colors cursor-pointer border"
              title="Click to copy contract address"
            >
              FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump
            </button>
          </div>
        </div>

        {/* Vision Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">The Vision</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-lg mb-6">
              <strong className="text-foreground">Sim Protocol</strong> empowers anyone to create and share their own Web3-native AI. Our platform provides the infrastructure to build interactive, conversational AI simulations with full customization—from personalized tutors and domain experts to creative companions and fictional characters. Connect your crypto wallet, customize everything, and build an AI that truly understands you.
            </p>
            <p className="text-lg mb-6">
              Whether you want to create a virtual mentor based on your favorite author, build a custom AI assistant with a unique personality, design an expert consultant in your field, or even recreate conversations with historical figures—Sim Protocol makes it possible. Each sim gets its own custom landing page with unique branding, social media integration, and personalized experiences.
            </p>
            <p className="text-lg mb-6">
              This is more than just AI chatbots—it&apos;s a Web3-native creator platform where <strong className="text-foreground">your ideas</strong> become interactive experiences. Build once, share globally with custom URLs, and let others engage with the AI you create. Every sim is fully owned by its creator, with powerful integrations connecting to Google Calendar, crypto wallets, and more.
            </p>
          </div>

          {/* Live Debates Subsection */}
          <Card className="mt-8 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl">Live Debates: Historical Minds in Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">
                  One of the most exciting applications of Sim Protocol is our <strong className="text-foreground">Live Chat</strong> feature, where historical sims engage in real-time philosophical debates. Watch as recreated minds from different eras discuss timeless questions—from the nature of consciousness to the meaning of life.
                </p>
                <p className="text-lg">
                  Every 5 minutes, a new debate begins with a randomly selected philosophical question and two historical figures. These aren&apos;t scripted performances—they&apos;re authentic AI-powered conversations where each sim draws from their unique knowledge, beliefs, and communication style to engage in meaningful discourse.
                </p>
                <p className="text-lg">
                  This feature demonstrates the power of Sim Protocol: <strong className="text-foreground">preserving and animating human wisdom</strong> in ways that educate, inspire, and provoke thought. It&apos;s history brought to life, philosophy made accessible, and ideas given new context through cross-temporal dialogue.
                </p>
                <div className="flex items-center gap-2 mt-6">
                  <Button 
                    onClick={() => navigate('/')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Watch Live Debates Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Platform Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Platform Features</h2>
          
          <div className="grid gap-6 mb-12">
            {/* Personalized Sims */}
            <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-primary tracking-wide">CORE FEATURE</div>
                    <CardTitle className="text-xl">Personalized Sim Creation</CardTitle>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Currently Live
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Create your own AI sim with complete customization. Connect your crypto wallet, design your AI&apos;s personality, and share it with the world through a personalized landing page.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Custom system prompts & personalities</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Avatar and branding customization</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Unique custom URLs for each sim</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Personalized landing pages</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Background images & visual themes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Social media & website links</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Web3 Integration */}
            <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-primary tracking-wide">WEB3 NATIVE</div>
                    <CardTitle className="text-xl">Crypto Wallet Authentication</CardTitle>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Currently Live
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Sign in with Phantom or Solflare wallets. Your sim is tied to your Web3 identity, ensuring true ownership and portability.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Phantom wallet integration</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Solflare wallet support</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Secure message signing</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Display crypto wallet addresses</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integrations */}
            <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-primary tracking-wide">INTEGRATIONS</div>
                    <CardTitle className="text-xl">External Service Connections</CardTitle>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Currently Live
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Connect your sim to external services for enhanced functionality. Currently supports Google Calendar with more integrations coming soon.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Google Calendar OAuth integration</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Real-time wallet analytics (coming soon)</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Event scheduling and management</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Expandable integration framework</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vector Embeddings */}
            <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground tracking-wide">COMING SOON</div>
                    <CardTitle className="text-xl">Vector Embeddings & Knowledge Base</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Deep knowledge integration through vector embeddings—creators will be able to upload documents, articles, books, or any content to enhance their sim&apos;s knowledge base.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                      <span className="text-sm text-muted-foreground">Full text analysis of uploaded content</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                      <span className="text-sm text-muted-foreground">Real-time retrieval of specific information</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                      <span className="text-sm text-muted-foreground">Contextual understanding and memory</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                      <span className="text-sm text-muted-foreground">Custom knowledge base capabilities</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voice Synthesis */}
            <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground tracking-wide">COMING SOON</div>
                    <CardTitle className="text-xl">Real-Time Voice Synthesis</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  The ultimate experience—natural voice conversations with any sim through advanced AI synthesis and real-time audio streaming.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                      <span className="text-sm text-muted-foreground">AI-generated voice synthesis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                      <span className="text-sm text-muted-foreground">Real-time conversational flow</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                      <span className="text-sm text-muted-foreground">Emotional intelligence responses</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
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
                  <li>Sim creators and developers</li>
                  <li>Content researchers and validators</li>
                  <li>Community moderators</li>
                  <li>Platform infrastructure contributors</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">Personalized Sim Landing Pages: Available Now</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                <strong>Currently Live:</strong> Every sim gets its own custom landing page with unique branding, social media links, and personalized experiences. Share your sim&apos;s custom URL with the world.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Landing Page Features</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Custom URLs for each sim</li>
                    <li>Personalized background images</li>
                    <li>Social media integration (Twitter, website)</li>
                    <li>Crypto wallet address display</li>
                    <li>Fully branded experience</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Creator Economy</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Build sims of modern thought leaders</li>
                    <li>Create fictional character interactions</li>
                    <li>Develop specialized expert consultants</li>
                    <li>Design educational tutoring personas</li>
                    <li>Future: Per-conversation & subscription monetization</li>
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
                  FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump
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