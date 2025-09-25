import { ArrowRight, Brain, BookOpen, Mic, Users, TrendingUp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TopNavigation from "@/components/TopNavigation";
import SimpleFooter from "@/components/SimpleFooter";
import { useNavigate } from "react-router-dom";

const WhitePaper = () => {
  const navigate = useNavigate();
  const copyCAToClipboard = async () => {
    const ca = "66gmaksi3kdlak34AtJnWqFW6H2L5YQDRy4W41y6zbpump";
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
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">
            The Sim Protocol
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Democratizing access to history's greatest minds through AI, powered by the $SIM ecosystem
          </p>
          <Button 
            onClick={copyCAToClipboard}
            className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90"
            size="lg"
          >
            <Coins className="mr-2 h-5 w-5" />
            Copy $SIM Contract Address
          </Button>
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
          <h2 className="text-3xl font-bold mb-8">The Three-Stage Roadmap</h2>
          
          <div className="grid gap-8 mb-12">
            {/* Stage 1 */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Brain className="h-8 w-8 text-purple-500" />
                  <div>
                    <CardTitle className="text-xl">Stage 1: Complex System Prompts</CardTitle>
                    <Badge variant="secondary">Currently Live</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Our foundation begins with meticulously crafted system prompts that capture the essence of each historical figure. These prompts encode:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Personality traits and communication styles</li>
                  <li>Core philosophical frameworks and methodologies</li>
                  <li>Historical context and time-period awareness</li>
                  <li>Signature thought patterns and decision-making processes</li>
                </ul>
              </CardContent>
            </Card>

            {/* Stage 2 */}
            <Card className="border-l-4 border-l-pink-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-pink-500" />
                  <div>
                    <CardTitle className="text-xl">Stage 2: Vector Embeddings Integration</CardTitle>
                    <Badge variant="outline">Q2 2025</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Deep knowledge integration through vector embeddings of complete works:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Full text analysis of published works, letters, and speeches</li>
                  <li>Real-time retrieval of specific quotes and concepts</li>
                  <li>Contextual understanding of evolving thoughts over time</li>
                  <li>Cross-referencing capabilities between different works</li>
                </ul>
              </CardContent>
            </Card>

            {/* Stage 3 */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Mic className="h-8 w-8 text-blue-500" />
                  <div>
                    <CardTitle className="text-xl">Stage 3: Real-Time Voice Synthesis</CardTitle>
                    <Badge variant="outline">Q4 2025</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The ultimate experience—natural voice conversations with historical figures:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>AI-generated voice synthesis matching historical speech patterns</li>
                  <li>Real-time conversational flow with natural interruptions</li>
                  <li>Emotional intelligence and contextual responses</li>
                  <li>Multi-language support for global accessibility</li>
                </ul>
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
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-2xl">Join the Revolution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Be part of democratizing access to human wisdom. The $SIM protocol represents the convergence of AI advancement, historical preservation, and decentralized economics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={copyCAToClipboard}
                  className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90"
                  size="lg"
                >
                  <Coins className="mr-2 h-5 w-5" />
                  Get $SIM Token
                </Button>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Contract Address:</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    66gmaksi3kdlak34AtJnWqFW6H2L5YQDRy4W41y6zbpump
                  </code>
                </div>
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