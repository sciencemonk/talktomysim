import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Share2, ExternalLink, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";
import UserSimForm from "@/components/UserSimForm";

interface UserSim {
  id: string;
  name: string;
  title: string;
  description: string;
  custom_url: string;
  avatar_url: string;
  created_at: string;
}

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userSim, setUserSim] = useState<UserSim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSimForm, setShowSimForm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      fetchUserSim();
    }
  }, [user]);

  const fetchUserSim = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('advisors')
        .select('id, name, title, description, custom_url, avatar_url, created_at')
        .eq('user_id', user?.id)
        .eq('sim_type', 'living')
        .maybeSingle();

      if (error) throw error;
      
      setUserSim(data);
      
      // If no sim exists, show the form automatically
      if (!data) {
        setShowSimForm(true);
      }
    } catch (error) {
      console.error('Error fetching user sim:', error);
      toast({
        title: "Error",
        description: "Failed to load your sim",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareLink = () => {
    if (!userSim?.custom_url) return;
    
    const shareUrl = `${window.location.origin}/sim/${userSim.custom_url}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard"
    });
  };

  const handleSimCreated = () => {
    setShowSimForm(false);
    fetchUserSim();
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-blue-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-blue-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/30">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Sign in to create your sim</h1>
            <p className="text-muted-foreground mb-6">Create a personalized AI sim that others can chat with</p>
          </div>
        </div>
        <AuthModal 
          open={showAuthModal} 
          onOpenChange={(open) => {
            setShowAuthModal(open);
            if (!open) navigate('/');
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/30">
      {/* Header */}
      <header className="border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
              <img 
                src="/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png" 
                alt="Sim" 
                className="h-7 w-7"
              />
            </div>
            <h1 className="text-xl font-semibold">My Sim</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {userSim ? (
            <Card className="p-8">
              <div className="flex items-start gap-6 mb-8">
                {userSim.avatar_url ? (
                  <img 
                    src={userSim.avatar_url} 
                    alt={userSim.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-neutral-200 dark:border-neutral-700"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                    {userSim.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{userSim.name}</h2>
                  {userSim.title && (
                    <p className="text-lg text-muted-foreground mb-4">{userSim.title}</p>
                  )}
                  {userSim.description && (
                    <p className="text-neutral-600 dark:text-neutral-400">{userSim.description}</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share Your Sim
                </h3>
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 flex items-center justify-between gap-4">
                  <code className="text-sm flex-1 overflow-x-auto">
                    {window.location.origin}/sim/{userSim.custom_url}
                  </code>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyShareLink}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => window.open(`/sim/${userSim.custom_url}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Share this link with anyone to let them chat with your sim
                </p>
              </div>

              <div className="mt-6">
                <Button variant="outline" onClick={() => setShowSimForm(true)}>
                  Edit Sim
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      </main>

      {/* Sim Creation/Edit Form */}
      <UserSimForm
        open={showSimForm}
        onOpenChange={setShowSimForm}
        existingSim={userSim}
        onSuccess={handleSimCreated}
      />
    </div>
  );
};

export default UserDashboard;
