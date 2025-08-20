
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app`
        }
      });
      
      if (error) {
        console.error('Error signing in with Google:', error);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSignIn = async () => {
    setIsTestLoading(true);
    try {
      // Use a more realistic email domain that Supabase will accept
      const testEmail = `testuser${Date.now()}@gmail.com`;
      const testPassword = 'testpassword123';
      
      console.log('Creating test account:', testEmail);
      
      // Try to sign up the test user
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
        // If signup fails, try to sign in with existing credentials
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });
        
        if (signInError) {
          console.error('Error signing in with test account:', signInError);
          return;
        }
        
        console.log('Signed in with existing test account:', signInData);
        if (signInData.user) {
          navigate('/app');
        }
        return;
      }

      console.log('Test account created successfully:', signUpData);
      
      // If signup was successful, navigate to app
      if (signUpData.user) {
        navigate('/app');
      }
    } catch (error) {
      console.error('Error with test sign in:', error);
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
          <CardTitle>Welcome to Think With Me</CardTitle>
          <CardDescription>
            Sign in to create and manage your AI tutors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Signing in...' : 'Continue with Google'}
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
