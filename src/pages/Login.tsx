import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const handleSolanaSignIn = async () => {
    setIsLoading(true);
    try {
      const solana = (window as any).solana;
      
      if (!solana) {
        toast.error('Please install Phantom wallet');
        setIsLoading(false);
        return;
      }

      // Connect to wallet
      const response = await solana.connect();
      const publicKey = response.publicKey.toString();

      // Create message to sign
      const message = `Sign in to Sim\n\nWallet: ${publicKey}\nTimestamp: ${new Date().toISOString()}`;
      const encodedMessage = new TextEncoder().encode(message);
      
      // Request signature
      const signedMessage = await solana.signMessage(encodedMessage, 'utf8');
      const signature = btoa(String.fromCharCode(...signedMessage.signature));

      // Authenticate with backend
      const { data, error } = await supabase.functions.invoke('solana-auth', {
        body: { 
          publicKey,
          signature,
          message 
        }
      });

      if (error) throw error;
      
      if (data?.session) {
        // Set the session
        await supabase.auth.setSession({
          access_token: data.session.properties.access_token,
          refresh_token: data.session.properties.refresh_token,
        });
        
        toast.success('Connected successfully!');
        navigate('/app');
      }
    } catch (error: any) {
      console.error('Error signing in with Solana:', error);
      toast.error(error?.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSignIn = async () => {
    setIsTestLoading(true);
    try {
      const testEmail = `testuser${Date.now()}@gmail.com`;
      const testPassword = 'testpassword123';
      
      console.log('Creating test account:', testEmail);
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
          data: {
            full_name: 'Test User'
          }
        }
      });

      if (signUpError) {
        console.error('Error creating test account:', signUpError);
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });
        
        if (signInError) {
          console.error('Error signing in with test account:', signInError);
          toast.error('Failed to create test account');
          return;
        }
        
        console.log('Signed in with existing test account:', signInData);
        if (signInData.user) {
          navigate('/app');
        }
        return;
      }

      console.log('Test account created successfully:', signUpData);
      
      if (signUpData.user) {
        navigate('/app');
      }
    } catch (error) {
      console.error('Error with test sign in:', error);
      toast.error('Failed to create test account');
    } finally {
      setIsTestLoading(false);
    }
  };


  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome to Sim</CardTitle>
          <CardDescription>
            Talk with a Sim
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSolanaSignIn}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90 animate-pulse"
            size="lg"
          >
            {isLoading ? 'Connecting...' : 'Connect Solana Wallet'}
          </Button>
          
          <Button
            onClick={handleTestSignIn}
            disabled={isTestLoading}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {isTestLoading ? 'Creating test account...' : 'Test Sign In (Preview Only)'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
