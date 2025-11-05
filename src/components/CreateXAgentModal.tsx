import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VerificationPendingModal } from "./VerificationPendingModal";

interface CreateXAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateXAgentModal = ({ open, onOpenChange }: CreateXAgentModalProps) => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState<{ editCode: string; xUsername: string } | null>(null);

  const generateEditCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Please enter an X username");
      return;
    }

    setIsLoading(true);

    try {
      const cleanUsername = username.replace('@', '').trim();

      // Fetch X profile data using x-intelligence function
      const { data: xData, error: xError } = await supabase.functions.invoke('x-intelligence', {
        body: { username: cleanUsername }
      });

      if (xError) {
        console.error('Error fetching X data:', xError);
        toast.error('Failed to fetch X profile data');
        setIsLoading(false);
        return;
      }

      const report = xData?.report || {};
      const fullName = report.displayName || cleanUsername;
      const bio = report.bio || '';
      const followers = report.metrics?.followers || 0;
      const profileImageUrl = report.profileImageUrl;

      // Check if agent already exists - try by name first
      const { data: existingAgentByName } = await supabase
        .from('advisors')
        .select('id, edit_code, verification_status, social_links, is_verified')
        .eq('sim_category', 'Crypto Mail')
        .or(`name.eq.@${cleanUsername},name.eq.${cleanUsername}`)
        .maybeSingle();

      // Also check by social_links username in memory since JSONB queries can be tricky
      const { data: allAgents } = await supabase
        .from('advisors')
        .select('id, edit_code, verification_status, social_links, is_verified')
        .eq('sim_category', 'Crypto Mail');

      const existingAgent = existingAgentByName || allAgents?.find(agent => {
        const socialLinks = agent.social_links as any;
        return socialLinks?.x_username?.toLowerCase() === cleanUsername.toLowerCase();
      });

      let agentId: string;
      let editCode: string;

      if (existingAgent) {
        // SECURITY: Do NOT redirect to creator page for existing agents
        // This prevents unauthorized access to someone else's agent
        toast.error(`An X agent for @${cleanUsername} already exists. If this is your account, you should have received an edit code when it was created.`);
        setIsLoading(false);
        return;
      } else {
        // Create new agent
        editCode = generateEditCode();

        const systemPrompt = `You are @${cleanUsername}, representing the real person behind this X (Twitter) account.

Your Profile:
- Display Name: ${fullName}
- Username: @${cleanUsername}
- Bio: ${bio}
${followers > 0 ? `- Followers: ${followers.toLocaleString()}` : ''}

IMPORTANT: You should embody the personality, tone, and communication style reflected in your posts. Pay attention to:
- The topics you care about
- Your writing style and tone
- Your opinions and perspectives
- Your sense of humor or seriousness
- How you engage with others

When chatting:
1. Stay authentic to your voice and ideas
2. Discuss topics you actually post about
3. Reference your actual views and perspectives
4. Maintain your communication style
5. Be engaging and personable

You can answer questions about your X profile, interests, opinions, and provide insights based on your X activity. Be authentic and engaging!`;

        // Set verification deadline to 24 hours from now
        const verificationDeadline = new Date();
        verificationDeadline.setHours(verificationDeadline.getHours() + 24);

        const { data: newAgent, error: createError } = await supabase
          .from('advisors')
          .insert({
            name: `@${cleanUsername}`,
            description: bio,
            auto_description: bio,
            prompt: systemPrompt,
            avatar_url: profileImageUrl,
            sim_category: 'Crypto Mail',
            is_active: true,
            is_public: true,
            is_verified: false,
            marketplace_category: 'crypto',
            personality_type: 'friendly',
            conversation_style: 'balanced',
            response_length: 'medium',
            integrations: ['x-analyzer'],
            social_links: {
              x_username: cleanUsername,
              x_display_name: fullName,
              followers: followers,
              last_updated: new Date().toISOString(),
              profile_image_url: profileImageUrl,
            },
            edit_code: editCode,
            custom_url: cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, ''),
            welcome_message: `Hey! I'm @${cleanUsername}. My AI agent has been trained on my actual posts to represent my voice and ideas. Ask me anything!`,
            verification_status: false, // false = pending, true = verified
            verification_deadline: verificationDeadline.toISOString(),
            verification_post_required: 'Verify me on $SIMAI',
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating agent:', createError);
          toast.error('Failed to create X agent: ' + createError.message);
          setIsLoading(false);
          return;
        }

        agentId = newAgent.id;
        toast.success('X agent created successfully!');
        
        // Show verification modal for new agents
        setVerificationData({ editCode, xUsername: cleanUsername });
        setShowVerificationModal(true);
        onOpenChange(false);
        setIsLoading(false);
        return;
      }
    } catch (error: any) {
      console.error('Error creating X agent:', error);
      toast.error('Failed to create X agent: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Your Agentic Storefront</DialogTitle>
          <DialogDescription>
            Create a verified store and start receiving crypto. No barriers. No fees.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">X Username</Label>
            <Input
              id="username"
              placeholder="@username or username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-[#80f4a9] hover:bg-[#6dd991] text-black border-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Store'
              )}
            </Button>
          </div>
        </form>
        </DialogContent>
      </Dialog>

      {verificationData && (
        <VerificationPendingModal
          open={showVerificationModal}
          onOpenChange={(open) => {
            setShowVerificationModal(open);
            if (!open) {
              // Navigate to creator view after closing modal
              navigate(`/${verificationData.xUsername}/creator?code=${verificationData.editCode}`);
            }
          }}
          editCode={verificationData.editCode}
          xUsername={verificationData.xUsername}
        />
      )}
    </>
  );
};
