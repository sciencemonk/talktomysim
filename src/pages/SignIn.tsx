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
      
      // Open OAuth in a popup window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          skipBrowserRedirect: false,
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }
      
      // Open the auth URL in a popup
      if (data.url) {
        const popup = window.open(
          data.url,
          'X Authentication',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        // Listen for the popup to close or for auth completion
        const checkPopup = setInterval(() => {
          if (popup && popup.closed) {
            clearInterval(checkPopup);
            // Refresh the page to check auth status
            window.location.reload();
          }
        }, 500);
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
