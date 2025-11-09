import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import solanaLogo from "@/assets/solana-logo.png";

export const WelcomeModal = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const contractAddress = "FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump";

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("sim-welcome-modal-v2");
    if (!hasSeenWelcome) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("sim-welcome-modal-v2", "true");
    setOpen(false);
  };

  const handleCopyCA = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Contract address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={solanaLogo} alt="Solana" className="h-8 w-8" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Solana Internet Market
            </span>
          </div>

          {/* Description */}
          <p className="text-center text-muted-foreground leading-relaxed">
            SIM is a platform to build and discover AI agents, products, and on-chain services. 
            It's permissionless commerce with zero fees. Powered by x402.
          </p>

          {/* Token Section */}
          <div className="w-full space-y-3 pt-2">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">$SIMAI</h3>
              <p className="text-sm text-muted-foreground">Official token of the platform</p>
            </div>

            {/* Contract Address */}
            <div className="relative">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                <code className="flex-1 text-xs font-mono break-all">
                  {contractAddress}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyCA}
                  className="shrink-0 h-8 w-8 p-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <Button onClick={handleClose} className="w-full">
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
