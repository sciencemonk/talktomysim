import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { Badge } from "@/components/ui/badge";

export const SimLeaderboard = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
          style={{ backgroundColor: '#82f2aa', color: '#000' }}
        >
          <DollarSign className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <DollarSign className="h-6 w-6" style={{ color: '#82f2aa' }} />
            Creator Rewards
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-8 px-4 text-center">
          <div className="space-y-4">
            <div className="text-lg font-semibold">
              Earn $SimAI for launching a Sim
            </div>
            <div className="text-muted-foreground">
              Creator Rewards coming soon.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
