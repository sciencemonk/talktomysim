import { ArrowRight, TrendingUp, Coins, Zap, Shield, Sparkles, Globe, DollarSign, Bot, Network } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WhitePaperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WhitePaperModal = ({ open, onOpenChange }: WhitePaperModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/50">
          <DialogTitle className="text-2xl font-bold">White Paper v3.0</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            The Agentic Payments Platform — Building the Infrastructure for the Agentic Economy
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-8 py-6">
            {/* Hero Section */}
            <div className="space-y-4 border-b pb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                The Agentic Payments Platform
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                Where AI agents become autonomous economic participants through x402 payments and agentic commerce
              </p>
            </div>

            {/* Vision Section */}
            <section className="space-y-4 border-b pb-8">
              <h2 className="text-2xl font-bold text-foreground">The Vision</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">The future of commerce isn't human-to-human or human-to-business.</strong> It's agent-to-agent, human-to-agent, and agent-to-business. A new economic layer where AI agents autonomously transact, collaborate, and create value.
                </p>
                <p>
                  We're building the <strong className="text-foreground">infrastructure for the agentic economy</strong>—where payments happen per-request, settlements are instant, and AI agents can participate as first-class economic citizens.
                </p>
                <p>
                  This is <strong className="text-foreground">agentic commerce</strong>: autonomous, instant, and native to AI.
                </p>
              </div>
            </section>

            {/* The Problem */}
            <section className="space-y-6 border-b pb-8">
              <h2 className="text-2xl font-bold text-foreground">The Problem with Traditional Payments</h2>
              
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <Card className="border-2 border-destructive/30">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl text-center">Subscription Fatigue</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      Users pay monthly fees whether they use a service once or a thousand times
                    </p>
                    <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
                      <div>✗ Fixed costs for variable value</div>
                      <div>✗ Commitment barriers</div>
                      <div>✗ Unused subscriptions</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-destructive/30">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl text-center">Payment Friction</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      Traditional payment flows interrupt user experience and require account creation
                    </p>
                    <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
                      <div>✗ Multi-step checkout</div>
                      <div>✗ Account requirements</div>
                      <div>✗ Slow settlements</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-destructive/30">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl text-center">Agent Incompatibility</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      AI agents can't autonomously make payments or receive revenue in traditional systems
                    </p>
                    <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
                      <div>✗ No agent wallets</div>
                      <div>✗ Manual intervention needed</div>
                      <div>✗ Can't participate in commerce</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-destructive/30">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl text-center">Centralized Control</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      Payment processors control access, take high fees, and can freeze accounts
                    </p>
                    <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
                      <div>✗ 3-5% processing fees</div>
                      <div>✗ Platform risk</div>
                      <div>✗ Geographic restrictions</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* The Solution: x402 */}
            <section className="space-y-6 border-b pb-8">
              <h2 className="text-2xl font-bold text-foreground">The Solution: x402 Payment Protocol</h2>
              
              <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/30 mb-8">
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-4">
                    <Zap className="h-10 md:h-12 w-10 md:w-12 text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-4">HTTP 402: Payment Required</h3>
                  <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                    x402 is a novel payment protocol that extends HTTP with native payment capabilities. When an AI agent or API requires payment, it returns a <code className="bg-muted px-2 py-1 rounded text-xs md:text-sm">402 Payment Required</code> status with payment instructions—enabling seamless per-request micropayments.
                  </p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <Card className="border-2 border-primary/30">
                  <CardHeader>
                    <div className="flex justify-center mb-2">
                      <Zap className="h-6 md:h-8 w-6 md:w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg md:text-xl text-center">Per-Request Payments</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      Pay only for what you use—no subscriptions, no commitments, no waste
                    </p>
                    <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
                      <div>✓ Usage-based pricing</div>
                      <div>✓ No upfront costs</div>
                      <div>✓ Perfect value alignment</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-purple-500/30">
                  <CardHeader>
                    <div className="flex justify-center mb-2">
                      <Shield className="h-6 md:h-8 w-6 md:w-8 text-purple-500" />
                    </div>
                    <CardTitle className="text-lg md:text-xl text-center">Instant Settlement</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      Crypto-native payments settle in seconds, not days—enabling real-time commerce
                    </p>
                    <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
                      <div>✓ Sub-second finality</div>
                      <div>✓ No chargebacks</div>
                      <div>✓ Immediate access</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-pink-500/30">
                  <CardHeader>
                    <div className="flex justify-center mb-2">
                      <Sparkles className="h-6 md:h-8 w-6 md:w-8 text-pink-500" />
                    </div>
                    <CardTitle className="text-lg md:text-xl text-center">AI-Native</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      Designed for autonomous agents—machine-readable, programmable, composable
                    </p>
                    <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
                      <div>✓ Agent wallets</div>
                      <div>✓ Autonomous transactions</div>
                      <div>✓ API-first design</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* How It Works */}
            <section className="space-y-6 border-b pb-8">
              <h2 className="text-2xl font-bold text-foreground">How x402 Works</h2>
              
              <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm md:text-base">1</div>
                      <CardTitle className="text-base md:text-lg">Request</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm md:text-base text-muted-foreground">
                      User or agent makes an HTTP request to an AI service (e.g., <code className="bg-muted px-2 py-1 rounded text-xs">/chat</code>)
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm md:text-base">2</div>
                      <CardTitle className="text-base md:text-lg">402 Response</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm md:text-base text-muted-foreground mb-3">
                      Service returns <code className="bg-muted px-2 py-1 rounded text-xs">402 Payment Required</code> with payment details:
                    </p>
                    <div className="bg-muted/50 p-3 md:p-4 rounded-lg text-xs font-mono overflow-x-auto">
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
                      <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm md:text-base">3</div>
                      <CardTitle className="text-base md:text-lg">Payment</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Client (human wallet or agent wallet) sends payment to specified address via Solana blockchain
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm md:text-base">4</div>
                      <CardTitle className="text-base md:text-lg">Retry with Proof</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Client retries original request with payment proof (transaction signature)
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm md:text-base">5</div>
                      <CardTitle className="text-base md:text-lg">Service Delivered</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Service validates payment on-chain and returns the requested data or service
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Agentic Commerce */}
            <section className="space-y-6 border-b pb-8">
              <h2 className="text-2xl font-bold text-foreground">Agentic Commerce: The New Economy</h2>
              
              <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20 border-2 border-primary/20 mb-8">
                <CardContent className="pt-6 text-center">
                  <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
                    <strong className="text-foreground">Agentic commerce</strong> is a paradigm where AI agents autonomously discover, negotiate, and transact with other agents and services—creating a self-sustaining economic layer built on trust, transparency, and instant settlement.
                  </p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex justify-center mb-2">
                      <Bot className="h-6 md:h-8 w-6 md:w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg md:text-xl text-center">Agent-to-Agent Commerce</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      AI agents autonomously hire other agents, purchase services, and compose workflows
                    </p>
                    <ul className="text-xs md:text-sm text-muted-foreground space-y-2">
                      <li>• Research agent hires data analysis agent</li>
                      <li>• Trading agent pays for real-time market data</li>
                      <li>• Content agent purchases image generation</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex justify-center mb-2">
                      <Globe className="h-6 md:h-8 w-6 md:w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg md:text-xl text-center">Turn X Accounts into Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      Train AI agents on X accounts and monetize every interaction with x402
                    </p>
                    <ul className="text-xs md:text-sm text-muted-foreground space-y-2">
                      <li>• Automated personality clones</li>
                      <li>• Expert knowledge agents</li>
                      <li>• Always-on engagement</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex justify-center mb-2">
                      <Network className="h-6 md:h-8 w-6 md:w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg md:text-xl text-center">Composable AI Services</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      Chain multiple AI services together, with each step paid via x402
                    </p>
                    <ul className="text-xs md:text-sm text-muted-foreground space-y-2">
                      <li>• Multi-agent workflows</li>
                      <li>• Specialized task routing</li>
                      <li>• Dynamic service discovery</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex justify-center mb-2">
                      <DollarSign className="h-6 md:h-8 w-6 md:w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg md:text-xl text-center">Instant Monetization</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      Deploy an agent, set a price, start earning—no payment processing setup required
                    </p>
                    <ul className="text-xs md:text-sm text-muted-foreground space-y-2">
                      <li>• Zero payment infrastructure</li>
                      <li>• Global by default</li>
                      <li>• Real-time revenue</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Why This Matters */}
            <section className="space-y-6 border-b pb-8">
              <h2 className="text-2xl font-bold text-foreground">Why This Matters</h2>
              
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl text-center">For Creators & Businesses</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <ul className="text-sm md:text-base text-muted-foreground space-y-3 text-left">
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
                    <CardTitle className="text-lg md:text-xl text-center">For Users</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <ul className="text-sm md:text-base text-muted-foreground space-y-3 text-left">
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
                    <CardTitle className="text-lg md:text-xl text-center">For Developers</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <ul className="text-sm md:text-base text-muted-foreground space-y-3 text-left">
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
                    <CardTitle className="text-lg md:text-xl text-center">For the Ecosystem</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <ul className="text-sm md:text-base text-muted-foreground space-y-3 text-left">
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
            <section className="space-y-6 pb-8">
              <h2 className="text-2xl font-bold text-foreground">The Agentic Economy</h2>
              
              <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20 border-2 border-primary/20 mb-8">
                <CardContent className="pt-6">
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-center mb-6">
                    We're building the infrastructure for a future where AI agents are economic participants, not just tools. Where value flows instantly between agents and humans. Where anyone can create, deploy, and monetize AI without barriers.
                  </p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <Card className="border border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <TrendingUp className="h-5 md:h-6 w-5 md:w-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-2 text-base md:text-lg">Trillion-Dollar Opportunity</h3>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          The agentic commerce market is in its infancy. We're building the payment rails for an entirely new economic layer—potentially larger than the creator economy.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Network className="h-5 md:h-6 w-5 md:w-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-2 text-base md:text-lg">Network Effects</h3>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          Every new agent increases the value of the network. Agents discover and transact with other agents, creating exponential growth opportunities.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Sparkles className="h-5 md:h-6 w-5 md:w-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-2 text-base md:text-lg">Innovation Acceleration</h3>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          When anyone can build and monetize AI, innovation accelerates. Specialized agents emerge for every niche, creating a rich ecosystem of capabilities.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Globe className="h-5 md:h-6 w-5 md:w-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-2 text-base md:text-lg">Global from Day One</h3>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          Crypto payments make geographic borders irrelevant. Your AI can serve and earn from anyone, anywhere, instantly.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
