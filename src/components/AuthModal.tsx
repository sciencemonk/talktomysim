
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import bs58 from 'bs58';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
}

const AuthModal = ({ open, onOpenChange, defaultMode = 'signup' }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSolanaSignIn = async () => {
    setIsLoading(true);
    try {
      // Check for Phantom or Solflare
      const phantom = (window as any).solana;
      const solflare = (window as any).solflare;
      
      // Prefer Phantom if both are installed, otherwise use whichever is available
      const wallet = phantom?.isPhantom ? phantom : solflare;
      
      if (!wallet) {
        toast.error('Please install Phantom or Solflare wallet');
        setIsLoading(false);
        return;
      }

      // Connect to wallet
      const response = await wallet.connect();
      const publicKey = response.publicKey.toString();

      // Create message to sign
      const message = `Sign in to Sim\n\nWallet: ${publicKey}\nTimestamp: ${new Date().toISOString()}`;
      const encodedMessage = new TextEncoder().encode(message);
      
      // Request signature
      const signedMessage = await wallet.signMessage(encodedMessage, 'utf8');
      const signature = bs58.encode(signedMessage.signature);

      // Authenticate with backend
      const { data, error } = await supabase.functions.invoke('solana-auth', {
        body: { 
          publicKey,
          signature,
          message 
        }
      });

      if (error) throw error;
      
      if (data?.access_token && data?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        
        toast.success('Connected successfully!');
        onOpenChange(false);
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error('Error signing in with Solana:', error);
      toast.error(error?.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <VisuallyHidden>
          <DialogTitle>Sign in with Solana Wallet</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/a5a8957b-48cb-40f5-9097-0ab747b74077.png" 
              alt="Think With Me" 
              className="w-8 h-8"
            />
          </div>

          <div className="w-full space-y-4">
            <Button
              onClick={handleSolanaSignIn}
              disabled={isLoading}
              className="w-full h-12 text-base bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              {isLoading ? 'Connecting...' : 'Connect Solana Wallet'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center px-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
