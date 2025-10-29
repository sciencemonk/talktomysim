import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface TokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TokenModal = ({ open, onOpenChange }: TokenModalProps) => {
  const contractAddress = "FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump";
  const dexscreenerUrl = "https://dexscreener.com/solana/dm9nxs5e1kzhszksm8bw1r4xf3wvvbee6hptysfjszx8";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress);
    toast.success("Contract address copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">$SIMAI Token</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Contract Address
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-muted rounded-md text-xs break-all">
                {contractAddress}
              </code>
              <Button
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={() => window.open(dexscreenerUrl, '_blank')}
            className="w-full gap-2"
            style={{ backgroundColor: '#83f1aa', color: '#000' }}
          >
            View on Dexscreener
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
