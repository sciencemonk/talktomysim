import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import xLogo from "@/assets/x-logo.png";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { VerificationPendingModal } from "../VerificationPendingModal";

interface SignUpCTASectionProps {
  onSignUp: () => void;
}

export const SignUpCTASection = ({ onSignUp }: SignUpCTASectionProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState<{ editCode: string; xUsername: string } | null>(null);

  const generateEditCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleGenerateStore = async (e: React.FormEvent) => {
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

      // Check if agent already exists
      const { data: existingAgentByName } = await supabase
        .from('advisors')
        .select('id, edit_code, verification_status, social_links, is_verified')
        .eq('sim_category', 'Crypto Mail')
        .or(`name.eq.@${cleanUsername},name.eq.${cleanUsername}`)
        .maybeSingle();

      const { data: allAgents } = await supabase
        .from('advisors')
        .select('id, edit_code, verification_status, social_links, is_verified')
        .eq('sim_category', 'Crypto Mail');

      const existingAgent = existingAgentByName || allAgents?.find(agent => {
        const socialLinks = agent.social_links as any;
        return socialLinks?.x_username?.toLowerCase() === cleanUsername.toLowerCase();
      });

      if (existingAgent) {
        toast.error(`An X agent for @${cleanUsername} already exists. If this is your account, you should have received an edit code when it was created.`);
        setIsLoading(false);
        return;
      }

      // Create new agent
      const editCode = generateEditCode();

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
          verification_status: false,
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

      toast.success('X agent created successfully!');
      
      // Show verification modal for new agents
      setVerificationData({ editCode, xUsername: cleanUsername });
      setShowVerificationModal(true);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error creating X agent:', error);
      toast.error('Failed to create X agent: ' + (error.message || 'Unknown error'));
      setIsLoading(false);
    }
  };

  return (
    <section className="relative h-[60vh] flex flex-col overflow-hidden bg-background border-b">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://uovhemqkztmkoozlmqxq.supabase.co/storage/v1/object/sign/trimtab/7585041-hd_1920_1080_25fps.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDZlOGY2My1iYjgzLTQwOGQtYjc1Mi1mOWM0OTMxZjU3OGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0cmltdGFiLzc1ODUwNDEtaGRfMTkyMF8xMDgwXzI1ZnBzLm1wNCIsImlhdCI6MTc2MjMxNzcyNiwiZXhwIjoxNzkzODUzNzI2fQ.YazfV5ZLdQvHRutUaHvxn1i_Ok4gMX9AnCqw-TbuX_o"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto w-full">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold mb-6 tracking-tight text-foreground">
          Ready to Start Selling?
        </h2>

        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl">
          Create your agentic storefront in minutes. No technical knowledge required.
        </p>

        <form onSubmit={handleGenerateStore} className="w-full max-w-md">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter your X username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="flex-1 h-[56px] bg-background/80 backdrop-blur-sm border-border/50 text-foreground placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="gap-2 font-bold px-8 py-5 text-base transition-all duration-300 bg-[#82f3aa] hover:bg-[#6dd991] text-black border-0 shadow-xl shadow-[#82f3aa]/30 hover:shadow-2xl hover:shadow-[#82f3aa]/40 hover:scale-105 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate with <img src={xLogo} alt="X" className="h-5 w-5 inline-block" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {verificationData && (
        <VerificationPendingModal
          open={showVerificationModal}
          onOpenChange={(open) => {
            setShowVerificationModal(open);
            if (!open) {
              navigate(`/${verificationData.xUsername}/creator?code=${verificationData.editCode}`);
            }
          }}
          editCode={verificationData.editCode}
          xUsername={verificationData.xUsername}
        />
      )}
    </section>
  );
};
