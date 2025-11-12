import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { useIsSignedIn, useEvmAddress } from '@coinbase/cdp-hooks';
import { useAuth } from '@/hooks/useAuth';

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignInModal = ({ open, onOpenChange }: SignInModalProps) => {
  const navigate = useNavigate();
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const { updateUser } = useAuth();

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
      
      // Close modal and redirect to dashboard
      onOpenChange(false);
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    }
  }, [isSignedIn, evmAddress, navigate, updateUser, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">
            {isSignedIn ? 'Welcome!' : 'Sign In'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isSignedIn 
              ? 'You are now signed in. Redirecting to your dashboard...'
              : 'Sign in with your email using Coinbase Wallet'
            }
          </DialogDescription>
        </DialogHeader>
        
        {!isSignedIn && (
          <div className="space-y-6">
            <div className="flex justify-center">
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
