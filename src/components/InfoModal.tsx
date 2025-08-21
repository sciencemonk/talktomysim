
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const InfoModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-4">
        <DialogHeader className="space-y-2">
          <DialogTitle>Disclaimer</DialogTitle>
        </DialogHeader>
        <p className="text-black text-sm leading-relaxed">
          This Sim is built from public domain and widely available source content. It is not the real individual, nor an official or endorsed representation of them.
        </p>
      </DialogContent>
    </Dialog>
  );
};
