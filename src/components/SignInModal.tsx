import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X, Lock, Mail } from 'lucide-react';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { useIsSignedIn, useEvmAddress } from '@coinbase/cdp-hooks';
import { useAuth } from '@/hooks/useAuth';
import { userProfileService } from '@/services/userProfileService';
import simModalLogo from '@/assets/sim-modal-logo.gif';

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignInModal = ({ open, onOpenChange }: SignInModalProps) => {
  const navigate = useNavigate();
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const { updateUser } = useAuth();
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isSignedIn && evmAddress) {
      handleSignInComplete();
    }
  }, [isSignedIn, evmAddress]);

  const handleSignInComplete = async () => {
    if (!evmAddress) return;
    
    setIsProcessing(true);
    
    try {
      // Check if user already has a profile
      const existingProfile = await userProfileService.getProfileByWallet(evmAddress);
      
      if (existingProfile?.email) {
        // User has email, update and proceed
        const profile = await userProfileService.upsertProfile(evmAddress, existingProfile.email);
        
        if (profile) {
          updateUser({
            id: profile.id,
            email: profile.email,
            address: evmAddress,
            coinbaseAuth: true,
            signedInAt: new Date().toISOString()
          });
          
          toast.success('Successfully signed in!');
          onOpenChange(false);
          
          setTimeout(() => {
            navigate('/dashboard');
          }, 500);
        }
      } else {
        // User needs to provide email
        setShowEmailInput(true);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      toast.error('An error occurred during sign-in');
      setIsProcessing(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!evmAddress) {
      toast.error('Wallet address not available');
      return;
    }

    setIsProcessing(true);

    try {
      const profile = await userProfileService.upsertProfile(evmAddress, email.trim());
      
      if (profile) {
        updateUser({
          id: profile.id,
          email: profile.email,
          address: evmAddress,
          coinbaseAuth: true,
          signedInAt: new Date().toISOString()
        });
        
        toast.success('Profile created successfully!');
        onOpenChange(false);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        toast.error('Failed to create profile');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-background border-border overflow-visible">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none z-50"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="p-8 pt-12 relative z-10">
          {showEmailInput ? (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <DialogTitle className="text-2xl font-semibold text-foreground mb-2">
                  Complete Your Profile
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Please provide your email address to complete your account setup
                </DialogDescription>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEmailSubmit();
                    }
                  }}
                  className="h-12 text-base"
                  disabled={isProcessing}
                  autoFocus
                />
              </div>

              <Button
                onClick={handleEmailSubmit}
                disabled={isProcessing || !email.trim()}
                className="w-full h-12 text-base font-medium bg-[#0052FF] hover:bg-[#0047E0] text-white"
              >
                {isProcessing ? 'Creating Profile...' : 'Continue'}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
                <Lock className="h-4 w-4" />
                <span>Secured by <span className="font-semibold">coinbase</span></span>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <img src={simModalLogo} alt="SIM" className="h-16 w-auto" />
                </div>
                <DialogTitle className="text-2xl font-semibold text-foreground mb-2">
                  {isSignedIn ? 'Welcome!' : 'Sign in'}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {isSignedIn 
                    ? isProcessing ? 'Setting up your account...' : 'You are now signed in. Redirecting...'
                    : 'Sign in with your email using Coinbase'
                  }
                </DialogDescription>
              </div>

              {!isSignedIn && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <AuthButton />
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
                    <Lock className="h-4 w-4" />
                    <span>Secured by <span className="font-semibold">coinbase</span></span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
