
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, Navigate } from "react-router-dom";
import { Bot, Search, User, Filter, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { usePublicAdvisors } from "@/hooks/usePublicAdvisors";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import AboutModal from "@/components/AboutModal";
import TermsModal from "@/components/TermsModal";
import PrivacyModal from "@/components/PrivacyModal";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { advisors, isLoading: advisorsLoading } = usePublicAdvisors();
  const { user, loading } = useAuth();
  
  // All useState hooks must be at the top level
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  // Simple logging for advisor count - MUST be before conditional returns
  useEffect(() => {
    if (advisors?.length) {
      console.log(`Landing page received ${advisors.length} advisors`);
    }
  }, [advisors]);
  
  // Redirect authenticated users to the app
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/app" replace />;
  }

  // Handle search functionality
  const filteredAdvisors = searchQuery.trim() === "" 
    ? advisors 
    : advisors.filter(advisor => 
        advisor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advisor.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advisor.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Could add additional search logic here
  };

  // We're using the AuthModal component for authentication

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center">
        <Button 
          onClick={() => setShowAboutModal(true)}
          variant="ghost" 
          size="sm"
          className="text-sm"
        >
          About
        </Button>
        
        <Button 
          onClick={() => setShowAuthModal(true)}
          variant="outline" 
          size="sm"
          className="text-sm"
        >
          Login
        </Button>
        
        <AuthModal 
          open={showAuthModal} 
          onOpenChange={(open) => setShowAuthModal(open)} 
        />
        
        <AboutModal
          isOpen={showAboutModal}
          onClose={() => setShowAboutModal(false)}
        />
      </header>

      {/* Main Section */}
      <main className="flex flex-col justify-center items-center min-h-[calc(100vh-120px)]">
        {/* Search Section */}
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-12">
              <img 
                src="/logo.svg" 
                alt="Sim" 
                className="h-24 w-24"
              />
            </div>
            
            {/* Title removed as requested */}
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="search"
                  placeholder="Find a Sim"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 text-lg rounded-full border border-gray-300 shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-200"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {searchQuery && (
                    <Button 
                      type="submit" 
                      size="icon" 
                      variant="ghost" 
                      className="rounded-full"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </form>
            
            {/* Create Your Own Link removed */}
          </div>
          {/* Directory content moved to main search section */}
          <div className="mt-16 mb-20 max-w-6xl mx-auto">
            {/* Removed Results Count */}
            
            {/* Sims Grid */}
            {advisorsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredAdvisors.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-neutral-600 mb-2">No Sims found</p>
                <p className="text-sm text-neutral-500">
                  Try searching for something else
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAdvisors.map((advisor) => (
                  <Card 
                    key={advisor.id} 
                    className="cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200"
                    onClick={() => window.open(`/${advisor.custom_url || advisor.url || advisor.id}`, '_blank')}
                  >
                    <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center">
                      <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                        <AvatarImage src={advisor.avatar_url} alt={advisor.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-medium">
                          {advisor.name ? advisor.name.charAt(0) : <User className="h-8 w-8" />}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                          {advisor.name}
                        </h3>
                        
                        {advisor.title && (
                          <p className="text-sm text-neutral-500">
                            {advisor.title}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <p className="text-xs text-neutral-500">
              © {new Date().getFullYear()} Sim. All rights reserved.
            </p>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowTermsModal(true)}
                className="text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                Terms of Service
              </button>
              
              <button 
                onClick={() => setShowPrivacyModal(true)}
                className="text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
        
        <TermsModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
        />
        
        <PrivacyModal
          isOpen={showPrivacyModal}
          onClose={() => setShowPrivacyModal(false)}
        />
      </footer>
    </div>
  );
};

export default Landing;
