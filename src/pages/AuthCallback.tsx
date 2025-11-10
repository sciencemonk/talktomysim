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
      console.log('[AuthCallback] Starting auth callback...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[AuthCallback] Session error:', sessionError);
        toast.error('Authentication failed');
        
        if (window.opener) {
          window.close();
        } else {
          navigate('/');
        }
        return;
      }

      if (!session) {
        console.log('[AuthCallback] No session found');
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
      console.log('[AuthCallback] X Username:', username);

      if (!username) {
        console.error('[AuthCallback] Could not retrieve X username');
        toast.error('Could not retrieve X username');
        if (window.opener) {
          window.close();
        } else {
          navigate('/');
        }
        return;
      }

      // Check if user is authorized
      if (username.toLowerCase() !== 'mrjethroknights') {
        console.log('[AuthCallback] Unauthorized user:', username);
        
        // Signal to parent window that user is unauthorized
        if (window.opener) {
          console.log('[AuthCallback] Sending unauthorized message to parent');
          window.opener.postMessage({ type: 'AUTH_STATUS', status: 'unauthorized' }, window.location.origin);
        }
        
        // Sign them out
        console.log('[AuthCallback] Signing out unauthorized user');
        await supabase.auth.signOut();
        
        // Wait a moment to ensure message is sent
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (window.opener) {
          console.log('[AuthCallback] Closing popup window');
          window.close();
        } else {
          navigate('/');
        }
        return;
      }

      // Authorized user - signal success and close popup
      console.log('[AuthCallback] Authorized user logged in');
      
      if (window.opener) {
        console.log('[AuthCallback] Sending authorized message to parent');
        window.opener.postMessage({ type: 'AUTH_STATUS', status: 'authorized' }, window.location.origin);
        toast.success('Welcome back!');
        
        // Wait a moment to ensure message is sent
        await new Promise(resolve => setTimeout(resolve, 100));
        window.close();
      } else {
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (error: any) {
      console.error('[AuthCallback] Auth callback error:', error);
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
