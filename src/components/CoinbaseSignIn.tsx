import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { useIsSignedIn, useEvmAddress, useCurrentUser } from '@coinbase/cdp-hooks';
import { useAuth } from '@/hooks/useAuth';
import { userProfileService } from '@/services/userProfileService';

export const CoinbaseSignIn = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const { currentUser } = useCurrentUser();
  const { updateUser } = useAuth();

  useEffect(() => {
    const handleSignIn = async () => {
      if (isSignedIn && evmAddress && currentUser) {
        // Clear any explicit signout flag when actively signing in
        localStorage.removeItem('explicit_signout');
        try {
          // Clear any previous signout flag when user actively signs in
          localStorage.removeItem('explicit_signout');
          
          // Generate proper email format - don't use userId as email
          const email = `${evmAddress.slice(0, 8).toLowerCase()}@wallet.sim`;
          
          // Get or create profile first to get the proper user ID
          const profile = await userProfileService.upsertProfile(evmAddress, email);
          
          if (!profile) {
            toast.error('Failed to create user profile');
            return;
          }
          
          // Set user data with proper ID and email from profile
          const userData = { 
            id: profile.id,
            address: evmAddress,
            email: profile.email || email,
            coinbaseAuth: true,
            signedInAt: new Date().toISOString()
          };
          updateUser(userData);
          
          toast.success('Successfully signed in with Coinbase!');
          
          // Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } catch (error) {
          console.error('Sign in error:', error);
          toast.error('Sign in failed. Please try again.');
        }
      }
    };
    
    handleSignIn();
  }, [isSignedIn, evmAddress, currentUser, navigate, updateUser]);

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
              <div className="flex justify-center">
                <AuthButton onClick={() => localStorage.removeItem('explicit_signout')} />
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
