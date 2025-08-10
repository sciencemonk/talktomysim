import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, BookOpen, Brain, Star, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
const Landing = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
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
  return <div className="min-h-screen bg-gray-100">
      {/* Hero Section - Facebook-inspired */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Brand and tagline */}
            <div>
              <div className="flex items-center justify-center gap-3 mb-6">
                <GraduationCap className="h-12 w-12 text-brandPurple" />
                <span className="text-5xl font-bold text-brandPurple">AI Tutors</span>
              </div>
              <p className="text-2xl text-gray-600 leading-relaxed mb-6 text-center">
                Create personalized AI tutors for your students in seconds.
              </p>
              <div className="flex justify-center">
                <Button onClick={handleGoogleSignIn} variant="outline" className="h-12 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white border-green-500 px-8">
                  <img src="/lovable-uploads/36c4909a-6779-43ae-a435-5a07fbd668be.png" alt="Google" className="w-5 h-5 mr-3" />
                  Sign Up with Google
                </Button>
              </div>
            </div>

            {/* Right side - Student image */}
            <div className="flex justify-center">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img src="/lovable-uploads/7d1d3b70-79f1-44e0-9bbe-9bf6ebab31a5.png" alt="Students working together on computers" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Teachers Choose AI Tutors</h2>
            <p className="text-xl text-gray-600">Powerful features designed for educators</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border">
              <Brain className="h-12 w-12 mx-auto mb-4 text-brandPurple" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">AI-Powered</h3>
              <p className="text-gray-600">Smart tutors that understand each student's unique learning needs</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border">
              <Users className="h-12 w-12 mx-auto mb-4 text-brandPurple" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Personalized</h3>
              <p className="text-gray-600">Tailored learning paths that adapt to every student's pace</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-brandPurple" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Easy Setup</h3>
              <p className="text-gray-600">Create your first AI tutor in just seconds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white rounded-lg p-8 shadow-sm border">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />)}
            </div>
            <blockquote className="text-xl text-gray-700 italic mb-4">
              "AI Tutors transformed my classroom. My students are more engaged and receive personalized support exactly when and where they need it."
            </blockquote>
            <cite className="text-gray-600 font-medium">— Sarah Johnson, 5th Grade Teacher</cite>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-brandPurple" />
                <span className="font-bold text-gray-900">AI Tutors</span>
              </div>
              <p className="text-gray-600 text-sm">
                Empowering educators with AI-powered tutoring solutions for personalized student learning.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-brandPurple transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-brandPurple transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-brandPurple transition-colors">Case Studies</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-brandPurple transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-brandPurple transition-colors">Documentation</a></li>
                <li>
                  <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                    <DialogTrigger asChild>
                      <button className="hover:text-brandPurple transition-colors text-left">
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
              <h4 className="font-semibold mb-4 text-gray-900">Contact</h4>
              <div className="space-y-2 text-sm text-gray-600">
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
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 AI Tutors. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Landing;