import { useState, useEffect } from "react";
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
import { DollarSign, Clock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { Badge } from "@/components/ui/badge";

export const SimLeaderboard = () => {
  const [open, setOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // November 2, 2025 at 12am CT (which is 6am UTC on November 2)
      const targetDate = new Date('2025-11-02T06:00:00Z');
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

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
        
        <div className="py-6 px-4 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              Next Payout
            </div>
            <div className="flex items-center justify-center gap-3 text-3xl font-bold">
              <div className="flex flex-col items-center">
                <span>{timeLeft.days}</span>
                <span className="text-xs text-muted-foreground font-normal">days</span>
              </div>
              <span>:</span>
              <div className="flex flex-col items-center">
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground font-normal">hours</span>
              </div>
              <span>:</span>
              <div className="flex flex-col items-center">
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground font-normal">mins</span>
              </div>
              <span>:</span>
              <div className="flex flex-col items-center">
                <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground font-normal">secs</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="text-lg font-semibold text-center">
              2 SOL Prize Pool
            </div>
            <div className="text-sm text-muted-foreground text-center">
              The top 10 most popular Sim chatbots with SOL wallets will receive a % distribution of 2 SOL paid in $SimAI tokens.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
