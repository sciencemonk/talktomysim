import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, CreditCard, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BuyButtonEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  offeringId: string;
  offeringTitle: string;
}

export function BuyButtonEmbedModal({ isOpen, onClose, offeringId, offeringTitle }: BuyButtonEmbedModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'card' | 'button'>('card');
  
  const embedCode = `<iframe
  src="https://solanainternetmarket.com/offering/${offeringId}/embed"
  style="width: 100%; max-width: ${selectedFormat === 'card' ? '500px' : '300px'}; height: ${selectedFormat === 'card' ? '400px' : '80px'}; border: none; border-radius: 8px;"
  title="${offeringTitle}"
></iframe>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied to clipboard!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Buy button</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto pr-2 flex-1">
          {/* Copy Code Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">COPY CODE TO YOUR SITE</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy code
              </Button>
            </div>
            
            <div className="relative">
              <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-hidden">
                <code className="break-all whitespace-pre-wrap">{embedCode}</code>
              </pre>
            </div>

            <p className="text-xs text-muted-foreground">
              Need help integrating with your website?{" "}
              <a 
                href="https://docs.solanainternetmarket.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Read our docs
              </a>
            </p>
          </div>

          {/* Configure Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">CONFIGURE</h3>
            
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedFormat('card')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  selectedFormat === 'card' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-border/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M4 10h16" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <span className="font-medium text-foreground">Card</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedFormat('button')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  selectedFormat === 'button' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-border/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="10" width="12" height="4" rx="2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <span className="font-medium text-foreground">Button</span>
                </div>
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">PREVIEW</h3>
            <div className="bg-muted/30 rounded-lg p-8 flex items-center justify-center min-h-[200px]">
              {selectedFormat === 'card' ? (
                <Card className="w-full max-w-sm border-border shadow-sm">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-lg">{offeringTitle}</CardTitle>
                    <CardDescription className="text-sm">
                      Purchase this offering with USDC
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Price</span>
                      </div>
                      <span className="text-lg font-bold">$XX.XX USDC</span>
                    </div>
                    <Button 
                      className="w-full"
                      style={{ backgroundColor: '#635cff', color: 'white' }}
                    >
                      Purchase Now
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Secure payment via Solana
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Button 
                  className="gap-2"
                  size="lg"
                  style={{ backgroundColor: '#635cff', color: 'white' }}
                >
                  Buy {offeringTitle}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
