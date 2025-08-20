
import React, { useState } from 'react';
import { AdvisorSearchModal } from '@/components/AdvisorSearchModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const PublicAgentDetails = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignInWithGoogle = async () => {
    try {
      setIsSigningIn(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        toast({
          title: "Sign In Failed",
          description: error.message || "There was an error signing in with Google. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error during Google sign in:', error);
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignInPrompt = () => {
    // Show Google sign in directly instead of redirecting
    handleSignInWithGoogle();
  };

  // If user is authenticated, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Advisor Directory</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Chat with world-class advisors powered by AI
          </p>
          {!user && (
            <Button 
              onClick={handleSignInWithGoogle}
              disabled={isSigningIn}
              size="lg"
              className="inline-flex items-center gap-2"
            >
              {isSigningIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <img 
                  src="/lovable-uploads/b0174e22-c5cc-4bc5-8b34-8df738173560.png" 
                  alt="Google" 
                  className="h-4 w-4"
                />
              )}
              {isSigningIn ? "Signing in..." : "Sign In with Google to Get Started"}
            </Button>
          )}
        </div>
        
        <AdvisorSearchModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen}
          onSignInRequired={handleSignInPrompt}
          isPublic={true}
        />
      </div>
    </div>
  );
};

export default PublicAgentDetails;
