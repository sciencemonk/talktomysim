
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, MessageSquare, ArrowRight, Sparkles, Shield, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

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
            <Link to="/dashboard">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-10 py-4 text-lg rounded-full font-medium shadow-xl hover:shadow-2xl transition-all duration-300">
                Go to Dashboard
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-10 py-4 text-lg rounded-full font-medium shadow-xl hover:shadow-2xl transition-all duration-300">
                Get Started
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
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
        <div className="text-center">
          <h2 className="text-4xl font-light text-gray-900 mb-6">
            Ready to Transform Learning?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Join parents who are creating personalized AI tutors 
            that make learning engaging, focused, and fun.
          </p>
          {!user && (
            <Link to="/login">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-10 py-4 text-lg rounded-full font-medium shadow-xl hover:shadow-2xl transition-all duration-300">
                Start Creating Today
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
