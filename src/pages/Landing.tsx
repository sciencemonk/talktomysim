
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-brandPurple to-brandBlue flex flex-col items-center justify-center px-6">
      {/* Main Content */}
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-12">
          WE HELP<br />
          TEACHERS<br />
          CREATE AN<br />
          ARMY OF<br />
          PERSONALIZED<br />
          TUTORS.
        </h1>
        
        <div className="mb-16">
          <Button 
            onClick={handleGoogleSignIn}
            size="lg" 
            className="h-16 px-12 text-lg font-semibold bg-black hover:bg-gray-800 text-white rounded-full"
          >
            <img src="/lovable-uploads/36c4909a-6779-43ae-a435-5a07fbd668be.png" alt="Google" className="w-6 h-6 mr-3" />
            GET STARTED WITH GOOGLE
          </Button>
        </div>

        <div className="space-y-6">
          <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
            <DialogTrigger asChild>
              <button className="text-white/80 hover:text-white text-lg font-medium transition-colors">
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
