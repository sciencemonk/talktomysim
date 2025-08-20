
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, Shield, CheckCircle, Award, Lightbulb, Zap, Sparkles, Mail, Building2, Users, Crown } from "lucide-react";
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

  const handleContactFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const contactData = {
      first_name: formData.get('firstName') as string,
      last_name: formData.get('lastName') as string,
      email: formData.get('email') as string,
      organization: formData.get('organization') as string,
      message: formData.get('message') as string,
    };

    try {
      const { error } = await supabase
        .from('partnership_inquiries')
        .insert({
          contact_name: `${contactData.first_name} ${contactData.last_name}`,
          email: contactData.email,
          course_name: contactData.organization,
          message: contactData.message,
        });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "Thank you for your interest. We'll be in touch soon.",
      });

      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
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
                <span>Privacy First</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <Crown className="h-4 w-4" />
                <span>Premium Advisors</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <Award className="h-4 w-4" />
                <span>Free to Start</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-neutral-900 dark:text-white mb-6 leading-none">
              Talk to the Greatest
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent font-medium">
                Minds Who Ever Lived
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Get personalized advice and mentorship from history's most influential thinkers, 
              leaders, and visionaries through AI-powered conversations.
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
                <span>{isSigningIn ? "Signing in..." : "Start Your First Conversation"}</span>
              </Button>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
                No credit card required. Access premium advisors instantly.
              </p>
            </div>

            {/* Product Preview */}
            <div className="relative mb-20">
              <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 p-8 shadow-2xl max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="text-left space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20">
                        <Crown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                        Meet Richard Feynman
                      </h3>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      "Curious about how the universe works? I'd love to explore the fascinating 
                      world of physics with you! What mysteries of nature would you like to uncover together?"
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                        Physicist
                      </span>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                        Nobel Laureate
                      </span>
                    </div>
                  </div>
                  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      AI Advisor Ready to Mentor
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Three Pillars */}
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Legendary Mentors
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Access wisdom from history's greatest minds including philosophers, 
                  scientists, leaders, and visionaries.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Personalized Guidance
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Each conversation adapts to your interests, goals, and learning style 
                  for maximum impact and insight.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Transformative Insights
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Gain fresh perspectives on life's challenges through conversations 
                  with the world's most influential thinkers.
                </p>
              </div>
            </div>

            {/* Contact Form Section */}
            <div className="max-w-2xl mx-auto mb-20">
              <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
                    Partner with Us
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Interested in bringing AI advisors to your organization or community? Let's explore partnership opportunities.
                  </p>
                </div>

                <form onSubmit={handleContactFormSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Organization
                    </label>
                    <input
                      type="text"
                      id="organization"
                      name="organization"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your organization name"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Tell us about your partnership interests, organization size, or specific needs..."
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center justify-center gap-3"
                  >
                    <Mail className="h-5 w-5" />
                    <span>Send Message</span>
                  </Button>
                </form>
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
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Wisdom of the ages, conversations for today</p>
              </div>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              © 2024 Think With Me. Connecting minds across time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
