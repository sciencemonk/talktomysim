import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountInstruction, getAccount } from "@solana/spl-token";
import { Loader2 } from "lucide-react";

interface Offering {
  id: string;
  title: string;
  description: string;
  price: number;
  delivery_method: string;
  required_info: Array<{ label: string; type: string; required: boolean }>;
  digital_file_url?: string;
  offering_type?: string;
}

interface XOfferingPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  offering: Offering;
  agentId: string;
  agentName: string;
  walletAddress: string;
  onPurchaseSuccess?: (digitalFileUrl?: string, signature?: string, buyerInfo?: Record<string, string>) => void;
}

const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

export function XOfferingPurchaseModal({
  isOpen,
  onClose,
  offering,
  agentId,
  agentName,
  walletAddress,
  onPurchaseSuccess,
}: XOfferingPurchaseModalProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState<Record<string, string>>({});

  const handleInputChange = (fieldLabel: string, value: string) => {
    setBuyerInfo({ ...buyerInfo, [fieldLabel]: value });
  };

  const validateRequiredFields = () => {
    for (const field of offering.required_info) {
      if (field.required && !buyerInfo[field.label]?.trim()) {
        toast.error(`Please fill in: ${field.label}`);
        return false;
      }
    }
    return true;
  };

  const handlePurchase = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!validateRequiredFields()) {
      return;
    }

    setIsProcessing(true);

    try {
      const recipientPubkey = new PublicKey(walletAddress);
      const usdcAmount = Math.floor(offering.price * 1_000_000);

      const senderTokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey);
      const recipientTokenAccount = await getAssociatedTokenAddress(USDC_MINT, recipientPubkey);

      // Check sender balance
      try {
        const senderAccount = await getAccount(connection, senderTokenAccount);
        if (Number(senderAccount.amount) < usdcAmount) {
          toast.error("Insufficient USDC balance");
          setIsProcessing(false);
          return;
        }
      } catch (error) {
        toast.error("USDC token account not found. Please ensure you have USDC in your wallet.");
        setIsProcessing(false);
        return;
      }

      const transaction = new Transaction();

      // Check if recipient token account exists
      try {
        await getAccount(connection, recipientTokenAccount);
      } catch (error) {
        // Create recipient token account if it doesn't exist
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            recipientTokenAccount,
            recipientPubkey,
            USDC_MINT
          )
        );
      }

      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          publicKey,
          usdcAmount
        )
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      // Generate session ID
      const sessionId = `x402_store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store purchase record
      const { error: purchaseError } = await supabase
        .from("x_agent_purchases")
        .insert({
          offering_id: offering.id,
          agent_id: agentId,
          session_id: sessionId,
          payment_amount: offering.price,
          buyer_info: buyerInfo,
          status: "completed",
        });

      if (purchaseError) throw purchaseError;

      toast.success(`Purchase successful! Transaction: ${signature.slice(0, 8)}...`);
      
      // Pass purchase data to parent
      onPurchaseSuccess?.(offering.digital_file_url, signature, buyerInfo);
      
      onClose();
    } catch (error: any) {
      console.error("Purchase error:", error);
      
      // Handle user cancellation separately
      if (error?.message?.includes("User rejected") || 
          error?.message?.includes("Cancelled") ||
          error?.error === "Cancelled") {
        toast.error("Transaction cancelled");
      } else {
        toast.error(error?.message || "Purchase failed. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Purchase: {offering.title}</DialogTitle>
          <DialogDescription>
            Complete your purchase from {agentName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {offering.description}
            </p>
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="text-lg font-bold">${Number(offering.price).toLocaleString()} USDC</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <strong>Delivery:</strong> {offering.delivery_method}
            </div>
          </div>

          {offering.required_info && offering.required_info.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Required Information</h4>
              {offering.required_info.map((field, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`field-${index}`}>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={`field-${index}`}
                      value={buyerInfo[field.label] || ""}
                      onChange={(e) => handleInputChange(field.label, e.target.value)}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                    />
                  ) : (
                    <Input
                      id={`field-${index}`}
                      type={field.type}
                      value={buyerInfo[field.label] || ""}
                      onChange={(e) => handleInputChange(field.label, e.target.value)}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 space-y-3">
            {!publicKey ? (
              <WalletMultiButton className="!w-full !bg-primary !text-primary-foreground hover:!bg-primary/90" />
            ) : (
              <Button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="w-full"
                style={{ backgroundColor: '#81f4aa', color: '#000' }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${Number(offering.price).toLocaleString()} USDC`
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
