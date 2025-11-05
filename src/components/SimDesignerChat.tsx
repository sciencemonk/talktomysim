import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import designerAvatar from "@/assets/designer-avatar.gif";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface SimDesignerChatProps {
  agentId: string;
  editCode: string;
  currentDesignSettings: any;
  socialLinks: any;
  onDesignUpdate: (settings: any) => void;
}

export const SimDesignerChat = ({ 
  agentId, 
  editCode, 
  currentDesignSettings,
  socialLinks,
  onDesignUpdate 
}: SimDesignerChatProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <img
          src={designerAvatar}
          alt="SIM Designer"
          className="w-full h-full rounded-full object-cover"
        />
      </button>

      {/* Coming Soon Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <img
                src={designerAvatar}
                alt="SIM Designer"
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
            <DialogTitle className="text-center text-2xl">SIM Designer</DialogTitle>
            <DialogDescription className="text-center space-y-4 pt-4">
              <div className="flex items-center justify-center gap-2 text-primary font-semibold text-lg">
                <Sparkles className="w-5 h-5" />
                <span>Coming Soon</span>
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-base">
                SIM Designer is an AI-powered assistant that will help you customize your storefront's design with simple natural language commands.
              </p>
              <div className="text-sm text-muted-foreground space-y-2 pt-2">
                <p><strong>What you'll be able to do:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-left">
                  <li>Change colors and themes instantly</li>
                  <li>Update header images and backgrounds</li>
                  <li>Customize layout and spacing</li>
                  <li>Preview changes in real-time</li>
                  <li>Revert to default with one click</li>
                </ul>
              </div>
              <p className="text-sm italic pt-2">
                Stay tuned for this exciting feature!
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={() => setIsOpen(false)} className="w-full">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};