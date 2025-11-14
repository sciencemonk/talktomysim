import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface PurchaseData {
  signature: string;
  amount: number;
  offeringTitle: string;
  offeringDescription: string;
  deliveryMethod: string;
  buyerInfo: Record<string, string>;
  timestamp: Date;
}

interface OfferingReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseData: PurchaseData | null;
}

export function OfferingReceiptModal({ isOpen, onClose, purchaseData }: OfferingReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!purchaseData) return null;

  const handleCopySignature = async () => {
    try {
      await navigator.clipboard.writeText(purchaseData.signature);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Transaction signature copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy signature",
        variant: "destructive",
      });
    }
  };

  const handleViewTransaction = () => {
    window.open(`https://solscan.io/tx/${purchaseData.signature}`, '_blank');
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
              <DialogTitle className="text-2xl">Purchase Complete!</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {new Date(purchaseData.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Purchase Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">Purchase Details</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Offering</p>
                <p className="font-medium">{purchaseData.offeringTitle}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="font-medium">${purchaseData.amount % 1 === 0 ? purchaseData.amount : purchaseData.amount.toFixed(2)} USDC</p>
              </div>
            </div>
          </div>

          {/* Transaction Proof */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">Transaction Proof</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Transaction Signature</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background px-3 py-2 rounded text-xs break-all">
                  {purchaseData.signature}
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
                className="p-0 h-auto"
              >
                View on Solscan <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Fulfillment Instructions */}
          <div className="bg-primary/10 rounded-lg p-4 space-y-3 border border-primary/20">
            <h3 className="font-semibold text-lg">Fulfillment Instructions</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Delivery Method</p>
                <p className="font-medium">{purchaseData.deliveryMethod}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground mb-2">What happens next:</p>
                <p>{purchaseData.offeringDescription}</p>
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          {Object.keys(purchaseData.buyerInfo).length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg">Your Information</h3>
              <div className="space-y-2">
                {Object.entries(purchaseData.buyerInfo).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm text-muted-foreground capitalize">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
