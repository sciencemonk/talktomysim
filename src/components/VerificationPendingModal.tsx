import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface VerificationPendingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCode: string;
  xUsername: string;
}

export function VerificationPendingModal({
  open,
  onOpenChange,
  editCode,
  xUsername,
}: VerificationPendingModalProps) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);

  const verificationText = "Verify me $SIMAI";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
    toast.success("Edit code copied!");
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(verificationText);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
    toast.success("Verification text copied!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Agent Pending Verification
          </DialogTitle>
          <DialogDescription>
            Your X agent has been created and is awaiting verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className="text-yellow-600 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              Pending Verification
            </Badge>
          </div>

          {/* Edit Code */}
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Your 6-Digit Creator Code:</p>
            <div className="flex items-center justify-between">
              <code className="text-2xl font-mono font-bold tracking-wider">
                {editCode}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
              >
                {codeCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Save this code! You'll need it to manage your agent.
            </p>
          </div>

          {/* Verification Instructions */}
          <div className="space-y-3">
            <p className="text-sm font-medium">To verify and activate your agent:</p>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Post the following text from your X account @{xUsername}:</li>
            </ol>
            
            <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
              <code className="text-sm font-mono">{verificationText}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyText}
              >
                {textCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <ol start={2} className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Your agent will be verified within 24 hours</li>
              <li>Once verified, your page will be publicly accessible</li>
            </ol>
          </div>

          {/* What you can do now */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              While pending:
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>Access your creator dashboard with your code</li>
              <li>Add products and services</li>
              <li>Configure AI settings</li>
              <li>Your page won't be publicly visible until verified</li>
            </ul>
          </div>

          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full"
            variant="default"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
