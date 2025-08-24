
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import AdvisorDirectory from "@/components/AdvisorDirectory";

const Index = () => {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect authenticated users to the main app
  if (user) {
    return <Navigate to="/app" replace />;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Scroll to the directory section
    document.getElementById('directory-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Main Google-style homepage */}
      <div className="min-h-screen flex flex-col">
        {/* Header with Sign In */}
        <header className="p-6 flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => setShowAuthModal(true)}
          >
            Sign In
          </Button>
        </header>

        {/* Centered content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-20">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/lovable-uploads/55ccce33-98a1-45d2-9e9e-7b446a02a417.png" 
              alt="Think With Me" 
              className="h-20 w-20 mx-auto mb-4"
            />
            <h1 className="text-4xl font-light text-gray-900 text-center">Think With Me</h1>
          </div>

          {/* "Find a Sim" text */}
          <p className="text-lg text-gray-600 mb-8">Find a Sim</p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-md mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for a Sim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg border-2 border-gray-200 rounded-full hover:border-gray-300 focus:border-primary transition-colors"
              />
            </div>
          </form>

          {/* Create Sim link */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="text-sm text-gray-600 hover:text-primary hover:underline transition-colors"
          >
            Create your own Sim today for free
          </button>
        </div>

        {/* Scroll to Explore */}
        <div className="pb-8 text-center">
          <button
            onClick={() => document.getElementById('directory-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Scroll to Explore
          </button>
        </div>
      </div>

      {/* Directory Section */}
      <div id="directory-section" className="min-h-screen bg-white border-t border-gray-200">
        <div className="py-8">
          <h2 className="text-3xl font-bold text-center mb-8">Explore All Sims</h2>
          <AdvisorDirectory
            onSelectAdvisor={(advisorId, advisor) => {
              // Handle advisor selection - open in new tab
              const chatUrl = advisor?.custom_url ? `/${advisor.custom_url}` : `/tutors/${advisorId}/chat`;
              window.open(chatUrl, '_blank');
            }}
            showLoginInHeader={false}
          />
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
};

export default Index;
