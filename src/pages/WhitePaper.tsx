import { ArrowRight, TrendingUp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SimpleFooter from "@/components/SimpleFooter";
import { useNavigate } from "react-router-dom";
import { TopNavBar } from "@/components/TopNavBar";

const WhitePaper = () => {
  const navigate = useNavigate();

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
            The Future of AI is Personal
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Making it shockingly simple to create and deploy your own AI. No coding. No complexity. Just pure simplicity.
          </p>
        </div>

        {/* Vision Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">The Problem: AI is Too Complicated</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-lg mb-6">
              <strong className="text-foreground">ChatGPT isn&apos;t the future of AI.</strong> It&apos;s just the beginning. The real future of AI isn&apos;t one-size-fits-all chatbots. It&apos;s <strong className="text-foreground">personalized AI that knows you, understands your needs, and works for you.</strong>
            </p>
            <p className="text-lg mb-6">
              But here&apos;s the problem: creating your own AI has been impossibly complex. You need to be a developer. You need to understand APIs, prompts, embeddings, hosting, and a dozen other technical concepts. <strong className="text-foreground">That ends today.</strong>
            </p>
          </div>
        </section>

        {/* Solution Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">The Solution: Radically Simple AI Creation</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-lg mb-6">
              <strong className="text-foreground">Sim makes creating an AI as simple as filling out a form.</strong>
            </p>
            <p className="text-lg mb-6">
              No coding. No prompting expertise. No technical knowledge required. In just a few minutes, you can create and deploy a fully functional AI that:
            </p>
            <ul className="list-disc list-inside text-lg mb-6 space-y-2">
              <li>Has its own personality and knowledge</li>
              <li>Gets its own custom URL and landing page</li>
              <li>Can be shared instantly with anyone</li>
              <li>Runs 24/7 without you lifting a finger</li>
            </ul>
            <p className="text-lg mb-6">
              <strong className="text-foreground">This is what democratizing AI actually looks like.</strong> Not building better developer tools. Not creating more APIs. But making AI creation so simple that <em>anyone</em> can do it.
            </p>
          </div>
        </section>

        {/* Why Now Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Why Personalized AI Matters</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-lg mb-6">
              The future isn&apos;t everyone using the same AI. <strong className="text-foreground">The future is everyone having their own AI.</strong>
            </p>
            <p className="text-lg mb-6">
              Your personal trainer AI that knows your fitness goals. Your business consultant AI that understands your industry. Your virtual assistant that knows your calendar, preferences, and priorities. Your customer service AI that represents your brand perfectly.
            </p>
            <p className="text-lg mb-6">
              <strong className="text-foreground">These aren&apos;t distant dreams.</strong> With Sim, you can create any of these today. And you can do it in minutes, not months.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">How Sim Works</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="text-2xl text-center">1. Create</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Give your AI a name, description, and personality. Add an avatar. That&apos;s it.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✓ No coding required</div>
                  <div>✓ Takes 2 minutes</div>
                  <div>✓ Full customization</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-center">2. Deploy</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Your AI gets its own URL instantly. Share it anywhere. It&apos;s live in seconds.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✓ Instant deployment</div>
                  <div>✓ Custom landing page</div>
                  <div>✓ Works 24/7</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-center">3. Share</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Anyone can talk to your AI. No sign-up required. Just click and chat.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✓ Zero friction</div>
                  <div>✓ Instant access</div>
                  <div>✓ Unlimited usage</div>
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
              <div className="flex flex-col items-center gap-4">
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