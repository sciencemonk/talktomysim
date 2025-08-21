
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerificationBadgeProps {
  isVerified: boolean;
}

export const VerificationBadge = ({ isVerified }: VerificationBadgeProps) => {
  if (!isVerified) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Check className="h-4 w-4 text-green-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified Identity</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
