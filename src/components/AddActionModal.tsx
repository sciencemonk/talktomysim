import { useState, useEffect } from 'react';
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
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AddActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  simId: string;
  actionToEdit?: {
    id: string;
    description: string;
    end_goal: string;
    usdc_amount: number;
  };
  onActionSaved?: () => void;
}

export const AddActionModal = ({ open, onOpenChange, simId, actionToEdit, onActionSaved }: AddActionModalProps) => {
  const [description, setDescription] = useState('');
  const [endGoal, setEndGoal] = useState('');
  const [usdcAmount, setUsdcAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (actionToEdit) {
      setDescription(actionToEdit.description);
      setEndGoal(actionToEdit.end_goal);
      setUsdcAmount(actionToEdit.usdc_amount.toString());
    } else {
      setDescription('');
      setEndGoal('');
      setUsdcAmount('');
    }
  }, [actionToEdit, open]);

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
      if (actionToEdit) {
        // Update existing action
        const { error } = await supabase
          .from("sim_actions")
          .update({
            description: description.trim(),
            end_goal: endGoal.trim(),
            usdc_amount: usdcAmount ? parseFloat(usdcAmount) : 0,
          })
          .eq("id", actionToEdit.id);

        if (error) throw error;

        toast({
          title: "Action updated",
          description: "Your action has been updated successfully"
        });
      } else {
        // Create new action
        const { error } = await supabase
          .from("sim_actions")
          .insert({
            sim_id: simId,
            description: description.trim(),
            end_goal: endGoal.trim(),
            usdc_amount: usdcAmount ? parseFloat(usdcAmount) : 0,
          });

        if (error) throw error;

        toast({
          title: "Action added",
          description: "Your action has been created successfully"
        });
      }
      
      onActionSaved?.();
      onOpenChange(false);
      
      // Reset form
      setDescription('');
      setEndGoal('');
      setUsdcAmount('');
    } catch (error) {
      console.error("Error saving action:", error);
      toast({
        title: "Error",
        description: "Failed to save action. Please try again.",
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
          <DialogTitle>{actionToEdit ? "Edit Action" : "Add Action"}</DialogTitle>
          <DialogDescription>
            {actionToEdit ? "Update this action" : "Create a custom action that visitors can trigger on your public page"}
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
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionToEdit ? "Update Action" : "Add Action"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
