import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { useIsSignedIn, useEvmAddress } from '@coinbase/cdp-hooks';
import { useAuth } from '@/hooks/useAuth';

export const CoinbaseSignIn = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const { updateUser } = useAuth();
  const authButtonRef = useRef<HTMLDivElement>(null);

  const handleGoogleSignIn = () => {
    // Trigger the hidden Coinbase AuthButton
    const button = authButtonRef.current?.querySelector('button');
    if (button) {
      button.click();
    }
  };

  useEffect(() => {
    if (isSignedIn && evmAddress) {
      // Get user data when signed in
      const userData = { 
        address: evmAddress,
        coinbaseAuth: true,
        signedInAt: new Date().toISOString()
      };
      updateUser(userData);
      
      toast.success('Successfully signed in with Coinbase!');
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  }, [isSignedIn, evmAddress, navigate, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {isSignedIn ? 'Welcome!' : 'Sign In'}
          </CardTitle>
          <CardDescription className="text-base">
            {isSignedIn 
              ? 'You are now signed in. Redirecting to your dashboard...'
              : 'Continue with Google or sign in with your email'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isSignedIn && (
            <>
              {/* Google branded button */}
              <Button
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm h-11 font-medium"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>

              {/* Hidden Coinbase AuthButton */}
              <div ref={authButtonRef} className="hidden">
                <AuthButton />
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Secure wallet creation via Coinbase
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Your wallet remains in your control
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    No complex setup required
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
