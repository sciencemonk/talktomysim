import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleSignIn = () => {
    // Redirect to sign in with X
    navigate('/login');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <DialogTitle>Verified Store Pending Verification</DialogTitle>
          </div>
          <DialogDescription className="space-y-3 pt-2">
            <div>
              <span className="font-semibold">{agentName}</span> is currently pending verification and not yet available for public use.
            </div>
            <div className="text-sm">
              If you're the creator of this agent, sign in with X to manage and verify your agent.
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
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
              Sign In with X
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
