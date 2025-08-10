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
  return <div className="min-h-screen">
      {/* Hero Section */}
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Image - now contains the entire image */}
        <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{
        backgroundImage: `url('/lovable-uploads/f3a6789c-4ba5-4075-9d4f-b27c183eeadd.png')`
      }} />
        
        {/* Lighter overlay for better readability */}
        <div className="absolute inset-0 bg-black/20" />
        
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

              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">Empower your students with AI-powered tutors that help every student succeed.</p>
              
              <Button onClick={handleGoogleSignIn} size="lg" className="bg-white text-brandPurple hover:bg-gray-100 px-8 py-4 text-lg font-semibold mb-12">
                <img src="/lovable-uploads/36c4909a-6779-43ae-a435-5a07fbd668be.png" alt="Google" className="w-5 h-5 mr-3" />
                Sign Up with Google
              </Button>

              {/* Features Grid - now with light backgrounds */}
              

              {/* Testimonial - now with light background */}
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-2xl mx-auto shadow-sm">
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />)}
                </div>
                <p className="text-gray-700 italic mb-2">
                  "AI Tutors transformed my classroom. My students are more engaged and receive personalized support when and where they need it."
                </p>
                <p className="text-gray-600 text-sm">— Sarah Johnson, 5th Grade Teacher</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Section - clean white background */}
      

      {/* Pricing Section - light gray background for contrast */}
      

      {/* Contact Section - clean white background */}
      

      {/* Footer - professional design */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6" />
                <span className="font-bold">AI Tutors</span>
              </div>
              <p className="text-gray-300 text-sm">
                Empowering educators with AI-powered tutoring solutions for personalized student learning.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li>
                  <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                    <DialogTrigger asChild>
                      <button className="hover:text-white transition-colors text-left text-sm">
                        School Partnerships
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>School Partnership Inquiry</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="footer-name">Name</Label>
                          <Input id="footer-name" placeholder="Your full name" required />
                        </div>
                        <div>
                          <Label htmlFor="footer-email">Email</Label>
                          <Input id="footer-email" type="email" placeholder="your.email@school.edu" required />
                        </div>
                        <div>
                          <Label htmlFor="footer-school">School/District</Label>
                          <Input id="footer-school" placeholder="School or district name" required />
                        </div>
                        <div>
                          <Label htmlFor="footer-students">Number of Students</Label>
                          <Input id="footer-students" type="number" placeholder="Estimated student count" />
                        </div>
                        <div>
                          <Label htmlFor="footer-message">Message</Label>
                          <Textarea id="footer-message" placeholder="Tell us about your partnership needs..." rows={4} />
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
              <div className="space-y-2 text-sm text-gray-300">
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
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 AI Tutors. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Landing;