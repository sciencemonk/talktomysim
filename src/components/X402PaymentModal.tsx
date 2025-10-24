import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";

interface X402PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (sessionId: string) => void;
  simName: string;
  price: number;
  walletAddress: string;
}

export const X402PaymentModal = ({ 
  isOpen, 
  onClose, 
  onPaymentSuccess,
  simName,
  price,
  walletAddress
}: X402PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        toast.error('Please install MetaMask or another Web3 wallet');
        return;
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setWalletConnected(true);
        toast.success('Wallet connected');
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  const handlePayment = async () => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    try {
      // For now, simulate payment success
      // TODO: Implement actual x402 payment flow
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Store session ID in localStorage
      localStorage.setItem(`x402_session_${walletAddress}`, sessionId);
      toast.success('Payment successful!');
      onPaymentSuccess(sessionId);
      onClose();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Required</DialogTitle>
          <DialogDescription>
            To chat with {simName}, you need to pay ${price.toFixed(2)} USDC
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-medium">${price.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network:</span>
              <span className="font-medium">Base Sepolia</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Access:</span>
              <span className="font-medium">24 hours</span>
            </div>
          </div>

          {!walletConnected ? (
            <Button 
              onClick={connectWallet} 
              className="w-full"
              disabled={isProcessing}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          ) : (
            <Button 
              onClick={handlePayment} 
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>Pay ${price.toFixed(2)} USDC</>
              )}
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Need testnet USDC? Get it from{" "}
            <a 
              href="https://faucet.circle.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Circle Faucet
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
