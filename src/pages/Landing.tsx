
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, Brain, Users, MessageSquare, CheckCircle, Star, Plus, TrendingUp, BookOpen } from "lucide-react";

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

  // Mock data to show what teachers can expect
  const mockTutors = [
    {
      id: "1",
      name: "Math Helper",
      type: "Math Tutor",
      status: "active",
      studentsHelped: 24,
      interactions: 156,
      helpfulness: 9.2
    },
    {
      id: "2", 
      name: "Reading Assistant",
      type: "Reading Tutor",
      status: "active",
      studentsHelped: 18,
      interactions: 89,
      helpfulness: 8.9
    },
    {
      id: "3",
      name: "Science Explorer",
      type: "Science Tutor", 
      status: "draft",
      studentsHelped: 0,
      interactions: 0,
      helpfulness: 0
    }
  ];

  const getSubjectIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'math tutor':
        return <Brain className="h-4 w-4" />;
      case 'reading tutor':
        return <BookOpen className="h-4 w-4" />;
      case 'science tutor':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <GraduationCap className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-brandPurple" />
            <span className="text-xl font-bold text-foreground">AI Tutors</span>
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

      {/* Dashboard Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Your AI Tutors Dashboard</h2>
          <p className="text-muted-foreground">See what your dashboard will look like with active tutors</p>
        </div>

        {/* Stats Preview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Ready to help students</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students Helped</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">Across all tutors</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground">Questions answered</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Helpfulness Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">9.1/10</div>
              <p className="text-xs text-muted-foreground">Average rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Tutors Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {mockTutors.map((tutor) => (
            <Card key={tutor.id} className="hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getSubjectIcon(tutor.type)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{tutor.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {tutor.type}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(tutor.status)}>
                    {tutor.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {tutor.status === 'active' 
                    ? `Helping students with ${tutor.type.split(' ')[0].toLowerCase()} concepts and problem-solving`
                    : "Ready to be configured and activated"
                  }
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{tutor.studentsHelped}</p>
                    <p className="text-muted-foreground">Students Helped</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{tutor.interactions}</p>
                    <p className="text-muted-foreground">Interactions</p>
                  </div>
                </div>
                
                {tutor.helpfulness > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Helpfulness</span>
                    <span className="text-sm font-medium">{tutor.helpfulness}/10</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button className="gap-2" disabled>
            <Plus className="h-4 w-4" />
            Create Your First Tutor
          </Button>
          <p className="text-sm text-muted-foreground mt-2">Sign in to start creating</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
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
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
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
      </section>

      {/* Testimonial Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
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
        </div>
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
      <footer className="border-t py-8 bg-background">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 AI Tutors. Made for teachers, by teachers.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
