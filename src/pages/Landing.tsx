
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
        style={{
          backgroundImage: `url('/lovable-uploads/4e33dacc-efa6-49c9-9841-697fdf3c46ea.png')`
        }} 
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="flex items-center justify-center gap-2">
            <GraduationCap className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">AI Tutors</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-4xl">
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
