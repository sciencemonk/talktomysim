
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, Shield, CheckCircle, Award, Lightbulb, Zap, Sparkles, Users, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentType } from "@/types/agent";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [historicalSims, setHistoricalSims] = useState<AgentType[]>([]);
  const [livingSims, setLivingSims] = useState<AgentType[]>([]);
  const [isLoadingSims, setIsLoadingSims] = useState(true);

  useEffect(() => {
    fetchSims();
  }, []);

  const mapAdvisorToAgent = (advisor: any): AgentType => ({
    id: advisor.id,
    name: advisor.name,
    description: advisor.description || '',
    type: 'General Tutor',
    status: advisor.is_active ? 'active' : 'inactive',
    createdAt: advisor.created_at,
    updatedAt: advisor.updated_at,
    avatar: advisor.avatar_url,
    prompt: advisor.prompt,
    title: advisor.title,
    is_featured: advisor.is_verified,
  });

  const fetchSims = async () => {
    try {
      setIsLoadingSims(true);
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('is_public', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const historical = data?.filter(sim => sim.sim_type === 'historical').map(mapAdvisorToAgent) || [];
      const living = data?.filter(sim => sim.sim_type === 'living').map(mapAdvisorToAgent) || [];

      setHistoricalSims(historical);
      setLivingSims(living);
    } catch (error) {
      console.error('Error fetching sims:', error);
    } finally {
      setIsLoadingSims(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/30">
      {/* Minimal Header */}
      <header className="absolute top-0 w-full z-50 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border-b border-neutral-200/20 dark:border-neutral-800/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <img 
                  src="/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png" 
                  alt="Think With Me" 
                  className="h-7 w-7"
                />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                Think With Me
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Trust Indicators */}
            <div className="inline-flex items-center gap-6 px-6 py-3 mb-8 bg-blue-50/80 dark:bg-blue-950/30 rounded-full border border-blue-100/50 dark:border-blue-900/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <Shield className="h-4 w-4" />
                <span>COPPA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <CheckCircle className="h-4 w-4" />
                <span>Built for Education</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <Award className="h-4 w-4" />
                <span>Free to Start</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-neutral-900 dark:text-white mb-6 leading-none">
              Thinking Partners
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent font-medium">
                for Classrooms
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              AI tutors designed to engage students in meaningful conversations 
              that promote critical thinking and deep understanding.
            </p>

            {/* CTA Section */}
            <div className="mb-16">
              <Button 
                onClick={handleSignInWithGoogle}
                disabled={isSigningIn}
                size="lg"
                className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-full px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningIn ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <img 
                    src="/lovable-uploads/b0174e22-c5cc-4bc5-8b34-8df738173560.png" 
                    alt="Google" 
                    className="h-5 w-5"
                  />
                )}
                <span>{isSigningIn ? "Signing in..." : "Get started with Google"}</span>
              </Button>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
                No credit card required. Start teaching in minutes.
              </p>
            </div>

            {/* Product Preview */}
            <div className="relative mb-20">
              <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 p-8 shadow-2xl max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="text-left space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20">
                        <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                        Meet Your AI Teaching Assistant
                      </h3>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      "Hello! I'm excited to explore this topic with you! My name is Science, 
                      and I'm here to help you learn about the fascinating world around us. 
                      What would you like to discover today?"
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                        Science
                      </span>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                        Grades 3-5
                      </span>
                    </div>
                  </div>
                  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Interactive AI Tutor Ready to Engage
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Three Pillars */}
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-4">
                  <Lightbulb className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Thinking Partners
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  AI tutors that engage students in deep, meaningful conversations 
                  promoting critical thinking.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  True Differentiation
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Personalized support that adapts to each student's learning style 
                  and pace in real-time.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Transformative Learning
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Move beyond traditional instruction to create dynamic, 
                  interactive learning experiences.
                </p>
              </div>
            </div>

            {/* Sims Section */}
            <div className="mt-32">
              <h2 className="text-4xl font-semibold text-neutral-900 dark:text-white mb-4 text-center">
                Explore Our Sims
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-12 text-center max-w-2xl mx-auto">
                Chat with historical figures or discover sims created by our community
              </p>

              <Tabs defaultValue="historical" className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                  <TabsTrigger value="historical" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Historical
                  </TabsTrigger>
                  <TabsTrigger value="living" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Living
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="historical" className="mt-8">
                  {isLoadingSims ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <CardHeader className="space-y-4 p-6">
                            <div className="flex items-center space-x-4">
                              <div className="rounded-full bg-muted h-16 w-16" />
                              <div className="space-y-2 flex-1">
                                <div className="h-5 bg-muted rounded w-3/4" />
                                <div className="h-4 bg-muted rounded w-1/2" />
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  ) : historicalSims.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {historicalSims.map((sim) => (
                        <Card 
                          key={sim.id} 
                          className="cursor-pointer hover:shadow-lg transition-all group bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200/50 dark:border-neutral-800/50"
                          onClick={() => navigate(`/app?sim=${sim.id}`)}
                        >
                          <CardHeader className="p-6">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-16 w-16 border-2 border-neutral-200 dark:border-neutral-700">
                                <AvatarImage src={sim.avatar || ''} alt={sim.name} />
                                <AvatarFallback className="text-lg font-semibold">{sim.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <CardTitle className="text-xl text-neutral-900 dark:text-white">{sim.name}</CardTitle>
                                <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
                                  {sim.title || "Historical Figure"}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6 pt-0">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                              {sim.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                      No historical sims available yet.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="living" className="mt-8">
                  {isLoadingSims ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : livingSims.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {livingSims.map((sim) => (
                        <Card 
                          key={sim.id} 
                          className="cursor-pointer hover:shadow-lg transition-all group bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200/50 dark:border-neutral-800/50"
                          onClick={() => navigate(`/app?sim=${sim.id}`)}
                        >
                          <CardHeader className="p-6">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-16 w-16 border-2 border-neutral-200 dark:border-neutral-700">
                                <AvatarImage src={sim.avatar || ''} alt={sim.name} />
                                <AvatarFallback className="text-lg font-semibold">{sim.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <CardTitle className="text-xl text-neutral-900 dark:text-white">{sim.name}</CardTitle>
                                <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
                                  Created by community
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6 pt-0">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                              {sim.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                          <Plus className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-3">
                          Create Your Own Sim
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                          Connect your wallet to create a personalized AI sim with a shareable link
                        </p>
                        <Button 
                          size="lg"
                          onClick={handleSignInWithGoogle}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-8"
                        >
                          Create a Sim
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-200/50 dark:border-neutral-800/50 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                <img 
                  src="/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png" 
                  alt="Think With Me" 
                  className="h-6 w-6"
                />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">Think With Me</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Empowering educators with AI</p>
              </div>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              © 2024 Think With Me. Built for educators, by educators.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
