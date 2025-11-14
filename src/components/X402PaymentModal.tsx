import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction, 
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount
} from "@solana/spl-token";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface X402PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (sessionId: string) => void;
  simName: string;
  price: number;
  walletAddress: string;
  product?: {
    id: string;
    title: string;
    checkout_fields?: {
      email?: boolean;
      name?: boolean;
      phone?: boolean;
      address?: boolean;
      wallet?: boolean;
      sex?: boolean;
      size?: boolean;
    };
  };
  storeId?: string;
}

export const X402PaymentModal = ({ 
  isOpen, 
  onClose, 
  onPaymentSuccess,
  simName,
  price,
  walletAddress,
  product,
  storeId
}: X402PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    wallet: '',
    sex: '',
    size: ''
  });
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  // USDC mint address on Solana mainnet
  const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

  const validateRequiredFields = () => {
    if (product?.checkout_fields) {
      if (product.checkout_fields.email && !buyerInfo.email) {
        toast.error('Please enter your email address');
        return false;
      }
      if (product.checkout_fields.name && !buyerInfo.name) {
        toast.error('Please enter your full name');
        return false;
      }
      if (product.checkout_fields.phone && !buyerInfo.phone) {
        toast.error('Please enter your phone number');
        return false;
      }
      if (product.checkout_fields.address && !buyerInfo.address) {
        toast.error('Please enter your shipping address');
        return false;
      }
      if (product.checkout_fields.wallet && !buyerInfo.wallet) {
        toast.error('Please enter your SOL wallet address');
        return false;
      }
      if (product.checkout_fields.sex && !buyerInfo.sex) {
        toast.error('Please select sex');
        return false;
      }
      if (product.checkout_fields.size && !buyerInfo.size) {
        toast.error('Please select size');
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your Solana wallet first');
      return;
    }

    if (!validateRequiredFields()) {
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Starting USDC payment on Solana:', { 
        price, 
        recipientWallet: walletAddress, 
        userAddress: publicKey.toString(),
        network: 'mainnet-beta' 
      });

      const recipientPubKey = new PublicKey(walletAddress);

      // Get associated token accounts for sender and recipient
      const senderTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        publicKey
      );

      const recipientTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        recipientPubKey
      );

      // USDC has 6 decimals
      const amount = Math.floor(price * 1_000_000);

      console.log('Token accounts:', {
        sender: senderTokenAccount.toString(),
        recipient: recipientTokenAccount.toString(),
        amount
      });

      // Check if sender has USDC token account and sufficient balance
      let senderBalance = 0;
      try {
        const senderAccountInfo = await getAccount(connection, senderTokenAccount);
        senderBalance = Number(senderAccountInfo.amount);
        console.log('Sender USDC balance:', senderBalance / 1_000_000, 'USDC');
        
        if (senderBalance < amount) {
          toast.error(`Insufficient USDC. You have ${(senderBalance / 1_000_000).toFixed(2)} USDC but need ${price.toFixed(2)} USDC`);
          return;
        }
      } catch (error) {
        console.error('Sender USDC account check failed:', error);
        toast.error('You need to have USDC in your wallet first. Please add USDC to your Solana wallet.');
        return;
      }

      // Check if recipient token account exists, if not create it
      const transaction = new Transaction();
      
      try {
        await getAccount(connection, recipientTokenAccount);
        console.log('Recipient token account exists');
      } catch (error) {
        console.log('Recipient token account does not exist, creating it...');
        // Add instruction to create recipient's associated token account
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            recipientTokenAccount, // associated token account address
            recipientPubKey, // owner
            USDC_MINT, // mint
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          publicKey,
          amount,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      toast.info('Please confirm the transaction in your wallet...');

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      console.log('Transaction signature:', signature);

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      });

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      console.log('Transaction confirmed:', signature);

      // Store the order in the database if this is a product purchase
      if (product && storeId) {
        const orderData: any = {
          product_id: product.id,
          store_id: storeId,
          amount: price,
          currency: 'USDC',
          payment_signature: signature,
          status: 'completed'
        };

        if (product.checkout_fields) {
          if (product.checkout_fields.email) orderData.buyer_email = buyerInfo.email;
          if (product.checkout_fields.name) orderData.buyer_name = buyerInfo.name;
          if (product.checkout_fields.phone) orderData.buyer_phone = buyerInfo.phone;
          if (product.checkout_fields.address) {
            orderData.buyer_address = { address: buyerInfo.address };
          }
          
          // Store custom field data
          const customData: any = {};
          if (product.checkout_fields.wallet && buyerInfo.wallet) {
            customData.wallet_address = buyerInfo.wallet;
          }
          if (buyerInfo.sex) customData.sex = buyerInfo.sex;
          if (buyerInfo.size) customData.size = buyerInfo.size;
          
          if (Object.keys(customData).length > 0) {
            orderData.custom_field_data = customData;
          }
        }

        try {
          const { error: orderError } = await supabase
            .from('orders' as any)
            .insert(orderData);

          if (orderError) {
            console.error('Failed to store order:', orderError);
          } else {
            console.log('Order stored successfully');
          }
        } catch (orderStoreError) {
          console.error('Error storing order:', orderStoreError);
        }
      }

      // Generate session ID
      const sessionId = `corbits_${signature}_${publicKey.toString().slice(0, 8)}`;
      
      // Store payment session server-side for security
      try {
        const storeResponse = await supabase.functions.invoke('store-payment-session', {
          body: {
            sessionId,
            walletAddress,
            signature,
            amount: price,
            currency: 'USDC',
            network: 'solana',
            expiresInHours: 24
          }
        });

        if (storeResponse.error) {
          console.error('Failed to store payment session:', storeResponse.error);
          throw new Error('Failed to store payment session');
        }

        console.log('Payment session stored server-side:', storeResponse.data);

        // Store minimal session reference in localStorage (just for convenience)
        localStorage.setItem(`x402_session_${walletAddress}`, JSON.stringify({
          sessionId,
          timestamp: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000)
        }));

        toast.success('Payment successful!');
        onPaymentSuccess(sessionId);
        onClose();
      } catch (storageError) {
        console.error('Storage error:', storageError);
        toast.error('Payment succeeded but session storage failed. Please contact support.');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      if (error.message?.includes('User rejected')) {
        toast.error('Payment cancelled by user');
      } else if (error.message?.includes('insufficient')) {
        toast.error('Insufficient USDC balance');
      } else if (error.message?.includes('TokenAccountNotFoundError')) {
        toast.error('USDC token account not found. Please ensure you have USDC in your wallet.');
      } else {
        toast.error(error.message || 'Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Required</DialogTitle>
          <DialogDescription>
            To chat with {simName}, you need to pay ${price.toFixed(2)} USDC on Solana
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Buyer Information Form */}
          {product?.checkout_fields && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Required Information</h3>
              {product.checkout_fields.email && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email Address *</label>
                  <input
                    type="email"
                    value={buyerInfo.email}
                    onChange={(e) => setBuyerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                    placeholder="your@email.com"
                  />
                </div>
              )}
              {product.checkout_fields.name && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Full Name *</label>
                  <input
                    type="text"
                    value={buyerInfo.name}
                    onChange={(e) => setBuyerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                    placeholder="John Doe"
                  />
                </div>
              )}
              {product.checkout_fields.phone && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Phone Number *</label>
                  <input
                    type="tel"
                    value={buyerInfo.phone}
                    onChange={(e) => setBuyerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              )}
              {product.checkout_fields.address && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Shipping Address *</label>
                  <textarea
                    value={buyerInfo.address}
                    onChange={(e) => setBuyerInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                    placeholder="123 Main St, City, State, ZIP"
                    rows={3}
                  />
                </div>
              )}
              {product.checkout_fields.wallet && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">SOL Wallet Address *</label>
                  <input
                    type="text"
                    value={buyerInfo.wallet}
                    onChange={(e) => setBuyerInfo(prev => ({ ...prev, wallet: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                    placeholder="Your Solana wallet address"
                  />
                </div>
              )}
              
              {/* Sex and Size Fields - Always shown */}
              <div className="pt-2 border-t border-border">
                {!product.checkout_fields.sex && !product.checkout_fields.size && (
                  <h4 className="text-xs font-medium text-muted-foreground mb-3">Optional Information</h4>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Sex {product.checkout_fields.sex && <span className="text-destructive">*</span>}
                    </label>
                    <Select value={buyerInfo.sex} onValueChange={(value) => setBuyerInfo(prev => ({ ...prev, sex: value }))}>
                      <SelectTrigger className="w-full mt-1 h-9 text-sm bg-background">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border z-[9999]">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Size {product.checkout_fields.size && <span className="text-destructive">*</span>}
                    </label>
                    <Select value={buyerInfo.size} onValueChange={(value) => setBuyerInfo(prev => ({ ...prev, size: value }))}>
                      <SelectTrigger className="w-full mt-1 h-9 text-sm bg-background">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border z-[9999]">
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="xl">XL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-medium">${price.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network:</span>
              <span className="font-medium">Solana</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Access:</span>
              <span className="font-medium">24 hours</span>
            </div>
          </div>

          {!connected ? (
            <div className="space-y-3">
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90" />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Connect your Solana wallet (Phantom or Solflare)
              </p>
            </div>
          ) : (
            <div className="space-y-3">
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
              <p className="text-xs text-muted-foreground text-center">
                Make sure you have USDC in your wallet
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
