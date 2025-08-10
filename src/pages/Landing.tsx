
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";

const Landing = () => {
  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth sign-in
    console.log("Google sign-in clicked");
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
          <div className="text-center max-w-2xl">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              Back to School Special
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Personalized AI Tutors for Your Students
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 font-medium">
              Create 3 for Free
            </p>
            
            <Button 
              onClick={handleGoogleSignIn}
              size="lg" 
              className="bg-white text-brandPurple hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
