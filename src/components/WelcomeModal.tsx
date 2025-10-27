import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const WelcomeModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('sim-has-visited');
    if (!hasVisited) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    // Mark as visited
    localStorage.setItem('sim-has-visited', 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl p-8 bg-gray-900 border-gray-800">
        <div className="space-y-6 text-center">
          <h2 className="text-3xl font-bold text-white">How it works</h2>
          
          <p className="text-lg text-gray-300 leading-relaxed">
            Sim allows <span className="font-semibold" style={{ color: '#82f2aa' }}>anyone to create an AI agent</span> in seconds. 
            All agents created on Sim are fully customizable, meaning you can train them with your own knowledge 
            and personality to interact with your audience.
          </p>

          <div className="space-y-4 text-center py-4">
            <div className="text-gray-200">
              <span className="font-bold text-white">Step 1:</span> choose the type of AI agent you want to create
            </div>
            <div className="text-gray-200">
              <span className="font-bold text-white">Step 2:</span> customize your agent with knowledge and personality
            </div>
            <div className="text-gray-200">
              <span className="font-bold text-white">Step 3:</span> share your agent with the world or keep it private
            </div>
          </div>

          <Button 
            onClick={handleClose}
            size="lg"
            className="w-full text-lg py-6 text-black font-semibold"
            style={{ backgroundColor: '#82f2aa' }}
          >
            I'm ready to create
          </Button>

          <div className="flex justify-center gap-4 text-sm text-gray-400 pt-2">
            <Link to="/privacy" className="hover:text-gray-300 underline">
              Privacy policy
            </Link>
            <span>|</span>
            <Link to="/terms" className="hover:text-gray-300 underline">
              Terms of service
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
