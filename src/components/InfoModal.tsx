
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InfoModalProps {
  agentName?: string;
}

export const InfoModal = ({ agentName }: InfoModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-6">
        <div className="text-center space-y-4">
          <h2 className="text-lg font-semibold text-black">This is a Sim</h2>
          <p className="text-black text-sm leading-relaxed">
            This Sim is an AI powered representation of {agentName || "this individual"}. It is not the real individual and may make responses that aren't endorsed by its creator.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
