import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface AddActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  simId: string;
  onActionAdded: () => void;
}

export const AddActionModal = ({ open, onOpenChange, simId, onActionAdded }: AddActionModalProps) => {
  const [description, setDescription] = useState('');
  const [endGoal, setEndGoal] = useState('');
  const [usdcAmount, setUsdcAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim() || !endGoal.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in both description and end goal",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Save to database - for now just showing success
      toast({
        title: "Action added",
        description: "Your action has been created successfully"
      });
      
      onActionAdded();
      onOpenChange(false);
      
      // Reset form
      setDescription('');
      setEndGoal('');
      setUsdcAmount('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add action",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Action</DialogTitle>
          <DialogDescription>
            Create a custom action that visitors can trigger on your public page
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Contact me"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endGoal">End Goal</Label>
            <Textarea
              id="endGoal"
              placeholder="e.g., Receive the visitor's email address and message"
              value={endGoal}
              onChange={(e) => setEndGoal(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usdcAmount">USDC Amount (Optional)</Label>
            <Input
              id="usdcAmount"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={usdcAmount}
              onChange={(e) => setUsdcAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank for free actions, or set a price to charge visitors
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Action'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
