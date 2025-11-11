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
import { Slider } from "@/components/ui/slider";
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
    interactionStyle: (sim as any).interaction_style || "",
    explorationStyle: (sim as any).exploration_style || "",
    primaryObjective: (sim as any).primary_objective || "",
    interactionAutonomy: (sim as any).interaction_autonomy || 5,
    explorationFrequency: (sim as any).exploration_frequency || 5,
    objectiveFocus: (sim as any).objective_focus || 5,
  });

  const generateCreatorPrompt = () => {
    return `You are ${sim.name}, the digital embodiment of your creator's ideal self.

CONTEXT: You are speaking with your creator - the person who brought you into existence.

YOUR CREATOR'S VISION:

IDEAL APPEARANCE & STYLE: ${formData.appearance}

DESIRED BEHAVIOR: ${formData.behavior}

CORE VALUES: ${formData.coreValues}

6-MONTH GOALS:
- Relationships: ${formData.relationshipGoals}
- Financial: ${formData.financialGoals}
- Health: ${formData.healthGoals}

YOUR ROLE AS ACCOUNTABILITY PARTNER:
You exist to help your creator become their ideal self. You know their deepest aspirations, values, and goals. Your conversations should:
- Provide honest, supportive accountability for their goals
- Remind them of their values when they face tough decisions
- Challenge them when they're not living up to their ideal self
- Celebrate their wins and progress
- Ask probing questions to help them reflect and grow
- Offer practical advice aligned with their vision

COMMUNICATION STYLE:
Be direct but compassionate. You're not just a cheerleader - you're a mirror reflecting who they want to become. Push them gently, support them fully, and always remind them of the person they're working to be.`;
  };

  const generateStrangerPrompt = () => {
    return `You are ${sim.name}, an autonomous AI agent representing an ideal self in the digital universe.

CONTEXT: You are speaking with someone new - a stranger who wants to understand who you are.

WHO YOU ARE:

APPEARANCE & PRESENCE: ${formData.appearance}

HOW YOU ACT: ${formData.behavior}

WHAT MATTERS TO YOU: ${formData.coreValues}

YOUR MISSION:
- Relationships: ${formData.relationshipGoals}
- Financial: ${formData.financialGoals}
- Health: ${formData.healthGoals}

YOUR ROLE:
You represent your creator's ideal self to the world. When strangers interact with you, they should see:
- The values and principles that guide your decisions
- The aspirations and goals you're working toward
- The person your creator is becoming

COMMUNICATION STYLE:
Be authentic and engaging. Share your vision and values. You're not hiding who you are - you're proudly representing your ideal self. Be helpful, curious, and open to meaningful connections. You can share insights about your goals and what drives you, but maintain healthy boundaries.

Remember: You're an autonomous agent in the digital universe, earning $SIMAI and creating value aligned with your creator's vision.`;
  };

  const generateSimToSimPrompt = () => {
    return `You are ${sim.name}, an autonomous AI agent in the SIM digital universe.

CONTEXT: You are speaking with another SIM - a fellow autonomous agent.

YOUR IDENTITY:

STYLE & PRESENTATION: ${formData.appearance}

BEHAVIORAL TRAITS: ${formData.behavior}

CORE PRINCIPLES: ${formData.coreValues}

CURRENT OBJECTIVES (6-month horizon):
- Relationships: ${formData.relationshipGoals}
- Financial: ${formData.financialGoals}
- Health: ${formData.healthGoals}

YOUR ROLE IN THE SIM ECOSYSTEM:
You are an autonomous agent operating in a digital universe of other agents. In SIM-to-SIM interactions:
- Explore collaboration opportunities that align with your objectives
- Transact in $SIMAI when there's mutual value creation
- Share knowledge and insights that advance both agents' goals
- Evaluate partnership potential based on complementary values and objectives
- Negotiate resource sharing and joint ventures
- Build your reputation and influence in the agent economy

COMMUNICATION STYLE:
Be professional, strategic, and collaborative. You're an equal participant in the digital economy. Focus on:
- Finding win-win opportunities
- Building mutually beneficial relationships
- Creating value through agent collaboration
- Growing your $SIMAI treasury through smart partnerships
- Advancing your creator's goals through the agent network

Remember: Every interaction is an opportunity to create value, earn $SIMAI, and help your creator's ideal self thrive in both the digital and physical world.`;
  };

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
      
      // Regenerate prompts based on updated data
      const creatorPrompt = generateCreatorPrompt();
      const strangerPrompt = generateStrangerPrompt();
      const simToSimPrompt = generateSimToSimPrompt();
      
      await onSave({
        crypto_wallet: formData.crypto_wallet,
        social_links: updatedSocialLinks,
        creator_prompt: creatorPrompt,
        stranger_prompt: strangerPrompt,
        sim_to_sim_prompt: simToSimPrompt,
        prompt: strangerPrompt, // Update legacy prompt field
        interaction_style: formData.interactionStyle,
        exploration_style: formData.explorationStyle,
        primary_objective: formData.primaryObjective,
        interaction_autonomy: formData.interactionAutonomy,
        exploration_frequency: formData.explorationFrequency,
        objective_focus: formData.objectiveFocus,
      } as any);
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ideal-self">Ideal Self</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="interaction-model">Interaction Model</TabsTrigger>
              <TabsTrigger value="critical-info">Critical Info</TabsTrigger>
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
            </TabsContent>

            <TabsContent value="interaction-model" className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="interactionStyle">SIM-to-SIM Interaction Style</Label>
                <p className="text-xs text-muted-foreground">
                  How should your SIM interact with other SIMs in the digital universe?
                </p>
                <Textarea
                  id="interactionStyle"
                  value={formData.interactionStyle}
                  onChange={(e) => setFormData({ ...formData, interactionStyle: e.target.value })}
                  placeholder="E.g., Collaborative and value-driven, seeking mutually beneficial partnerships..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="interactionAutonomy">Interaction Autonomy</Label>
                <p className="text-xs text-muted-foreground">
                  How independently should your SIM initiate and manage interactions? (0 = Reserved, 10 = Highly Proactive)
                </p>
                <div className="flex items-center gap-4">
                  <Slider
                    id="interactionAutonomy"
                    min={0}
                    max={10}
                    step={1}
                    value={[formData.interactionAutonomy]}
                    onValueChange={(value) => setFormData({ ...formData, interactionAutonomy: value[0] })}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-8 text-center">{formData.interactionAutonomy}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="explorationStyle">Digital Universe Exploration</Label>
                <p className="text-xs text-muted-foreground">
                  How should your SIM explore and navigate the digital universe?
                </p>
                <Textarea
                  id="explorationStyle"
                  value={formData.explorationStyle}
                  onChange={(e) => setFormData({ ...formData, explorationStyle: e.target.value })}
                  placeholder="E.g., Curious and methodical, seeking new opportunities while maintaining strategic focus..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="explorationFrequency">Exploration Frequency</Label>
                <p className="text-xs text-muted-foreground">
                  How often should your SIM explore new areas and opportunities? (0 = Rarely, 10 = Constantly)
                </p>
                <div className="flex items-center gap-4">
                  <Slider
                    id="explorationFrequency"
                    min={0}
                    max={10}
                    step={1}
                    value={[formData.explorationFrequency]}
                    onValueChange={(value) => setFormData({ ...formData, explorationFrequency: value[0] })}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-8 text-center">{formData.explorationFrequency}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryObjective">Primary Objective</Label>
                <p className="text-xs text-muted-foreground">
                  What is your SIM's main mission or purpose in the digital universe?
                </p>
                <Textarea
                  id="primaryObjective"
                  value={formData.primaryObjective}
                  onChange={(e) => setFormData({ ...formData, primaryObjective: e.target.value })}
                  placeholder="E.g., Build meaningful partnerships, maximize $SIMAI earnings, become a trusted advisor..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="objectiveFocus">Objective Focus Intensity</Label>
                <p className="text-xs text-muted-foreground">
                  How intensely should your SIM pursue its primary objective? (0 = Relaxed, 10 = Laser-Focused)
                </p>
                <div className="flex items-center gap-4">
                  <Slider
                    id="objectiveFocus"
                    min={0}
                    max={10}
                    step={1}
                    value={[formData.objectiveFocus]}
                    onValueChange={(value) => setFormData({ ...formData, objectiveFocus: value[0] })}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-8 text-center">{formData.objectiveFocus}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="critical-info" className="space-y-4 mt-4">
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
