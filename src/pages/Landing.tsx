import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Brain, Star, Mail, Phone, MapPin, Check, MessageSquare, Settings, BarChart3 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Landing = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isGeneralContactOpen, setIsGeneralContactOpen] = useState(false);

  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth sign-in
    console.log("Google sign-in clicked");
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    console.log("Contact form submitted");
    setIsContactOpen(false);
  };

  const handleGeneralContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement general contact form submission
    console.log("General contact form submitted");
    setIsGeneralContactOpen(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
        style={{
          backgroundImage: `url('/lovable-uploads/f3a6789c-4ba5-4075-9d4f-b27c183eeadd.png')`
        }} 
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">AI Tutors</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-4xl">
            <Badge variant="secondary" className="mb-6 bg-brandPurple text-white border-white/30 text-lg px-6 py-2">
              Get Three Free Tutors
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Personalized AI Tutors for Your Students
            </h1>

            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">Empower your students with AI-powered tutors that help every student succeed.</p>
            
            <Button onClick={handleGoogleSignIn} size="lg" className="bg-white text-brandPurple hover:bg-gray-100 px-8 py-4 text-lg font-semibold mb-12">
              <img src="/lovable-uploads/36c4909a-6779-43ae-a435-5a07fbd668be.png" alt="Google" className="w-5 h-5 mr-3" />
              Sign Up with Google
            </Button>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                <Brain className="h-8 w-8 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">AI-Powered</h3>
                <p className="text-sm opacity-90">Smart tutors that understand each student's needs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Personalized</h3>
                <p className="text-sm opacity-90">Tailored learning paths for every student</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                <BookOpen className="h-8 w-8 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Easy Setup</h3>
                <p className="text-sm opacity-90">Create your first tutor in under 5 minutes</p>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-white/90 italic mb-2">
                "AI Tutors transformed my classroom. My students are more engaged and receive personalized support when and where they need it."
              </p>
              <p className="text-white/70 text-sm">— Sarah Johnson, 5th Grade Teacher</p>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                See AI Tutors in Action
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get insights into student progress and customize tutor settings with our intuitive dashboard
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Student Usage Demo */}
              <Card className="shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-brandPurple" />
                    <CardTitle className="text-lg">Student Usage Analytics</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Math Tutor</span>
                      <span className="text-sm text-green-600">145 interactions</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Science Helper</span>
                      <span className="text-sm text-green-600">89 interactions</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Writing Assistant</span>
                      <span className="text-sm text-green-600">67 interactions</span>
                    </div>
                    <div className="mt-4 p-3 bg-brandPurple/10 rounded-lg">
                      <p className="text-sm text-brandPurple font-medium">Student Engagement: 92%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settings Demo */}
              <Card className="shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-brandPurple" />
                    <CardTitle className="text-lg">Tutor Customization</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Teaching Style</label>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div className="w-3/4 h-full bg-brandPurple rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-500">Encouraging & Patient</span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Difficulty Level</label>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div className="w-1/2 h-full bg-brandPurple rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-500">Grade-Appropriate</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-brandPurple" />
                      <span className="text-sm">Real-time feedback enabled</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-gray-600">
                Choose the plan that fits your classroom needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <Card className="relative shadow-lg border-2 border-gray-200">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">Free</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">$0</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Perfect for trying out AI Tutors</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Up to 3 AI tutors</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Basic analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Email support</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6" variant="outline">
                    Get Started Free
                  </Button>
                </CardContent>
              </Card>

              {/* Pro Plan - 8 Tutors */}
              <Card className="relative shadow-lg border-2 border-brandPurple">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-brandPurple text-white">Most Popular</Badge>
                </div>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">Pro</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">$25</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Great for small to medium classrooms</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Up to 8 AI tutors</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Advanced analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Custom tutor personalities</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6" variant="brand">
                    Start Pro Trial
                  </Button>
                </CardContent>
              </Card>

              {/* Pro Plan - 20 Tutors */}
              <Card className="relative shadow-lg border-2 border-gray-200">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">Pro Plus</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">$50</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Perfect for large classrooms</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Up to 20 AI tutors</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Advanced analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Everything in Pro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Bulk student management</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6" variant="outline">
                    Start Pro Plus
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Have questions about AI Tutors? We're here to help.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Dialog open={isGeneralContactOpen} onOpenChange={setIsGeneralContactOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="brand" className="w-full">
                    General Inquiries
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>General Inquiry</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleGeneralContactSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="general-name">Name</Label>
                      <Input id="general-name" placeholder="Your full name" required />
                    </div>
                    <div>
                      <Label htmlFor="general-email">Email</Label>
                      <Input id="general-email" type="email" placeholder="your.email@example.com" required />
                    </div>
                    <div>
                      <Label htmlFor="general-subject">Subject</Label>
                      <Input id="general-subject" placeholder="What can we help you with?" required />
                    </div>
                    <div>
                      <Label htmlFor="general-message">Message</Label>
                      <Textarea id="general-message" placeholder="Tell us more about your inquiry..." rows={4} />
                    </div>
                    <Button type="submit" className="w-full">Send Message</Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="w-full">
                    School Partnerships
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>School Partnership Inquiry</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your full name" required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your.email@school.edu" required />
                    </div>
                    <div>
                      <Label htmlFor="school">School/District</Label>
                      <Input id="school" placeholder="School or district name" required />
                    </div>
                    <div>
                      <Label htmlFor="students">Number of Students</Label>
                      <Input id="students" type="number" placeholder="Estimated student count" />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Tell us about your partnership needs..." rows={4} />
                    </div>
                    <Button type="submit" className="w-full">Send Inquiry</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black/60 backdrop-blur-sm text-white py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-6 w-6" />
                  <span className="font-bold">AI Tutors</span>
                </div>
                <p className="text-white/80 text-sm">
                  Empowering educators with AI-powered tutoring solutions for personalized student learning.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-white/80">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-white/80">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li>
                    <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                      <DialogTrigger asChild>
                        <button className="hover:text-white transition-colors text-left">
                          School Partnerships
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>School Partnership Inquiry</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="Your full name" required />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="your.email@school.edu" required />
                          </div>
                          <div>
                            <Label htmlFor="school">School/District</Label>
                            <Input id="school" placeholder="School or district name" required />
                          </div>
                          <div>
                            <Label htmlFor="students">Number of Students</Label>
                            <Input id="students" type="number" placeholder="Estimated student count" />
                          </div>
                          <div>
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="Tell us about your partnership needs..." rows={4} />
                          </div>
                          <Button type="submit" className="w-full">Send Inquiry</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <div className="space-y-2 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>support@aitutors.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>1-800-AI-TUTOR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>San Francisco, CA</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/70">
              <p>&copy; 2024 AI Tutors. All rights reserved. | Privacy Policy | Terms of Service</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
