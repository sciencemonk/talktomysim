
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AdvisorDirectory from "@/components/AdvisorDirectory";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";

const Home = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSelectAdvisor = (advisorId: string) => {
    // This will be handled by the AdvisorDirectory component
    console.log("Advisor selected:", advisorId);
  };

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Header - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/a5a8957b-48cb-40f5-9097-0ab747b74077.png" 
            alt="Think With Me" 
            className="h-8 w-8"
          />
          <h1 className="font-bold text-xl">Think With Me</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Login Logo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAuthModal(true)}
            className="p-2"
          >
            <img 
              src="/lovable-uploads/bd1798e5-2033-45c5-a39b-4e8192a4b046.png" 
              alt="Login" 
              className="h-6 w-6 object-contain"
            />
          </Button>
        </div>
      </div>

      {/* Main content - full width with padding for fixed header */}
      <div className="flex-1 pt-16">
        <AdvisorDirectory
          onSelectAdvisor={handleSelectAdvisor}
          onAuthRequired={handleAuthRequired}
        />
      </div>
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
};

export default Home;
