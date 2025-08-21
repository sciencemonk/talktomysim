
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, Shield, CheckCircle, Award, Lightbulb, Zap, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignInWithGoogle = async () => {
    try {
      setIsSigningIn(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        toast({
          title: "Sign In Failed",
          description: error.message || "There was an error signing in with Google. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error during Google sign in:', error);
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
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
                variant="brandGradient"
                className="rounded-full px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span>{isSigningIn ? "Signing in..." : "Create your free Sim today"}</span>
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
