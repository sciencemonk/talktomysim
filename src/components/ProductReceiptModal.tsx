import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProductReceiptData {
  signature: string;
  amount: number;
  productTitle: string;
  productDescription: string;
  deliveryInfo?: string;
  buyerInfo: {
    email?: string;
    name?: string;
    phone?: string;
    address?: string;
  };
  timestamp: Date;
}

interface ProductReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ProductReceiptData | null;
}

export function ProductReceiptModal({ isOpen, onClose, receiptData }: ProductReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!receiptData) return null;

  const handleCopySignature = async () => {
    try {
      await navigator.clipboard.writeText(receiptData.signature);
      setCopied(true);
      toast.success("Transaction signature copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy signature");
    }
  };

  const handleViewTransaction = () => {
    window.open(`https://solscan.io/tx/${receiptData.signature}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Order Confirmed!</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {receiptData.timestamp.toLocaleString()}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Order Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Details
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="font-medium">{receiptData.productTitle}</p>
                {receiptData.productDescription && (
                  <p className="text-sm text-muted-foreground mt-1">{receiptData.productDescription}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="font-medium text-lg">
                  ${receiptData.amount % 1 === 0 ? receiptData.amount : receiptData.amount.toFixed(2)} USDC
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          {receiptData.deliveryInfo && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Package className="w-5 h-5" />
                What to Expect Next
              </h3>
              <p className="text-sm">{receiptData.deliveryInfo}</p>
            </div>
          )}

          {/* Buyer Information */}
          {(receiptData.buyerInfo.email || receiptData.buyerInfo.name || receiptData.buyerInfo.phone || receiptData.buyerInfo.address) && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg">Your Information</h3>
              <div className="space-y-2">
                {receiptData.buyerInfo.name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{receiptData.buyerInfo.name}</p>
                  </div>
                )}
                {receiptData.buyerInfo.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{receiptData.buyerInfo.email}</p>
                  </div>
                )}
                {receiptData.buyerInfo.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{receiptData.buyerInfo.phone}</p>
                  </div>
                )}
                {receiptData.buyerInfo.address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Shipping Address</p>
                    <p className="font-medium whitespace-pre-line">{receiptData.buyerInfo.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transaction Proof */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">Transaction Proof</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Transaction Signature</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background px-3 py-2 rounded text-xs break-all font-mono">
                  {receiptData.signature}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopySignature}
                  className="shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={handleViewTransaction}
                className="p-0 h-auto text-primary"
              >
                View on Solscan <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              <strong>Important:</strong> Save this transaction signature for your records. 
              If you have any questions about your order, please contact the seller with this signature.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={onClose} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
