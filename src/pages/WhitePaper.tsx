import { ArrowRight, TrendingUp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SimpleFooter from "@/components/SimpleFooter";
import { useNavigate } from "react-router-dom";
import { TopNavBar } from "@/components/TopNavBar";

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
    <div className="min-h-screen bg-background flex flex-col w-full">
      <TopNavBar />
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Create. Deploy. Monetize.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The platform that lets you create, deploy, and monetize your own AI agents. Build once, earn forever.
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
              <strong className="text-foreground">Why let Big Tech own the future of AI when you can own it yourself?</strong> Sim Protocol is the platform that empowers anyone to create, deploy, and monetize their own AI agents. No coding required. No technical expertise needed. Just your creativity and vision.
            </p>
            <p className="text-lg mb-6">
              <strong className="text-foreground">CREATE:</strong> Build your AI agent with complete customization. Design its personality, upload knowledge bases, integrate with tools like Google Calendar, and craft its unique voice. Whether it&apos;s a digital clone of yourself, a specialized consultant, a historical figure, or a fictional character—you have total creative control.
            </p>
            <p className="text-lg mb-6">
              <strong className="text-foreground">DEPLOY:</strong> Launch your AI agent to the world with its own personalized landing page and custom URL. Share it across social media, embed it on websites, or integrate it into apps. Your AI is accessible 24/7, ready to engage with anyone, anywhere.
            </p>
            <p className="text-lg mb-6">
              <strong className="text-foreground">MONETIZE:</strong> Turn your AI into a revenue stream. Charge per conversation, offer subscription access, or create premium tiers. The creator economy meets AI—build once, earn forever. Your AI works while you sleep.
            </p>
            <p className="text-lg mb-6">
              This is the future of AI: <strong className="text-foreground">owned by creators, powered by the community, monetized by you.</strong> Not controlled by centralized corporations, but distributed across Web3. Join the AI revolution and start earning from your creativity today.
            </p>
          </div>
        </section>

        {/* The Three Pillars */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">The Three Pillars</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="text-2xl text-center">CREATE</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Build your AI agent with complete customization. No coding required—just your vision.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Custom personalities & knowledge</div>
                  <div>Integrations & tools</div>
                  <div>Visual branding & design</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-center">DEPLOY</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Launch your AI to the world with custom URLs and personalized landing pages.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Personalized landing pages</div>
                  <div>Custom URLs & sharing</div>
                  <div>24/7 availability</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-center">MONETIZE</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Turn your AI into a revenue stream. Build once, earn forever.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Per-conversation pricing</div>
                  <div>Subscription models</div>
                  <div>Premium tiers</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-2xl font-bold mb-6 text-center">Platform Capabilities</h3>
          
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

            {/* Website Embedding */}
            <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-primary tracking-wide">ENTERPRISE FEATURE</div>
                    <CardTitle className="text-xl">Website Embedding & Customer Support</CardTitle>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Currently Live
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Deploy your Sim directly on your personal or company website as a super intelligent AI assistant to help your customers 24/7. No more waiting on hold or delayed email responses.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">One-line embed code integration</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Customized for your brand & products</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Instant customer support 24/7</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Product knowledge integration</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Lead generation & qualification</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Reduce support costs by 80%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Monetization & Economics */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Monetization & Platform Economics</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-6 w-6 text-primary" />
                  Creator Revenue Streams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Multiple ways to monetize your AI agents:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Per-conversation pricing (pay-per-use model)</li>
                  <li>Monthly subscription access</li>
                  <li>Premium tier features and capabilities</li>
                  <li>Enterprise licensing opportunities</li>
                  <li>Custom integrations and white-label solutions</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                  $SIM Token Utility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The $SIM token powers the entire ecosystem:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Platform transaction fees paid in $SIM</li>
                  <li>Creator rewards and revenue sharing</li>
                  <li>Governance and voting rights</li>
                  <li>Staking for enhanced features and discounts</li>
                  <li>Access to premium AI models and capabilities</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">Start Earning From Your AI Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                <strong>The creator economy meets AI.</strong> Build your AI agent once and create a passive income stream. Every conversation, every subscription, every integration—you earn.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">What You Can Build</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Expert consultants (legal, medical, business)</li>
                    <li>Personal coaches and mentors</li>
                    <li>Educational tutors and trainers</li>
                    <li>Historical figures and thought leaders</li>
                    <li>Fictional characters and entertainers</li>
                    <li>Industry specialists and advisors</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">How You Earn</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Set per-conversation rates</li>
                    <li>Create monthly subscription tiers</li>
                    <li>Offer premium features and content</li>
                    <li>License to businesses and enterprises</li>
                    <li>Keep 85% of revenue (platform takes 15%)</li>
                    <li>Instant payouts in crypto</li>
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
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
            <CardHeader>
              <CardTitle className="text-3xl">Start Building Your AI Business Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto text-lg">
                Join Sim developers who are building, deploying, and monetizing AI agents on Sim Protocol. The future of the creator economy is here—and it&apos;s powered by AI.
              </p>
              <div className="flex flex-col items-center gap-4 mb-6">
                <Button 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={() => navigate('/')}
                >
                  Create Your AI Agent
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground">No credit card required • Launch in minutes</p>
              </div>
              <div className="text-center pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-2">$SIM Token Contract Address:</p>
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