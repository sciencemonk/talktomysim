import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [showBetaRequest, setShowBetaRequest] = useState(false);
  const [betaCode, setBetaCode] = useState('');

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const generateBetaCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handlePostToX = () => {
    const tweetText = `SIMAI ${betaCode} Request Early Access`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleAuthCallback = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error('Authentication failed');
        navigate('/');
        return;
      }

      if (!session) {
        console.log('No session found');
        navigate('/');
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
        // Sign them out
        await supabase.auth.signOut();
        // Generate beta code and show beta request UI
        setBetaCode(generateBetaCode());
        setShowBetaRequest(true);
        return;
      }

      // Authorized user - redirect directly to chat interface
      console.log('Authorized user logged in, redirecting to chat');
      toast.success('Welcome back!');
      
      // Close the popup window if this is running in a popup
      if (window.opener) {
        window.close();
      } else {
        // If not in popup, navigate to home
        navigate('/');
      }
    } catch (error: any) {
      console.error('Auth callback error:', error);
      toast.error('Authentication failed: ' + (error.message || 'Unknown error'));
      navigate('/');
    }
  };

  return (
    <>
      {!showBetaRequest && (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      <Dialog open={showBetaRequest} onOpenChange={() => {
        if (window.opener) {
          window.close();
        } else {
          navigate('/');
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Private Beta</DialogTitle>
            <DialogDescription>
              Post this on X to join the private beta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg font-mono text-sm">
              SIMAI {betaCode} Request Early Access
            </div>
            <Button onClick={handlePostToX} className="w-full" size="lg">
              Post on X
            </Button>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => {
              if (window.opener) {
                window.close();
              } else {
                navigate('/');
              }
            }}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
