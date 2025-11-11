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
  const onboardingData = sim.social_links as any;
  const [formData, setFormData] = useState({
    appearance: onboardingData?.appearance || "",
    behavior: onboardingData?.behavior || "",
    coreValues: onboardingData?.coreValues || "",
    relationshipGoals: onboardingData?.relationshipGoals || "",
    financialGoals: onboardingData?.financialGoals || "",
    healthGoals: onboardingData?.healthGoals || "",
    crypto_wallet: sim.crypto_wallet || "",
    mobilePhone: onboardingData?.phone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updatedSocialLinks = {
        ...(sim.social_links || {}),
        appearance: formData.appearance,
        behavior: formData.behavior,
        coreValues: formData.coreValues,
        relationshipGoals: formData.relationshipGoals,
        financialGoals: formData.financialGoals,
        healthGoals: formData.healthGoals,
        phone: formData.mobilePhone,
      };
      
      await onSave({
        crypto_wallet: formData.crypto_wallet,
        social_links: updatedSocialLinks,
      });
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
          <Tabs defaultValue="ideal-self" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ideal-self">Ideal Self</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>

            <TabsContent value="ideal-self" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="appearance">Appearance & Style</Label>
                <p className="text-xs text-muted-foreground">
                  How do you want to dress and present yourself?
                </p>
                <Textarea
                  id="appearance"
                  value={formData.appearance}
                  onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                  placeholder="Describe your ideal appearance and style..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="behavior">Behavior</Label>
                <p className="text-xs text-muted-foreground">
                  How do you want to act?
                </p>
                <Textarea
                  id="behavior"
                  value={formData.behavior}
                  onChange={(e) => setFormData({ ...formData, behavior: e.target.value })}
                  placeholder="Describe how you want to behave..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coreValues">Core Values</Label>
                <p className="text-xs text-muted-foreground">
                  What truly matters to you?
                </p>
                <Textarea
                  id="coreValues"
                  value={formData.coreValues}
                  onChange={(e) => setFormData({ ...formData, coreValues: e.target.value })}
                  placeholder="Describe your core values..."
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="relationshipGoals">Relationship Goals (6 months)</Label>
                <p className="text-xs text-muted-foreground">
                  What do you want to achieve in your relationships?
                </p>
                <Textarea
                  id="relationshipGoals"
                  value={formData.relationshipGoals}
                  onChange={(e) => setFormData({ ...formData, relationshipGoals: e.target.value })}
                  placeholder="Describe your relationship goals..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="financialGoals">Financial Goals (6 months)</Label>
                <p className="text-xs text-muted-foreground">
                  What are your financial objectives?
                </p>
                <Textarea
                  id="financialGoals"
                  value={formData.financialGoals}
                  onChange={(e) => setFormData({ ...formData, financialGoals: e.target.value })}
                  placeholder="Describe your financial goals..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthGoals">Health Goals (6 months)</Label>
                <p className="text-xs text-muted-foreground">
                  What health improvements do you want to make?
                </p>
                <Textarea
                  id="healthGoals"
                  value={formData.healthGoals}
                  onChange={(e) => setFormData({ ...formData, healthGoals: e.target.value })}
                  placeholder="Describe your health goals..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="pt-4 border-t space-y-4">
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
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobilePhone">Mobile Number (Optional)</Label>
                  <p className="text-xs text-muted-foreground">
                    SMS capability to message your SIM (coming soon)
                  </p>
                  <Input
                    id="mobilePhone"
                    value={formData.mobilePhone}
                    onChange={(e) => setFormData({ ...formData, mobilePhone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
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
