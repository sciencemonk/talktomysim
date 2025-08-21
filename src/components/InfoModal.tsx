
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const InfoModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Info className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>About This Sim</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            This Sim is built from public domain and widely available source content. It is not the real individual, nor an official or endorsed representation of them.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
