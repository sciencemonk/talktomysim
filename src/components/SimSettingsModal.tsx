import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Sim } from "@/types/sim";

interface SimSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sim: Sim;
  onSave: (updatedData: Partial<Sim>) => Promise<void>;
}

export const SimSettingsModal = ({ open, onOpenChange, sim, onSave }: SimSettingsModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    creator_prompt: sim.creator_prompt || "",
    stranger_prompt: sim.stranger_prompt || "",
    sim_to_sim_prompt: sim.sim_to_sim_prompt || "",
    crypto_wallet: sim.crypto_wallet || "",
    description: sim.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit SIM Settings</DialogTitle>
          <DialogDescription>
            Update your SIM's configuration and behavior
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="prompts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="prompts">System Prompts</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="prompts" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="creator_prompt">Creator Prompt</Label>
                <p className="text-xs text-muted-foreground">
                  How your SIM interacts with you (the creator)
                </p>
                <Textarea
                  id="creator_prompt"
                  value={formData.creator_prompt}
                  onChange={(e) => setFormData({ ...formData, creator_prompt: e.target.value })}
                  placeholder="Define how your SIM should talk to you..."
                  className="min-h-[120px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stranger_prompt">Stranger Prompt</Label>
                <p className="text-xs text-muted-foreground">
                  How your SIM interacts with public visitors
                </p>
                <Textarea
                  id="stranger_prompt"
                  value={formData.stranger_prompt}
                  onChange={(e) => setFormData({ ...formData, stranger_prompt: e.target.value })}
                  placeholder="Define how your SIM should talk to strangers..."
                  className="min-h-[120px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sim_to_sim_prompt">SIM-to-SIM Prompt</Label>
                <p className="text-xs text-muted-foreground">
                  How your SIM interacts with other SIMs
                </p>
                <Textarea
                  id="sim_to_sim_prompt"
                  value={formData.sim_to_sim_prompt}
                  onChange={(e) => setFormData({ ...formData, sim_to_sim_prompt: e.target.value })}
                  placeholder="Define how your SIM should talk to other SIMs..."
                  className="min-h-[120px] font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <p className="text-xs text-muted-foreground">
                  Public description shown on your SIM's profile
                </p>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your SIM..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crypto_wallet">Solana Wallet Address</Label>
                <p className="text-xs text-muted-foreground">
                  Where your SIM receives $SIMAI earnings
                </p>
                <Input
                  id="crypto_wallet"
                  value={formData.crypto_wallet}
                  onChange={(e) => setFormData({ ...formData, crypto_wallet: e.target.value })}
                  placeholder="Your Solana wallet address..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile_number">Mobile Number (Coming Soon)</Label>
                <p className="text-xs text-muted-foreground">
                  SMS capability to message your SIM directly
                </p>
                <Input
                  id="mobile_number"
                  disabled
                  placeholder="+1 (555) 000-0000"
                  className="opacity-50"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
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
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
