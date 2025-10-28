import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Zap } from "lucide-react";

const STORAGE_KEY = "sim_hackathon_modal_seen";
const HACKATHON_END_DATE = new Date("2025-10-29T20:00:00-05:00"); // Oct 29, 2025 at 8pm CT

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const HackathonAnnouncementModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  // Calculate time remaining
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = HACKATHON_END_DATE.getTime();
      const distance = end - now;

      if (distance < 0) {
        return {
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        };
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      return {
        hours,
        minutes,
        seconds,
        isExpired: false,
      };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Check if modal should be shown
  useEffect(() => {
    const hasSeenModal = localStorage.getItem(STORAGE_KEY);
    const isExpired = timeRemaining.isExpired;
    
    // Only show if user hasn't seen it and hackathon hasn't expired
    if (!hasSeenModal && !isExpired) {
      // Small delay before showing
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [timeRemaining.isExpired]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-card via-card to-[#83f1aa]/10 border-2 border-[#83f1aa]/30">
        <DialogHeader>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-6 w-6 text-[#83f1aa]" />
            <DialogTitle className="text-2xl font-bold text-center">
              $SIMAI Hackathon ⏰💵
            </DialogTitle>
            <Zap className="h-6 w-6 text-[#83f1aa]" />
          </div>
          <DialogDescription className="text-center text-base">
            For the next 48 hours, every newly created Sim Chatbot will be entered into the $SIMAI Hackathon! To enter, go to the Sim X page and comment your Sim on the pinned post.
          </DialogDescription>
        </DialogHeader>

        {/* Countdown Timer */}
        <div className="flex items-center justify-center gap-2 my-6">
          <Clock className="h-5 w-5 text-[#83f1aa]" />
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center bg-[#83f1aa]/20 rounded-lg px-3 py-2 min-w-[60px] border border-[#83f1aa]/30">
              <span className="text-2xl font-bold text-[#83f1aa]">
                {formatNumber(timeRemaining.hours)}
              </span>
              <span className="text-xs text-muted-foreground">Hours</span>
            </div>
            <span className="text-2xl font-bold text-[#83f1aa]">:</span>
            <div className="flex flex-col items-center bg-[#83f1aa]/20 rounded-lg px-3 py-2 min-w-[60px] border border-[#83f1aa]/30">
              <span className="text-2xl font-bold text-[#83f1aa]">
                {formatNumber(timeRemaining.minutes)}
              </span>
              <span className="text-xs text-muted-foreground">Minutes</span>
            </div>
            <span className="text-2xl font-bold text-[#83f1aa]">:</span>
            <div className="flex flex-col items-center bg-[#83f1aa]/20 rounded-lg px-3 py-2 min-w-[60px] border border-[#83f1aa]/30">
              <span className="text-2xl font-bold text-[#83f1aa]">
                {formatNumber(timeRemaining.seconds)}
              </span>
              <span className="text-xs text-muted-foreground">Seconds</span>
            </div>
          </div>
        </div>

        {/* Prize Information */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30">
            <Trophy className="h-8 w-8 text-yellow-500 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-yellow-600 dark:text-yellow-400">1st Place</p>
              <p className="text-2xl font-bold">1 SOL</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-400/10 to-gray-500/10 border border-gray-400/30">
            <Trophy className="h-7 w-7 text-gray-400 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-gray-600 dark:text-gray-300">2nd Place</p>
              <p className="text-xl font-bold">0.5 SOL</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-600/10 to-orange-700/10 border border-orange-600/30">
            <Trophy className="h-6 w-6 text-orange-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-orange-700 dark:text-orange-400">3rd Place</p>
              <p className="text-lg font-bold">0.2 SOL</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <Button
          onClick={handleClose}
          className="w-full h-12 text-base font-semibold"
          style={{ backgroundColor: "#83f1aa", color: "#000" }}
        >
          Create Your Sim Now!
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-2">
          Ends Wednesday, October 29th at 8pm CT
        </p>
      </DialogContent>
    </Dialog>
  );
};
