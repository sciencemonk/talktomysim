
import { useParams } from "react-router-dom";
import { usePublicAgent } from "@/hooks/usePublicAgent";
import { usePublicAgentByUrl } from "@/hooks/usePublicAgentByUrl";
import ChatInterface from "@/components/ChatInterface";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { Bot, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const StudentChat = () => {
  const { agentId, customUrl } = useParams<{ agentId?: string; customUrl?: string }>();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isMobile = useIsMobile();
  
  // Determine which hook to use based on the route parameters
  const publicAgentQuery = usePublicAgent(agentId || "");
  const publicAgentByUrlQuery = usePublicAgentByUrl(customUrl || "");
  
  // Use the appropriate query based on which parameter is present
  const query = agentId ? publicAgentQuery : publicAgentByUrlQuery;
  const { agent, isLoading, error } = query;

  // Redirect to custom URL if agent has one and we're using the old route
  useEffect(() => {
    if (agent && agent.url && agentId && !customUrl) {
      // Redirect to the custom URL route
      window.location.href = `/${agent.url}`;
    }
  }, [agent, agentId, customUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Chat Not Found</h2>
              <p className="text-sm text-muted-foreground mb-4">
                The chat you're looking for doesn't exist or is no longer available.
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBack = () => {
    window.location.href = '/';
  };

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const SidebarContent = () => (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
            alt="Logo" 
            className="h-8 w-8 object-contain"
          />
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="space-y-6 text-center">
          <div>
            <h2 className="text-xl font-semibold mb-2">Create your free Sim today</h2>
          </div>
          
          <Button 
            onClick={() => setShowAuthModal(true)}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90 animate-pulse rounded-lg py-3"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <SidebarContent />
      </div>
      
      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <div className="fixed top-4 left-4 z-50 md:hidden cursor-pointer">
              <img 
                src="/lovable-uploads/108a5580-39a3-45d5-a07e-672253a59f99.png" 
                alt="Menu" 
                className="h-6 w-6 object-contain"
              />
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Content - full height */}
        <div className="flex-1">
          <ChatInterface 
            agent={agent}
            onBack={handleBack}
          />
        </div>
      </div>
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
};

export default StudentChat;
