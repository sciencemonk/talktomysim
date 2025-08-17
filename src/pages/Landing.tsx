import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Landing = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    // Bypass authentication for testing - go directly to dashboard
    navigate('/agents');
  };

  const handleLogIn = () => {
    // Navigate directly to dashboard for testing
    navigate('/agents');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    console.log("Contact form submitted");
    setIsContactOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6" style={{
      backgroundColor: '#cfff3e'
    }}>
      {/* Main Content */}
      <div className="text-center max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl text-black leading-tight mb-8 sm:mb-12 lg:mb-16 px-2 text-center font-bold">
          CREATE PERSONALIZED TUTORS FOR YOUR STUDENTS IN SECONDS.
        </h1>
        
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <Button 
            onClick={handleGoogleSignIn} 
            disabled={isLoading}
            size="lg" 
            className="h-12 sm:h-14 lg:h-16 px-8 sm:px-10 lg:px-12 text-base sm:text-lg font-semibold bg-white hover:bg-gray-100 text-black rounded-full border border-gray-200"
          >
            <img src="/lovable-uploads/36c4909a-6779-43ae-a435-5a07fbd668be.png" alt="Google" className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            {isLoading ? "Signing in..." : "Start Free with Google"}
          </Button>
        </div>

        <div className="mb-8 sm:mb-12 lg:mb-16">
          <button 
            onClick={handleLogIn} 
            disabled={isLoading}
            className="text-black/70 hover:text-black text-sm sm:text-base font-medium transition-colors"
          >
            Already have an account? Log In
          </button>
        </div>

        <div className="space-y-6">
          <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
            <DialogTrigger asChild>
              <button className="text-black/80 hover:text-black text-base sm:text-lg font-medium transition-colors">
                Partnerships
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Partnership Inquiry</DialogTitle>
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
    </div>
  );
};

export default Landing;
