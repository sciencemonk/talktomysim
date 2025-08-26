import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-0">
          <div className="text-center w-full mb-6">
            <img src="/about-logo.svg" alt="Talk to My Sim Logo" className="h-20 inline-block" />
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-xl font-medium mb-6">
              Replace your email. Get back your time and attention.
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Your Sim is a digital representation of you. An AI layer between you and the rest of the world. It can handle communications, answer questions, and perform tasks on your behalf.
            </p>
            
            <p className="text-muted-foreground">
              A world-class executive assistant for everyone.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" size="sm">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AboutModal;
