import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, MessageSquare, ArrowRight, Sparkles, Shield, Heart, DollarSign, Clock, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignInWithGoogle = async () => {
    try {
      setIsSigningIn(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app`,
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8">
            <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl">
              <Brain className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-light text-gray-900 mb-6 tracking-tight">
            Think With Me
          </h1>
          <h2 className="text-2xl text-gray-600 mb-8 font-light max-w-4xl mx-auto leading-relaxed">
            Create curated AI-powered learning experiences for your child. 
            Personalized conversations that spark curiosity and deepen understanding.
          </h2>
          
          {user ? (
            <Link to="/app">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-10 py-4 text-lg rounded-full font-medium shadow-xl hover:shadow-2xl transition-all duration-300">
                Go to Dashboard
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {/* Free offer tag - moved above button */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Free to create an account • Get 1 hour free when you sign up (Limited time offer)
                </span>
              </div>
              <Button 
                onClick={handleSignInWithGoogle}
                disabled={isSigningIn}
                size="lg" 
                className="bg-gray-900 hover:bg-gray-800 text-white px-10 py-4 text-lg rounded-full font-medium shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span>{isSigningIn ? "Signing in..." : "Sign in with Google"}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Revolutionary Statement */}
        <div className="text-center mb-20 py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl">
          <h3 className="text-4xl font-light text-gray-900 mb-6">
            A Revolution in Learning
          </h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Want your child to explore Austrian economics? Dive deep into nutrition science? 
            Create custom AI tutors that stay on topic, engage in meaningful two-way conversations, 
            and adapt to your child's unique profile and interests.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="text-center border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 rounded-2xl p-8">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-light text-gray-900">Curated Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 text-lg leading-relaxed">
                Design AI tutors for specific topics and learning goals. From complex economics 
                to everyday science, create focused learning experiences.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 rounded-2xl p-8">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-light text-gray-900">Child-Centered</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 text-lg leading-relaxed">
                Every tutor adapts to your child's age, interests, and learning style. 
                Powered by detailed child profiles you control completely.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 rounded-2xl p-8">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl font-light text-gray-900">Engaged Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 text-lg leading-relaxed">
                Two-way conversations that keep children engaged while staying on topic. 
                Learning feels natural, like talking with a knowledgeable friend.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-light text-gray-900 mb-6">
              Think With Me vs Traditional Tutoring
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how AI-powered learning partners compare to traditional private tutors
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Think With Me Column */}
                <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-semibold text-gray-900">Think With Me</h4>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1">Cost Effective</h5>
                        <p className="text-gray-600">$10 per hour for unlimited access</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shield className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1">Perfect Values Alignment</h5>
                        <p className="text-gray-600">No second guessing - you control the curriculum</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1">Infinite Patience</h5>
                        <p className="text-gray-600">Always respectful, never frustrated or tired</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Target className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1">Truly Personalized</h5>
                        <p className="text-gray-600">Informed by your child's profile and your objectives</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Traditional Tutor Column */}
                <div className="p-8 bg-gray-50">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-300 rounded-2xl mb-4">
                      <Users className="h-8 w-8 text-gray-600" />
                    </div>
                    <h4 className="text-2xl font-semibold text-gray-700">Traditional Tutor</h4>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-1">Expensive</h5>
                        <p className="text-gray-500">$100+ per hour, limited sessions</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shield className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-1">Values Uncertainty</h5>
                        <p className="text-gray-500">May not align with your family's values</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-1">Human Limitations</h5>
                        <p className="text-gray-500">Can get tired, frustrated, or have bad days</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Target className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-1">One-Size-Fits-All</h5>
                        <p className="text-gray-500">Uses their own methods and preferences</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="bg-gray-50 rounded-3xl p-12 mb-20">
          <div className="text-center mb-12">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-3xl font-light text-gray-900 mb-4">
              Built for Families
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Privacy-first design with complete parental control. 
              Safe, educational, and designed specifically for children's learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-light text-gray-900 mb-2">100%</div>
              <div className="text-gray-600">Parent Controlled</div>
            </div>
            <div>
              <div className="text-3xl font-light text-gray-900 mb-2">Safe</div>
              <div className="text-gray-600">COPPA Compliant</div>
            </div>
            <div>
              <div className="text-3xl font-light text-gray-900 mb-2">Free</div>
              <div className="text-gray-600">To Get Started</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-light text-gray-900 mb-6">
            Ready to Transform Learning?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Join parents who are creating personalized AI tutors 
            that make learning engaging, focused, and fun.
          </p>
          {!user && (
            <div className="flex flex-col items-center gap-4">
              {/* Free offer tag - moved above button */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Free to create an account • Get 1 hour free when you sign up (Limited time offer)
                </span>
              </div>
              <Button 
                onClick={handleSignInWithGoogle}
                disabled={isSigningIn}
                size="lg" 
                className="bg-gray-900 hover:bg-gray-800 text-white px-10 py-4 text-lg rounded-full font-medium shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span>{isSigningIn ? "Signing in..." : "Sign in with Google"}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mr-3">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Think With Me</h3>
            </div>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Empowering families to create personalized AI learning experiences for their children.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
              <div>© 2025 Think With Me. All rights reserved.</div>
              <div className="flex items-center gap-4">
                <span>Privacy Policy</span>
                <span>•</span>
                <span>Terms of Service</span>
                <span>•</span>
                <span>Contact Us</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
