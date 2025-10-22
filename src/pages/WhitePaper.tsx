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
        <div className="text-center mb-16 flex flex-col items-center">
          <Badge variant="secondary" className="mb-4">
            White Paper v2.0
          </Badge>
          <div className="flex justify-center mb-6">
            <img 
              src="/sim-logo-new.png?v=2" 
              alt="Sim" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Build Your AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create and deploy your own AI in minutes. No coding required. No technical knowledge needed. Just pure simplicity.
          </p>
        </div>

        {/* Vision Section */}
        <section className="mb-16 text-center flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-6">Why Build Your Own AI?</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground text-center flex flex-col items-center">
            <p className="text-lg mb-6 max-w-3xl">
              <strong className="text-foreground">The AI revolution isn't about using someone else's AI.</strong> It's about creating your own. Your own personality. Your own knowledge. Your own purpose.
            </p>
            <p className="text-lg mb-6 max-w-3xl">
              Whether you're building a business consultant, a customer service agent, a personal coach, or a creative companion—<strong className="text-foreground">Sim makes it possible for anyone to build their AI.</strong>
            </p>
            <p className="text-lg mb-6 max-w-3xl">
              No coding. No complexity. <strong className="text-foreground">Just build.</strong>
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">How to Build Your AI</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="text-2xl text-center">1. Design</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Give your AI a name, personality, and purpose. Upload an avatar. Define what makes it unique.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✓ No technical skills needed</div>
                  <div>✓ Complete creative control</div>
                  <div>✓ Ready in minutes</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-center">2. Launch</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Your AI goes live instantly with its own URL and landing page. Share it anywhere, anytime.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✓ Instant deployment</div>
                  <div>✓ Professional presence</div>
                  <div>✓ Always available</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-center">3. Scale</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Your AI handles unlimited conversations. Embed it on websites. Monetize it. Watch it grow.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✓ Unlimited capacity</div>
                  <div>✓ Multiple channels</div>
                  <div>✓ Revenue streams</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What You Can Build */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">What Can You Build?</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-2 border-primary/20 text-center">
              <CardHeader>
                <CardTitle className="text-xl">Business AI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Build AI for your business needs
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Customer support agents</li>
                  <li>Sales assistants</li>
                  <li>Product advisors</li>
                  <li>Lead qualifiers</li>
                  <li>FAQ responders</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 text-center">
              <CardHeader>
                <CardTitle className="text-xl">Personal AI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Build AI for personal growth
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Life coaches</li>
                  <li>Fitness trainers</li>
                  <li>Learning tutors</li>
                  <li>Creative partners</li>
                  <li>Productivity assistants</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 text-center">
              <CardHeader>
                <CardTitle className="text-xl">Creator AI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Build AI for your audience
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Expert consultants</li>
                  <li>Industry specialists</li>
                  <li>Thought leaders</li>
                  <li>Character personalities</li>
                  <li>Educational mentors</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 text-center">
              <CardHeader>
                <CardTitle className="text-xl">Entertainment AI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Build AI for fun and engagement
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Historical figures</li>
                  <li>Fictional characters</li>
                  <li>Gaming companions</li>
                  <li>Storytellers</li>
                  <li>Conversational art</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Platform Capabilities */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">What Your AI Can Do</h2>
          
          <div className="grid gap-6 mb-12">
            {/* Personalization */}
            <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-sm font-medium text-primary tracking-wide">CORE FEATURE</div>
                  <CardTitle className="text-xl">Complete Customization</CardTitle>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    Currently Live
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-center">
                <p className="text-muted-foreground mb-6 leading-relaxed max-w-2xl mx-auto">
                  Every detail of your AI is yours to define. From personality and knowledge to appearance and behavior—build exactly what you envision.
                </p>
                <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Custom personality & voice</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Unique avatars & branding</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Custom landing pages</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Personalized URLs</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Social media integration</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Visual themes</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Embedding */}
            <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-sm font-medium text-primary tracking-wide">EMBED ANYWHERE</div>
                  <CardTitle className="text-xl">Website Integration</CardTitle>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    Currently Live
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-center">
                <p className="text-muted-foreground mb-6 leading-relaxed max-w-2xl mx-auto">
                  Deploy your AI on any website with a single line of code. Instant customer support, lead generation, and engagement—all powered by your custom AI.
                </p>
                <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">One-line embed code</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">24/7 availability</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Brand customization</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Lead capture</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Instant responses</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Cost reduction</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integrations */}
            <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-sm font-medium text-primary tracking-wide">COMING SOON</div>
                  <CardTitle className="text-xl">External Integrations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-center">
                <p className="text-muted-foreground mb-6 leading-relaxed max-w-2xl mx-auto">
                  Connect your AI to external services and tools to expand its capabilities. Calendar management, email integration, and more coming soon.
                </p>
                <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                      <span className="text-sm text-muted-foreground">Calendar integration</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                      <span className="text-sm text-muted-foreground">Email connectivity</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                      <span className="text-sm text-muted-foreground">API access</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                      <span className="text-sm text-muted-foreground">Custom integrations</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Free & Open */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Free to Build. Free to Host.</h2>
          
          <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20 border-2 border-primary/20 text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Create Unlimited AI Agents at No Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                <strong>No hidden fees. No credit card required. No hosting costs.</strong> Build as many AI agents as you want, deploy them instantly, and let them handle unlimited conversations—all completely free.
              </p>
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">$0</div>
                  <p className="text-sm text-muted-foreground">To create your AI</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">$0</div>
                  <p className="text-sm text-muted-foreground">To host your AI</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">∞</div>
                  <p className="text-sm text-muted-foreground">Unlimited conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Market Opportunity */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">The Opportunity</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">AI Market</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary mb-2">$1.8T</p>
                <p className="text-sm text-muted-foreground">
                  Projected AI market by 2030
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Creator Economy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary mb-2">$104B</p>
                <p className="text-sm text-muted-foreground">
                  Current creator economy size
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Your Opportunity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary mb-2">Now</p>
                <p className="text-sm text-muted-foreground">
                  The time to build is today
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
            <CardHeader>
              <CardTitle className="text-4xl">Start Building Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                Join thousands of creators building and deploying AI on Sim. No coding required. No technical knowledge needed. Just your imagination and a few minutes.
              </p>
              <div className="flex flex-col items-center gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={() => navigate('/')}
                >
                  Build Your AI Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground">100% Free • Launch in minutes • No credit card required</p>
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
