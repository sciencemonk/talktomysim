
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Brain, Users, MessageSquare, CheckCircle, Star } from "lucide-react";

const Landing = () => {
  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth sign-in
    console.log("Google sign-in clicked");
  };

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Tutors",
      description: "Create intelligent tutors that adapt to each student's learning style and pace"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Personalized Learning",
      description: "Every student gets individualized attention and support when they need it most"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "24/7 Availability",
      description: "Your AI tutors are always ready to help students, even outside classroom hours"
    }
  ];

  const benefits = [
    "Create up to 3 AI tutors completely free",
    "No technical skills required - simple setup",
    "Track student progress and engagement",
    "Covers all subjects and grade levels",
    "Instant help for struggling students"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brandBlue/5 via-background to-brandPurple/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-brandPurple" />
            <span className="text-xl font-bold">AI Tutors</span>
          </div>
          <Button onClick={handleGoogleSignIn} variant="outline">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge variant="secondary" className="mb-4">
          Free for Teachers
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brandBlue to-brandPurple bg-clip-text text-transparent">
          Create AI Tutors for Your Students
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Empower your students with personalized AI tutors that provide instant help, 
          adapt to their learning style, and are available 24/7.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={handleGoogleSignIn} 
            size="lg" 
            className="bg-brandPurple hover:bg-brandPurple/90 text-white px-8"
          >
            Sign in with Google
          </Button>
          <p className="text-sm text-muted-foreground">
            ✨ Create up to 3 tutors for free
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Teachers Love AI Tutors
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-brandPurple/10 rounded-full w-fit">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything You Need to Get Started
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-brandPurple mt-0.5 flex-shrink-0" />
                  <span className="text-base">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="text-lg mb-4">
              "My students now get instant help with math problems, even when I'm not available. 
              The AI tutor explains concepts in different ways until they understand."
            </blockquote>
            <cite className="text-muted-foreground">
              — Sarah Johnson, 5th Grade Teacher
            </cite>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-brandBlue to-brandPurple py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Classroom?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teachers already using AI tutors to help their students succeed.
          </p>
          <Button 
            onClick={handleGoogleSignIn}
            size="lg" 
            variant="secondary"
            className="bg-white text-brandPurple hover:bg-gray-100"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 AI Tutors. Made for teachers, by teachers.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
