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

  const handleTwitterSignIn = async () => {
    setIsLoading('twitter');
    try {
      // Open OAuth in a popup window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          skipBrowserRedirect: false,
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) throw error;

      // Open the auth URL in a popup
      if (data.url) {
        const popup = window.open(
          data.url,
          'X Authentication',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        // Listen for the popup to close or for auth completion
        const checkPopup = setInterval(() => {
          if (popup && popup.closed) {
            clearInterval(checkPopup);
            setIsLoading(null);
            onOpenChange(false);
            // Refresh the page to check auth status
            window.location.reload();
          }
        }, 500);
      }
    } catch (error: any) {
      console.error('Error signing in with X:', error);
      toast.error(error?.message || 'Failed to sign in with X');
      setIsLoading(null);
    }
  };

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
  };

  const handleWalletSignIn = async (walletType: 'phantom' | 'solflare') => {
    setIsLoading(walletType);
    
    try {
      // Check if wallet provider is available
      let wallet;
      
      if (walletType === 'phantom') {
        wallet = (window as any).solana;
      } else {
        wallet = (window as any).solflare;
      }

      // If mobile and wallet not available, redirect to wallet's in-app browser
      if (isMobile() && !wallet) {
        const currentUrl = window.location.href.split('?')[0]; // Clean URL
        const redirectUrl = `${currentUrl}?wallet=${walletType}&autoconnect=true`;
        
        if (walletType === 'phantom') {
          const deepLink = `https://phantom.app/ul/browse/${encodeURIComponent(redirectUrl)}?ref=${encodeURIComponent(window.location.origin)}`;
          
          toast.info('Opening in Phantom...', {
            description: 'You\'ll be able to connect from within the Phantom app'
          });
          
          window.location.href = deepLink;
          return;
        } else {
          const deepLink = `https://solflare.com/ul/v1/browse/${encodeURIComponent(redirectUrl)}?ref=${encodeURIComponent(window.location.origin)}`;
          
          toast.info('Opening in Solflare...', {
            description: 'You\'ll be able to connect from within the Solflare app'
          });
          
          window.location.href = deepLink;
          return;
        }
      }

      // Wallet connection (desktop or already in wallet browser)
      if (!wallet) {
        toast.error(`${walletType === 'phantom' ? 'Phantom' : 'Solflare'} wallet not found`, {
          description: isMobile() 
            ? 'Please open this site from within the wallet app' 
            : `Please install the ${walletType === 'phantom' ? 'Phantom' : 'Solflare'} browser extension`
        });
        setIsLoading(null);
        return;
      }
      
      if (walletType === 'phantom' && !wallet?.isPhantom) {
        toast.error('Phantom wallet not found', {
          description: isMobile() 
            ? 'Please open this site from within the Phantom app' 
            : 'Please install the Phantom browser extension'
        });
        setIsLoading(null);
        return;
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

  // Check for autoconnect parameter (when returning from wallet browser)
  useEffect(() => {
    const checkAutoConnect = async () => {
      const params = new URLSearchParams(window.location.search);
      const walletParam = params.get('wallet');
      const autoconnect = params.get('autoconnect');
      
      if (autoconnect === 'true' && walletParam && open) {
        // Clean URL
        window.history.replaceState({}, '', '/');
        
        // Give wallet time to inject provider
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const walletType = walletParam as 'phantom' | 'solflare';
        const wallet = walletType === 'phantom' 
          ? (window as any).solana 
          : (window as any).solflare;
        
        if (wallet) {
          setIsLoading(walletType);
          toast.info('Connecting wallet...');
          
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
            toast.error('Connection failed. Please try again');
          } finally {
            setIsLoading(null);
          }
        } else {
          toast.error(`${walletType === 'phantom' ? 'Phantom' : 'Solflare'} not detected`, {
            description: 'Make sure you opened this in the wallet app browser'
          });
        }
      }
    };
    
    checkAutoConnect();
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
              onClick={handleTwitterSignIn}
              disabled={!!isLoading}
              className="w-full h-12 text-base bg-gradient-to-r from-blue-400 to-blue-600 hover:opacity-90 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
              size="lg"
            >
              {isLoading === 'twitter' ? 'Connecting...' : 'Sign in with X'}
            </Button>

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
