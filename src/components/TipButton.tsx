import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction } from "@solana/web3.js";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Heart, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface TipButtonProps {
  simName: string;
  walletAddress: string;
  className?: string;
}

export const TipButton = ({ simName, walletAddress, className = "" }: TipButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  // USDC mint address on Solana mainnet
  const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

  const handleTip = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your Solana wallet first');
      return;
    }

    const tipAmount = parseFloat(amount);
    if (isNaN(tipAmount) || tipAmount <= 0) {
      toast.error('Please enter a valid tip amount');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Sending USDC tip:', { 
        amount: tipAmount, 
        recipientWallet: walletAddress, 
        userAddress: publicKey.toString()
      });

      const recipientPubKey = new PublicKey(walletAddress);

      // Get associated token accounts
      const senderTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        publicKey
      );

      const recipientTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        recipientPubKey
      );

      // USDC has 6 decimals
      const amountInSmallestUnit = Math.floor(tipAmount * 1_000_000);

      console.log('Token accounts:', {
        sender: senderTokenAccount.toString(),
        recipient: recipientTokenAccount.toString(),
        amount: amountInSmallestUnit
      });

      // Check sender's USDC balance
      let senderBalance = 0;
      try {
        const senderAccountInfo = await getAccount(connection, senderTokenAccount);
        senderBalance = Number(senderAccountInfo.amount);
        console.log('Sender USDC balance:', senderBalance / 1_000_000, 'USDC');
        
        if (senderBalance < amountInSmallestUnit) {
          toast.error(`Insufficient USDC. You have ${(senderBalance / 1_000_000).toFixed(2)} USDC but need ${tipAmount.toFixed(2)} USDC`);
          return;
        }
      } catch (error) {
        console.error('Sender USDC account check failed:', error);
        toast.error('You need USDC in your wallet. Please add USDC to your Solana wallet first.');
        return;
      }

      // Build transaction
      const transaction = new Transaction();
      
      // Check if recipient token account exists, create if not
      try {
        await getAccount(connection, recipientTokenAccount);
        console.log('Recipient token account exists');
      } catch (error) {
        console.log('Creating recipient token account...');
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            recipientTokenAccount,
            recipientPubKey,
            USDC_MINT,
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
          amountInSmallestUnit,
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

      console.log('Tip transaction confirmed:', signature);

      toast.success(`Successfully tipped ${tipAmount} USDC to ${simName}!`);
      
      // Reset form and close modal
      setAmount("");
      setMessage("");
      setIsOpen(false);
    } catch (error: any) {
      console.error('Tip error:', error);
      if (error.message?.includes('User rejected')) {
        toast.error('Tip cancelled');
      } else if (error.message?.includes('insufficient')) {
        toast.error('Insufficient USDC balance');
      } else {
        toast.error(error.message || 'Failed to send tip. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAmounts = [1, 5, 10, 25, 50];

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`gap-2 ${className}`}
        variant="outline"
        size="sm"
      >
        <Heart className="h-4 w-4" />
        Tip
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Tip {simName}
            </DialogTitle>
            <DialogDescription>
              Send a tip in USDC on Solana to support this SIM
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!connected ? (
              <div className="space-y-3">
                <div className="text-center p-6 border-2 border-dashed rounded-lg">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your Solana wallet to send tips
                  </p>
                  <div className="flex justify-center">
                    <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90" />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USDC)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    disabled={isProcessing}
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {quickAmounts.map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(amt.toString())}
                      disabled={isProcessing}
                      className="flex-1 min-w-[60px]"
                    >
                      ${amt}
                    </Button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (optional)</Label>
                  <Input
                    id="message"
                    placeholder="Leave a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network:</span>
                    <span className="font-medium">Solana</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token:</span>
                    <span className="font-medium">USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wallet:</span>
                    <span className="font-mono text-xs">{publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleTip} 
                  className="w-full"
                  disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Tip...
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-4 w-4" />
                      Send {amount ? `$${parseFloat(amount).toFixed(2)}` : ''} Tip
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
