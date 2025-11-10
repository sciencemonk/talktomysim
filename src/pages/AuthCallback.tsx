import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error('Authentication failed');
        
        if (window.opener) {
          window.close();
        } else {
          navigate('/');
        }
        return;
      }

      if (!session) {
        console.log('No session found');
        if (window.opener) {
          window.close();
        } else {
          navigate('/');
        }
        return;
      }

      const user = session.user;
      const userMetadata = user.user_metadata;
      
      const username = userMetadata?.user_name || userMetadata?.preferred_username || userMetadata?.name;

      if (!username) {
        toast.error('Could not retrieve X username');
        if (window.opener) {
          window.close();
        } else {
          navigate('/');
        }
        return;
      }

      console.log('X Username:', username);

      // Check if user is authorized
      if (username.toLowerCase() !== 'mrjethroknights') {
        console.log('Unauthorized user attempted to sign in:', username);
        // Sign them out - the main page will handle showing the beta request
        await supabase.auth.signOut();
        
        if (window.opener) {
          window.close();
        } else {
          navigate('/');
        }
        return;
      }

      // Authorized user - close popup or redirect
      console.log('Authorized user logged in');
      toast.success('Welcome back!');
      
      if (window.opener) {
        window.close();
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Auth callback error:', error);
      toast.error('Authentication failed: ' + (error.message || 'Unknown error'));
      
      if (window.opener) {
        window.close();
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
