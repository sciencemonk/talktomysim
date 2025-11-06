import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Wallet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface X402InstructionsProps {
  offeringTitle: string;
  price: number;
  x402Url: string;
}

export function X402Instructions({ offeringTitle, price, x402Url }: X402InstructionsProps) {
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(x402Url);
    toast.success("x402 URL copied to clipboard!");
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            x402 Payment Protocol
          </CardTitle>
          <Badge variant="outline">Base Network</Badge>
        </div>
        <CardDescription>
          This offering uses the x402 payment protocol for secure, decentralized payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">How to purchase:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Use an x402-compatible wallet or client</li>
            <li>Scan or paste the x402 URL below</li>
            <li>Approve the {price} USDC payment on Base network</li>
            <li>Receive instant access to your purchase</li>
          </ol>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">x402 Endpoint URL:</p>
          <div className="flex gap-2">
            <code className="flex-1 p-3 text-xs bg-secondary rounded-md overflow-x-auto">
              {x402Url}
            </code>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopyUrl}
            >
              Copy
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Secure & Trustless</p>
            <p className="text-xs text-muted-foreground">
              Payments are validated on-chain. No intermediaries or trust required.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open('https://x402.gitbook.io/x402', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Learn about x402
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open('https://www.x402scan.com', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            x402 Clients
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
