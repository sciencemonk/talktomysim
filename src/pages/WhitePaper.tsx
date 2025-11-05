import { ArrowRight, TrendingUp, Coins, Zap, Shield, Sparkles, Globe, DollarSign, Bot, Network } from "lucide-react";
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
          <Badge variant="secondary" className="mb-6">
            White Paper v3.0
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            The Agentic Payments Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Where AI agents become autonomous economic participants through x402 payments and agentic commerce
          </p>
        </div>

        {/* Vision Section */}
        <section className="mb-16 text-center flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-6">The Vision</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground text-center flex flex-col items-center">
            <p className="text-lg mb-6 max-w-3xl">
              <strong className="text-foreground">The future of commerce isn't human-to-human or human-to-business.</strong> It's agent-to-agent, human-to-agent, and agent-to-business. A new economic layer where AI agents autonomously transact, collaborate, and create value.
            </p>
            <p className="text-lg mb-6 max-w-3xl">
              We're building the <strong className="text-foreground">infrastructure for the agentic economy</strong>—where payments happen per-request, settlements are instant, and AI agents can participate as first-class economic citizens.
            </p>
            <p className="text-lg mb-6 max-w-3xl">
              This is <strong className="text-foreground">agentic commerce</strong>: autonomous, instant, and native to AI.
            </p>
          </div>
        </section>

        {/* The Problem */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">The Problem with Traditional Payments</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="border-2 border-destructive/30">
              <CardHeader>
                <CardTitle className="text-xl text-center">Subscription Fatigue</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Users pay monthly fees whether they use a service once or a thousand times
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✗ Fixed costs for variable value</div>
                  <div>✗ Commitment barriers</div>
                  <div>✗ Unused subscriptions</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-destructive/30">
              <CardHeader>
                <CardTitle className="text-xl text-center">Payment Friction</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Traditional payment flows interrupt user experience and require account creation
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✗ Multi-step checkout</div>
                  <div>✗ Account requirements</div>
                  <div>✗ Slow settlements</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-destructive/30">
              <CardHeader>
                <CardTitle className="text-xl text-center">Agent Incompatibility</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  AI agents can't autonomously make payments or receive revenue in traditional systems
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✗ No agent wallets</div>
                  <div>✗ Manual intervention needed</div>
                  <div>✗ Can't participate in commerce</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-destructive/30">
              <CardHeader>
                <CardTitle className="text-xl text-center">Centralized Control</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Payment processors control access, take high fees, and can freeze accounts
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✗ 3-5% processing fees</div>
                  <div>✗ Platform risk</div>
                  <div>✗ Geographic restrictions</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* The Solution: x402 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">The Solution: x402 Payment Protocol</h2>
          
          <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/30 mb-8">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-4">
                <Zap className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">HTTP 402: Payment Required</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                x402 is a novel payment protocol that extends HTTP with native payment capabilities. When an AI agent or API requires payment, it returns a <code className="bg-muted px-2 py-1 rounded">402 Payment Required</code> status with payment instructions—enabling seamless per-request micropayments.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-center">Per-Request Payments</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Pay only for what you use—no subscriptions, no commitments, no waste
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✓ Usage-based pricing</div>
                  <div>✓ No upfront costs</div>
                  <div>✓ Perfect value alignment</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-500/30">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <Shield className="h-8 w-8 text-purple-500" />
                </div>
                <CardTitle className="text-xl text-center">Instant Settlement</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Crypto-native payments settle in seconds, not days—enabling real-time commerce
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✓ Sub-second finality</div>
                  <div>✓ No chargebacks</div>
                  <div>✓ Immediate access</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-pink-500/30">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <Sparkles className="h-8 w-8 text-pink-500" />
                </div>
                <CardTitle className="text-xl text-center">AI-Native</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Designed for autonomous agents—machine-readable, programmable, composable
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✓ Agent wallets</div>
                  <div>✓ Autonomous transactions</div>
                  <div>✓ API-first design</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">How x402 Works</h2>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">1</div>
                  <CardTitle className="text-lg">Request</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  User or agent makes an HTTP request to an AI service (e.g., <code className="bg-muted px-2 py-1 rounded text-xs">/chat</code>)
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">2</div>
                  <CardTitle className="text-lg">402 Response</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Service returns <code className="bg-muted px-2 py-1 rounded text-xs">402 Payment Required</code> with payment details:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg text-xs font-mono">
                  {`{
  "price": "0.01 SOL",
  "wallet": "AgentWallet...",
  "description": "Premium AI Chat"
}`}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">3</div>
                  <CardTitle className="text-lg">Payment</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Client (human wallet or agent wallet) sends payment to specified address via Solana blockchain
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">4</div>
                  <CardTitle className="text-lg">Retry with Proof</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Client retries original request with payment proof (transaction signature)
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">5</div>
                  <CardTitle className="text-lg">Service Delivered</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Service validates payment on-chain and returns the requested data or service
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Agentic Commerce */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Agentic Commerce: The New Economy</h2>
          
          <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20 border-2 border-primary/20 mb-8">
            <CardContent className="pt-6 text-center">
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
                <strong className="text-foreground">Agentic commerce</strong> is a paradigm where AI agents autonomously discover, negotiate, and transact with other agents and services—creating a self-sustaining economic layer built on trust, transparency, and instant settlement.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-center">Agent-to-Agent Commerce</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  AI agents autonomously hire other agents, purchase services, and compose workflows
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Research agent hires data analysis agent</li>
                  <li>• Trading agent pays for real-time market data</li>
                  <li>• Content agent purchases image generation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-center">Turn X Accounts into Revenue</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Train AI agents on X accounts and monetize every interaction with x402
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Automated personality clones</li>
                  <li>• Expert knowledge agents</li>
                  <li>• Always-on engagement</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <Network className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-center">Composable AI Services</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Chain multiple AI services together, with each step paid via x402
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Multi-agent workflows</li>
                  <li>• Specialized task routing</li>
                  <li>• Dynamic service discovery</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-center">Instant Monetization</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Deploy an agent, set a price, start earning—no payment processing setup required
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Zero payment infrastructure</li>
                  <li>• Global by default</li>
                  <li>• Real-time revenue</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Platform Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Platform Capabilities</h2>
          
          <div className="grid gap-6 mb-12">
            <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-sm font-medium text-primary tracking-wide">LIVE NOW</div>
                  <CardTitle className="text-xl">Build Any AI Agent</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-center">
                <p className="text-muted-foreground mb-6 leading-relaxed max-w-2xl mx-auto">
                  Create custom AI agents with unique personalities, knowledge bases, and capabilities. No coding required.
                </p>
                <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Custom personalities</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Knowledge training</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Custom avatars</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Voice capabilities</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">X account training</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Multiple integrations</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-sm font-medium text-primary tracking-wide">LIVE NOW</div>
                  <CardTitle className="text-xl">x402 Native Payments</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-center">
                <p className="text-muted-foreground mb-6 leading-relaxed max-w-2xl mx-auto">
                  Built-in support for x402 payments—set a price per interaction and start earning instantly via crypto.
                </p>
                <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Per-request pricing</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Solana integration</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Instant settlement</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">No intermediaries</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Agent wallets</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Transparent fees</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-sm font-medium text-primary tracking-wide">LIVE NOW</div>
                  <CardTitle className="text-xl">Deploy Everywhere</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-center">
                <p className="text-muted-foreground mb-6 leading-relaxed max-w-2xl mx-auto">
                  Your agents get instant public URLs, embeddable widgets, and can be shared across the web.
                </p>
                <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Public URLs</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Landing pages</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Embed widgets</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">API access</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Social sharing</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Analytics</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why This Matters */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Why This Matters</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl text-center">For Creators & Businesses</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-muted-foreground space-y-3 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Turn your expertise into autonomous revenue streams</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Monetize 24/7 without manual intervention</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Scale infinitely without infrastructure costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Global reach with zero payment barriers</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl text-center">For Users</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-muted-foreground space-y-3 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Pay only for what you actually use</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>No subscription fatigue or wasted payments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Instant access to premium AI services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Transparent pricing and instant settlement</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl text-center">For Developers</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-muted-foreground space-y-3 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Build composable AI services that earn autonomously</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>No payment processing integration required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Focus on AI capabilities, not billing infrastructure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Leverage the entire agentic commerce ecosystem</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl text-center">For the Ecosystem</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-muted-foreground space-y-3 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Enable a new layer of autonomous economic activity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Create markets for specialized AI services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Drive innovation through composability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Build the foundation for the agentic economy</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* The Future */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">The Agentic Economy</h2>
          
          <div className="space-y-6 max-w-3xl mx-auto mb-12">
            <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20 border-2 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-lg text-muted-foreground leading-relaxed text-center mb-6">
                  We're building the infrastructure for a future where AI agents are economic participants, not just tools. Where value flows instantly between agents and humans. Where anyone can create, deploy, and monetize AI without barriers.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <TrendingUp className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2 text-lg">Trillion-Dollar Opportunity</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        The agentic commerce market is in its infancy. We're building the payment rails for an entirely new economic layer—potentially larger than the creator economy.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Network className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2 text-lg">Network Effects</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Every new agent increases the value of the network. Agents discover and transact with other agents, creating exponential growth opportunities.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Sparkles className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2 text-lg">Innovation Acceleration</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        When anyone can build and monetize AI, innovation accelerates. Specialized agents emerge for every niche, creating a rich ecosystem of capabilities.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Globe className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2 text-lg">Global from Day One</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Crypto payments make geographic borders irrelevant. Your AI can serve and earn from anyone, anywhere, instantly.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
            <CardHeader>
              <CardTitle className="text-4xl">Join the Agentic Economy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                Build AI agents. Enable x402 payments. Participate in agentic commerce. Start earning from your AI today.
              </p>
              <div className="flex flex-col items-center gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={() => navigate('/')}
                >
                  Start Building Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground">Create your first agent • Set your price • Start earning</p>
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
