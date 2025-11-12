import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { X, Lock } from 'lucide-react';
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
      const userData = { 
        address: evmAddress,
        coinbaseAuth: true,
        signedInAt: new Date().toISOString()
      };
      updateUser(userData);
      
      toast.success('Successfully signed in!');
      onOpenChange(false);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    }
  }, [isSignedIn, evmAddress, navigate, updateUser, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-background border-border">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none z-50"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="p-8 pt-12">
          <div className="text-center mb-6">
            <DialogTitle className="text-2xl font-semibold text-foreground mb-2">
              {isSignedIn ? 'Welcome!' : 'Sign in'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {isSignedIn 
                ? 'You are now signed in. Redirecting...'
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
