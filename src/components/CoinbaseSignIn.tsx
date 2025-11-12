import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const CoinbaseSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const handleCoinbaseSignIn = async () => {
    setIsLoading(true);
    try {
      const coinbaseWallet = (window as any).coinbaseWallet;
      
      if (!coinbaseWallet) {
        toast.error('Please install Coinbase Wallet extension to continue');
        window.open('https://www.coinbase.com/wallet/downloads', '_blank');
        setIsLoading(false);
        return;
      }

      const ethereum = coinbaseWallet.makeWeb3Provider();
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        const userData = { address: accounts[0] };
        updateUser(userData);
        
        toast.success('Successfully connected to Coinbase Wallet!');
        console.log('Connected account:', accounts[0]);
        
        // Redirect to dashboard after successful connection
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Coinbase Wallet connection error:', error);
      
      if (error.code === 4001) {
        toast.error('Connection request rejected');
      } else if (error.code === -32002) {
        toast.error('Please check your Coinbase Wallet - there may be a pending request');
      } else {
        toast.error(error?.message || 'Failed to connect to Coinbase Wallet');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
          <CardDescription className="text-base">
            Sign in with your Coinbase Wallet to access your agentic storefront and start selling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleCoinbaseSignIn}
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-5 w-5" />
                Connect Coinbase Wallet
              </>
            )}
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have Coinbase Wallet?{' '}
              <a 
                href="https://www.coinbase.com/wallet/downloads" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Get it here
              </a>
            </p>
          </div>

          <div className="pt-4 border-t">
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Secure connection via Coinbase
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Your wallet remains in your control
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                No passwords or personal data stored
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
