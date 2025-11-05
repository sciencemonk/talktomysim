import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Twitter } from 'lucide-react';

const SignIn = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/directory');
    }
  }, [user, navigate]);

  const handleXSignIn = async () => {
    try {
      console.log('Starting X sign in...');
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }
      
      console.log('OAuth initiated successfully', data);
    } catch (error: any) {
      console.error('Error signing in with X:', error);
      toast.error(error?.message || 'Failed to sign in with X');
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Connect with X to create and manage your agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleXSignIn}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:opacity-90"
            size="lg"
          >
            <Twitter className="mr-2 h-5 w-5" />
            Sign In with X
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
