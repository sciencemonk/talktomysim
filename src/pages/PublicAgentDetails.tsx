
import React, { useState } from 'react';
import { AdvisorSearchModal } from '@/components/AdvisorSearchModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const PublicAgentDetails = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignInPrompt = () => {
    // Redirect to pricing/landing page for sign up
    navigate('/pricing');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Advisor Directory</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Chat with world-class advisors powered by AI
          </p>
          {!user && (
            <Button onClick={handleSignInPrompt} size="lg">
              Sign Up to Get Started
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
