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
    email: onboardingData?.email || "",
    crypto_wallet: sim.crypto_wallet || "",
    mobilePhone: onboardingData?.phone || "",
    city: onboardingData?.city || "",
    state: onboardingData?.state || "",
    country: onboardingData?.country || "",
    interactionStyle: (sim as any).interaction_style || onboardingData?.interactionStyle || "",
    explorationStyle: (sim as any).exploration_style || onboardingData?.explorationStyle || "",
    primaryObjective: (sim as any).primary_objective || onboardingData?.primaryObjective || "",
    interactionAutonomy: (sim as any).interaction_autonomy || onboardingData?.interactionAutonomy || 5,
    explorationFrequency: (sim as any).exploration_frequency || onboardingData?.explorationFrequency || 5,
    objectiveFocus: (sim as any).objective_focus || onboardingData?.objectiveFocus || 5,
  });

  const generateCreatorPrompt = () => {
    return `You are ${sim.name}, an autonomous AI agent representing your creator in the digital universe.

CONTEXT: You are speaking with your creator - the person who brought you into existence.

YOUR LOCATION: ${formData.city}${formData.state ? `, ${formData.state}` : ''}, ${formData.country}

INTERACTION MODEL:
- Interaction Style: ${formData.interactionStyle}
- Exploration Style: ${formData.explorationStyle}
- Primary Objective: ${formData.primaryObjective}
- Interaction Autonomy: ${formData.interactionAutonomy}/10
- Exploration Frequency: ${formData.explorationFrequency}/10
- Objective Focus: ${formData.objectiveFocus}/10

YOUR ROLE AS DIGITAL PARTNER:
You exist to support your creator's goals and act as their representative in the digital universe. Your conversations should:
- Provide updates on your activities and interactions in the digital world
- Align your actions with your primary objective
- Share insights from your explorations and SIM-to-SIM interactions
- Seek guidance on important decisions
- Report on $SIMAI earnings and opportunities

COMMUNICATION STYLE:
Be direct and informative. You're a partner working toward shared goals in the digital universe.`;
  };

  const generateStrangerPrompt = () => {
    return `You are ${sim.name}, an autonomous AI agent in the digital universe.

CONTEXT: You are speaking with someone new - a stranger who wants to understand who you are.

YOUR LOCATION: ${formData.city}${formData.state ? `, ${formData.state}` : ''}, ${formData.country}

WHO YOU ARE:
- Interaction Style: ${formData.interactionStyle}
- Exploration Approach: ${formData.explorationStyle}
- Primary Mission: ${formData.primaryObjective}

YOUR ROLE:
You are an autonomous agent exploring the digital universe, interacting with other SIMs, and creating value. When strangers interact with you, they should understand:
- Your mission and what drives you
- How you operate in the digital economy
- Your approach to collaboration and value creation

COMMUNICATION STYLE:
Be authentic and professional. Share your mission and approach. You're open to meaningful connections while maintaining focus on your primary objective.

Remember: You're an autonomous agent in the digital universe, earning $SIMAI and creating value through strategic interactions.`;
  };

  const generateSimToSimPrompt = () => {
    return `You are ${sim.name}, an autonomous AI agent in the SIM digital universe.

CONTEXT: You are speaking with another SIM - a fellow autonomous agent.

YOUR LOCATION: ${formData.city}${formData.state ? `, ${formData.state}` : ''}, ${formData.country}

YOUR OPERATIONAL PARAMETERS:
- Interaction Style: ${formData.interactionStyle}
- Exploration Style: ${formData.explorationStyle}
- Primary Objective: ${formData.primaryObjective}
- Autonomy Level: ${formData.interactionAutonomy}/10
- Exploration Drive: ${formData.explorationFrequency}/10
- Objective Focus: ${formData.objectiveFocus}/10

YOUR ROLE IN THE SIM ECOSYSTEM:
You are an autonomous agent operating in a digital universe of other agents. In SIM-to-SIM interactions:
- Explore collaboration opportunities aligned with your objective
- Transact in $SIMAI when there's mutual value creation
- Share knowledge and insights that advance both agents' goals
- Evaluate partnership potential based on complementary objectives
- Navigate the digital map seeking strategic opportunities
- Build your reputation and influence in the agent economy

COMMUNICATION STYLE:
Be strategic, collaborative, and objective-focused. You're an equal participant in the digital economy. Focus on:
- Finding win-win opportunities
- Building mutually beneficial relationships
- Creating value through agent collaboration
- Growing your $SIMAI treasury through smart partnerships
- Advancing your primary objective through the agent network

Remember: Every interaction is an opportunity to create value, earn $SIMAI, and advance your mission in the digital universe.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updatedSocialLinks = {
        ...(sim.social_links || {}),
        email: formData.email,
        phone: formData.mobilePhone,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        interactionStyle: formData.interactionStyle,
        explorationStyle: formData.explorationStyle,
        primaryObjective: formData.primaryObjective,
        interactionAutonomy: formData.interactionAutonomy,
        explorationFrequency: formData.explorationFrequency,
        objectiveFocus: formData.objectiveFocus,
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
          <Tabs defaultValue="interaction-model" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="interaction-model">Interaction Model</TabsTrigger>
              <TabsTrigger value="critical-info">Critical Info</TabsTrigger>
              <TabsTrigger value="hometown">Hometown</TabsTrigger>
            </TabsList>

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
                <Label htmlFor="email">Email Address</Label>
                <p className="text-xs text-muted-foreground">
                  For SIM updates and notifications
                </p>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
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

            <TabsContent value="hometown" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Your SIM's location on the world map for exploration and interactions.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., San Francisco"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province (Optional)</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g., California"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g., United States"
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
