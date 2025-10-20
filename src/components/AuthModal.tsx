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

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
  };

  const handleWalletSignIn = async (walletType: 'phantom' | 'solflare') => {
    setIsLoading(walletType);
    
    try {
      // For mobile, use proper deep link format with connection parameters
      if (isMobile()) {
        const appUrl = window.location.origin;
        const appName = 'TalkToMySim';
        
        if (walletType === 'phantom') {
          // Phantom mobile deep link for dApp browser
          const params = new URLSearchParams({
            app_url: appUrl,
            dapp_encryption_public_key: '', // Will be handled by wallet
            cluster: 'mainnet-beta',
            redirect_link: `${appUrl}?wallet=phantom`
          });
          
          const deepLink = `phantom://browse/${encodeURIComponent(appUrl)}?ref=${encodeURIComponent(appUrl)}`;
          
          toast.info('Opening Phantom...', {
            description: 'Tap "Connect" in the Phantom app to continue'
          });
          
          // Store that we're attempting connection
          sessionStorage.setItem('wallet_connection_pending', walletType);
          
          window.location.href = deepLink;
          return;
        } else {
          // Solflare mobile deep link
          const deepLink = `solflare://browse?url=${encodeURIComponent(appUrl)}`;
          
          toast.info('Opening Solflare...', {
            description: 'Tap "Connect" in the Solflare app to continue'
          });
          
          sessionStorage.setItem('wallet_connection_pending', walletType);
          
          window.location.href = deepLink;
          return;
        }
      }

      // Desktop wallet connection
      let wallet;
      
      if (walletType === 'phantom') {
        wallet = (window as any).solana;
        
        if (!wallet?.isPhantom) {
          toast.error('Phantom wallet not found', {
            description: 'Please install the Phantom browser extension'
          });
          setIsLoading(null);
          return;
        }
      } else {
        wallet = (window as any).solflare;
        
        if (!wallet) {
          toast.error('Solflare wallet not found', {
            description: 'Please install the Solflare browser extension'
          });
          setIsLoading(null);
          return;
        }
      }

      // Connect to wallet
      await wallet.connect();
      
      const publicKey = wallet.publicKey.toString();
      const message = `Sign in to TalkToMySim\n\nWallet: ${publicKey}\nTimestamp: ${new Date().toISOString()}`;
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
        
        // Redirect to directory
        window.location.href = '/directory';
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error?.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(null);
    }
  };

  // Check for pending wallet connections on mount
  useEffect(() => {
    const checkPendingConnection = async () => {
      const pending = sessionStorage.getItem('wallet_connection_pending');
      if (pending && open) {
        sessionStorage.removeItem('wallet_connection_pending');
        
        // Give wallet time to inject provider
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const walletType = pending as 'phantom' | 'solflare';
        const wallet = walletType === 'phantom' 
          ? (window as any).solana 
          : (window as any).solflare;
        
        if (wallet) {
          toast.info('Connecting wallet...');
          // Attempt to connect
          try {
            await wallet.connect();
            const publicKey = wallet.publicKey.toString();
            const message = `Sign in to TalkToMySim\n\nWallet: ${publicKey}\nTimestamp: ${new Date().toISOString()}`;
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
            toast.error('Please try connecting again');
          }
        }
      }
    };
    
    checkPendingConnection();
  }, [open, onOpenChange]);

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
