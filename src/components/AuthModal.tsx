
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import bs58 from 'bs58';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import phantomIcon from '@/assets/phantom-icon.png';
import solflareIcon from '@/assets/solflare-icon.png';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
}

const AuthModal = ({ open, onOpenChange, defaultMode = 'signup' }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleWalletSignIn = async (walletType: 'phantom' | 'solflare') => {
    setIsLoading(walletType);
    try {
      let wallet;
      
      if (walletType === 'phantom') {
        wallet = (window as any).solana;
        if (!wallet?.isPhantom) {
          toast.error('Please install Phantom wallet');
          setIsLoading(null);
          return;
        }
      } else {
        wallet = (window as any).solflare;
        if (!wallet) {
          toast.error('Please install Solflare wallet');
          setIsLoading(null);
          return;
        }
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
      setIsLoading(null);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <VisuallyHidden>
          <DialogTitle>Sign in with Phantom or Solflare</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/a5a8957b-48cb-40f5-9097-0ab747b74077.png" 
              alt="Think With Me" 
              className="w-8 h-8"
            />
          </div>

          <div className="w-full space-y-3">
            <Button
              onClick={() => handleWalletSignIn('phantom')}
              disabled={!!isLoading}
              className="w-full h-12 text-base bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
              size="lg"
            >
              <img src={phantomIcon} alt="Phantom" className="w-6 h-6" />
              {isLoading === 'phantom' ? 'Connecting...' : 'Connect Phantom'}
            </Button>
            
            <Button
              onClick={() => handleWalletSignIn('solflare')}
              disabled={!!isLoading}
              className="w-full h-12 text-base bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
              size="lg"
            >
              <img src={solflareIcon} alt="Solflare" className="w-6 h-6" />
              {isLoading === 'solflare' ? 'Connecting...' : 'Connect Solflare'}
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
