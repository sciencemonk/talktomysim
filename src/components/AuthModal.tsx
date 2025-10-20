
import { useState, useEffect } from 'react';
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

  // Check if returning from mobile wallet app
  useEffect(() => {
    const attemptingWallet = sessionStorage.getItem('attempting_wallet_connection');
    if (attemptingWallet && open) {
      const walletType = attemptingWallet as 'phantom' | 'solflare';
      sessionStorage.removeItem('attempting_wallet_connection');
      
      // Give the wallet app time to inject its provider
      setTimeout(() => {
        attemptWalletConnection(walletType);
      }, 500);
    }
  }, [open]);

  const attemptWalletConnection = async (walletType: 'phantom' | 'solflare') => {
    setIsLoading(walletType);
    try {
      const wallet = walletType === 'phantom' 
        ? (window as any).solana 
        : (window as any).solflare;

      if (!wallet) {
        toast.error(`${walletType === 'phantom' ? 'Phantom' : 'Solflare'} wallet not detected. Please make sure the app is installed.`);
        setIsLoading(null);
        return;
      }

      // Connect to wallet
      await wallet.connect();
      
      const publicKey = wallet.publicKey.toString();
      const message = `Sign in to Sim\n\nWallet: ${publicKey}\nTimestamp: ${new Date().toISOString()}`;
      const encodedMessage = new TextEncoder().encode(message);
      
      const signedMessage = await wallet.signMessage(encodedMessage, 'utf8');
      const signature = bs58.encode(signedMessage.signature);

      const { data, error } = await supabase.functions.invoke('solana-auth', {
        body: { publicKey, signature, message }
      });

      if (error) throw error;
      
      if (data?.access_token && data?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        
        toast.success('Connected successfully!');
        onOpenChange(false);
        window.location.href = '/directory';
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error?.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(null);
    }
  };

  const handleWalletSignIn = async (walletType: 'phantom' | 'solflare') => {
    setIsLoading(walletType);
    try {
      // Check if on mobile with more comprehensive detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                       (window.innerWidth <= 768);
      
      let wallet;
      
      if (walletType === 'phantom') {
        wallet = (window as any).solana;
        
        // If on mobile, use deep link to open wallet app
        if (isMobile && !wallet?.isPhantom) {
          sessionStorage.setItem('attempting_wallet_connection', walletType);
          const currentUrl = window.location.href.split('?')[0]; // Remove any existing query params
          const deepLink = `https://phantom.app/ul/browse/${encodeURIComponent(currentUrl)}?ref=${encodeURIComponent(window.location.origin)}`;
          toast.info('Opening Phantom app...', {
            description: 'Approve the connection and return to this page'
          });
          window.location.href = deepLink;
          setIsLoading(null);
          return;
        }
        
        if (!wallet?.isPhantom) {
          toast.error('Please install Phantom wallet', {
            description: 'Visit phantom.app to install'
          });
          setIsLoading(null);
          return;
        }
      } else {
        wallet = (window as any).solflare;
        
        // If on mobile, use deep link to open wallet app
        if (isMobile && !wallet) {
          sessionStorage.setItem('attempting_wallet_connection', walletType);
          const currentUrl = window.location.href.split('?')[0]; // Remove any existing query params
          const deepLink = `https://solflare.com/ul/v1/browse/${encodeURIComponent(currentUrl)}`;
          toast.info('Opening Solflare app...', {
            description: 'Approve the connection and return to this page'
          });
          window.location.href = deepLink;
          setIsLoading(null);
          return;
        }
        
        if (!wallet) {
          toast.error('Please install Solflare wallet', {
            description: 'Visit solflare.com to install'
          });
          setIsLoading(null);
          return;
        }
      }

      // Connect to wallet
      await wallet.connect();
      
      // Get public key - different wallets have different structures
      const publicKey = walletType === 'phantom' 
        ? wallet.publicKey.toString()
        : wallet.publicKey.toString();

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
        
        // Redirect existing users to directory
        window.location.href = '/directory';
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
              {isLoading === 'phantom' ? 'Connecting...' : 'Sign in with Phantom'}
            </Button>
            
            <Button
              onClick={() => handleWalletSignIn('solflare')}
              disabled={!!isLoading}
              className="w-full h-12 text-base bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
              size="lg"
            >
              <img src={solflareIcon} alt="Solflare" className="w-6 h-6" />
              {isLoading === 'solflare' ? 'Connecting...' : 'Sign in with Solflare'}
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
