import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Edit, Eye, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userSim, setUserSim] = useState<UserSim | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background">
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-primary to-primary/80">
              <img 
                src="/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png" 
                alt="Logo" 
                className="h-7 w-7"
              />
            </div>
            <h1 className="text-xl font-semibold">My Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
            >
              Browse Sims
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">My Sim</h2>
              <p className="text-muted-foreground">
                Create and manage your personalized AI sim
              </p>
            </div>

            {/* Sim Card or Create Prompt */}
            {userSim ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={userSim.avatar_url} alt={userSim.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xl">
                          {userSim.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl">{userSim.name}</CardTitle>
                        {userSim.title && (
                          <CardDescription className="text-base mt-1">
                            {userSim.title}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/sim-create?id=${userSim.id}`)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => window.open(`/sim/${userSim.custom_url}`, '_blank')}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userSim.description && (
                    <p className="text-muted-foreground">{userSim.description}</p>
                  )}
                  
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Shareable Link</h4>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <code className="text-sm break-all">
                        {window.location.origin}/sim/{userSim.custom_url}
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Share this link with anyone to let them chat with your sim
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Create Your First Sim</CardTitle>
                  <CardDescription>
                    Build a personalized AI that others can chat with via a shareable link
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/sim-create')}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Sim
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
