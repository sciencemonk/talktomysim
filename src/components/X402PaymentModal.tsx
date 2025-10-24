import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { ethers } from "ethers";

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
  const [userAddress, setUserAddress] = useState<string>('');

  // USDC contract address on Base mainnet
  const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  const BASE_MAINNET_CHAIN_ID = '0x2105'; // 8453 in hex

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        toast.error('Please install MetaMask or another Web3 wallet');
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setUserAddress(accounts[0]);
        
        // Check if user is on Base mainnet network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (chainId !== BASE_MAINNET_CHAIN_ID) {
          // Try to switch to Base mainnet
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: BASE_MAINNET_CHAIN_ID }],
            });
          } catch (switchError: any) {
            // Chain not added to wallet, add it
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: BASE_MAINNET_CHAIN_ID,
                  chainName: 'Base',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://mainnet.base.org'],
                  blockExplorerUrls: ['https://basescan.org']
                }]
              });
            } else {
              throw switchError;
            }
          }
        }
        
        setWalletConnected(true);
        toast.success('Wallet connected to Base');
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
      console.log('Starting USDC payment:', { 
        price, 
        recipientWallet: walletAddress, 
        userAddress,
        network: 'base-mainnet' 
      });

      // Create ethers provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // USDC ERC20 ABI (minimal for transfer)
      const usdcAbi = [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function balanceOf(address account) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];

      // Create contract instance
      const usdcContract = new ethers.Contract(USDC_ADDRESS, usdcAbi, signer);

      // Check user's USDC balance
      const balance = await usdcContract.balanceOf(userAddress);
      const decimals = await usdcContract.decimals();
      const amount = ethers.parseUnits(price.toString(), decimals);

      console.log('USDC balance:', ethers.formatUnits(balance, decimals), 'USDC');
      console.log('Payment amount:', ethers.formatUnits(amount, decimals), 'USDC');

      if (balance < amount) {
        throw new Error('Insufficient USDC balance');
      }

      // Execute transfer
      toast.info('Please confirm the transaction in your wallet...');
      const tx = await usdcContract.transfer(walletAddress, amount);
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      console.log('Transaction hash:', tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      console.log('Transaction confirmed:', receipt);

      // Generate session ID with transaction hash
      const sessionId = `x402_${receipt.hash}_${Date.now()}`;
      
      // Store session with payment proof
      localStorage.setItem(`x402_session_${walletAddress}`, JSON.stringify({
        sessionId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        amount: price,
        timestamp: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        from: userAddress,
        to: walletAddress
      }));

      toast.success('Payment successful!');
      onPaymentSuccess(sessionId);
      onClose();
    } catch (error: any) {
      console.error('Payment error:', error);
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        toast.error('Payment cancelled by user');
      } else if (error.message?.includes('insufficient funds') || error.message?.includes('Insufficient')) {
        toast.error('Insufficient USDC balance');
      } else {
        toast.error(error.message || 'Payment failed. Please try again.');
      }
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
              <span className="font-medium">Base</span>
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
            Payment is processed on Base mainnet using USDC
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
