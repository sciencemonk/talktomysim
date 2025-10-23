
import { useAuth } from "@/hooks/useAuth";
import { useAdvisors } from "@/hooks/useAdvisors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Bot } from "lucide-react";
import { useState } from "react";
import AdvisorForm from "@/components/AdvisorForm";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deleteAdvisor } from "@/services/advisorService";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export interface Advisor {
  id: string;
  name: string;
  title?: string;
  description?: string;
  prompt: string;
  avatar_url?: string;
  category?: string;
  background_content?: string;
  knowledge_summary?: string;
  crypto_wallet?: string;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const { user } = useAuth();
  const { advisors, isLoading, error, refetch } = useAdvisors();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  // Check if user is logged in
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Sign In</CardTitle>
            <CardDescription>Enter your email and password to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSigningIn}>
                {isSigningIn ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }


  const handleCreateAdvisor = () => {
    setEditingAdvisor(null);
    setIsFormOpen(true);
  };

  const handleEditAdvisor = (advisor: Advisor) => {
    setEditingAdvisor(advisor);
    setIsFormOpen(true);
  };

  const handleDeleteAdvisor = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteAdvisor(id);
      await refetch();
      toast({
        title: "Success",
        description: "Sim deleted successfully"
      });
    } catch (error) {
      console.error('Failed to delete sim:', error);
      toast({
        title: "Error",
        description: "Failed to delete sim"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingAdvisor(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error loading sims</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Admin - Manage Sims</h1>
            <p className="text-muted-foreground">
              Create and manage global sims that all users can interact with
            </p>
          </div>
          <Button onClick={handleCreateAdvisor}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sim
          </Button>
        </div>

        {advisors && advisors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {advisors.map((advisor) => (
              <Card key={advisor.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {advisor.avatar_url ? (
                      <img src={advisor.avatar_url} alt={advisor.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <Bot className="h-5 w-5 text-primary" />
                    )}
                    {advisor.name}
                  </CardTitle>
                  {advisor.title && (
                    <CardDescription>{advisor.title}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {advisor.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {advisor.description}
                    </p>
                  )}
                  {advisor.category && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Category: {advisor.category}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditAdvisor(advisor)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          disabled={deletingId === advisor.id}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Sim</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{advisor.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAdvisor(advisor.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No sims yet</h2>
            <p className="text-muted-foreground mb-4">
              Create your first sim to get started.
            </p>
            <Button onClick={handleCreateAdvisor}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Sim
            </Button>
          </div>
        )}

        {/* Advisor Form Modal */}
        <AdvisorForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          advisor={editingAdvisor}
          onSuccess={handleFormSuccess}
        />
      </div>
    </div>
  );
};

export default Admin;
