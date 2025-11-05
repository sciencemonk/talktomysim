import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PendingAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentName: string;
  agentId: string;
  customUrl: string;
}

export function PendingAgentModal({ 
  open, 
  onOpenChange, 
  agentName,
  agentId,
  customUrl 
}: PendingAgentModalProps) {
  const [editCode, setEditCode] = useState("");
  const navigate = useNavigate();

  const handleSignIn = () => {
    if (!editCode.trim()) {
      toast.error("Please enter your edit code");
      return;
    }

    // Navigate to the creator view with the edit code
    navigate(`/${customUrl}/creator?code=${editCode}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <DialogTitle>Agent Pending Verification</DialogTitle>
          </div>
          <DialogDescription className="space-y-3 pt-2">
            <div>
              <span className="font-semibold">{agentName}</span> is currently pending verification and not yet available for public use.
            </div>
            <div className="text-sm">
              If you're the creator of this agent, sign in with your edit code to manage and verify your agent.
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="editCode" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Creator Edit Code
            </Label>
            <Input
              id="editCode"
              type="text"
              placeholder="Enter your edit code"
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSignIn();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              The edit code was provided when you created this agent
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSignIn}
              className="flex-1 bg-[#80f4a9] hover:bg-[#6dd991] text-black border-0"
            >
              Sign In as Creator
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
