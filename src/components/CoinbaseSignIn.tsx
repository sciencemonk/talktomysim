import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const CoinbaseSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCoinbaseSignIn = async () => {
    setIsLoading(true);
    try {
      const coinbaseWallet = (window as any).coinbaseWallet;
      
      if (!coinbaseWallet) {
        throw new Error('Coinbase Wallet SDK not initialized');
      }

      const ethereum = coinbaseWallet.makeWeb3Provider();
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        toast.success('Connected to Coinbase Wallet');
        // Handle successful connection
        console.log('Connected account:', accounts[0]);
      }
    } catch (error: any) {
      console.error('Coinbase Wallet connection error:', error);
      toast.error(error?.message || 'Failed to connect to Coinbase Wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Connect your Coinbase Wallet to access your agentic storefront
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleCoinbaseSignIn}
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Connect Coinbase Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
