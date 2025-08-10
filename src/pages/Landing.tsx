import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, BookOpen, Brain, Star, Mail, Phone, MapPin, CheckCircle, Shield, Award } from "lucide-react";
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
  return <div className="min-h-screen bg-white">
      {/* Hero Section - Professional Facebook-inspired */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Brand and messaging */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
                  <div className="p-2 bg-brandPurple/10 rounded-xl">
                    <GraduationCap className="h-10 w-10 text-brandPurple" />
                  </div>
                  <span className="text-4xl font-bold text-gray-900">AI Tutors</span>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                  Create personalized AI tutors for your students in seconds.
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                  Trusted by thousands of educators worldwide to provide personalized learning experiences that help every student succeed.
                </p>
                
                <div className="flex justify-center lg:justify-start">
                  <Button onClick={handleGoogleSignIn} size="lg" className="h-14 text-lg font-semibold bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 px-8 shadow-sm">
                    <img src="/lovable-uploads/36c4909a-6779-43ae-a435-5a07fbd668be.png" alt="Google" className="w-6 h-6 mr-3" />
                    Get Started with Google
                  </Button>
                </div>
                
                {/* Trust indicators */}
                <div className="flex items-center justify-center lg:justify-start gap-6 mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Free to start
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-blue-500" />
                    COPPA compliant
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="h-4 w-4 text-purple-500" />
                    Educator approved
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Hero image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-brandPurple/20 to-brandBlue/20 rounded-2xl transform rotate-3"></div>
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                  <img src="/lovable-uploads/7d1d3b70-79f1-44e0-9bbe-9bf6ebab31a5.png" alt="Students working together on computers" className="w-full h-auto max-w-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social proof section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-600 mb-8 font-medium">Trusted by teachers from leading school districts</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="bg-white rounded-lg p-6 shadow-sm flex items-center justify-center h-20">
              <img src="/lovable-uploads/3f54fe2a-24b7-434e-b847-d2eb033add7d.png" alt="Miami-Dade County Public Schools" className="max-h-12 max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" />
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm flex items-center justify-center h-20">
              <img src="/lovable-uploads/31a26b17-27fc-463a-9eb2-a5e764de804e.png" alt="Houston Independent School District" className="max-h-12 max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" />
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm flex items-center justify-center h-20">
              <img src="/lovable-uploads/48ab9ee7-6838-4523-8428-b278f5a9ed4d.png" alt="Chicago Public Schools" className="max-h-12 max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" />
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm flex items-center justify-center h-20">
              <img src="/lovable-uploads/5c350f58-f5e5-4644-bb6f-2e03f06bacda.png" alt="Dallas Independent School District" className="max-h-12 max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Enhanced */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Teachers Choose AI Tutors
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed specifically for educators who want to provide personalized learning experiences at scale
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 bg-brandPurple/10 rounded-xl flex items-center justify-center">
                <Brain className="h-8 w-8 text-brandPurple" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">AI-Powered Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced AI that understands each student's unique learning style, pace, and needs to provide truly personalized education.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 bg-brandBlue/10 rounded-xl flex items-center justify-center">
                <Users className="h-8 w-8 text-brandBlue" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Personalized Approach</h3>
              <p className="text-gray-600 leading-relaxed">
                Tailored learning paths that adapt in real-time to help every student succeed, regardless of their starting point.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 bg-brandPink/10 rounded-xl flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-brandPink" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Easy Setup</h3>
              <p className="text-gray-600 leading-relaxed">
                Get started in minutes with our intuitive interface. No technical expertise required - just focus on teaching.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Testimonial */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />)}
            </div>
            <blockquote className="text-2xl text-gray-700 font-medium mb-8 leading-relaxed">
              "AI Tutors transformed my classroom. My students are more engaged and receive personalized support exactly when and where they need it. It's like having a teaching assistant for every student."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="text-left">
                <cite className="text-gray-900 font-semibold block">Sarah Johnson</cite>
                <p className="text-gray-600 text-sm">5th Grade Teacher, Lincoln Elementary</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brandPurple/20 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-brandPurple" />
                </div>
                <span className="font-bold text-xl">AI Tutors</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering educators with AI-powered tutoring solutions for personalized student learning. Join thousands of teachers already transforming their classrooms.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-800 rounded"></div>
                <div className="w-8 h-8 bg-gray-800 rounded"></div>
                <div className="w-8 h-8 bg-gray-800 rounded"></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6">Support</h4>
              <ul className="space-y-3 text-gray-400">
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
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2025 AI Tutors. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@aitutors.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>1-800-AI-TUTOR</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Landing;