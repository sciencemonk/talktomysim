import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { Badge } from "@/components/ui/badge";
import { AgentType } from "@/types/agent";
import xLogo from "@/assets/x-logo.png";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { VerificationPendingModal } from "../VerificationPendingModal";

interface MatrixHeroSectionProps {
  onCreateXAgent: () => void;
  onSimClick: (sim: AgentType) => void;
  onViewAllAgents: () => void;
}

export const MatrixHeroSection = ({ onCreateXAgent, onSimClick, onViewAllAgents }: MatrixHeroSectionProps) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState<{ editCode: string; xUsername: string } | null>(null);

  const { data: topStores } = useQuery({
    queryKey: ['top-stores-hero'],
    queryFn: async () => {
      const { data: agents, error } = await supabase
        .from('advisors')
        .select('id, name, avatar_url, social_links')
        .eq('is_active', true)
        .eq('sim_category', 'Crypto Mail')
        .limit(100);

      if (error) throw error;

      const agentsWithFollowers = (agents || []).map(agent => ({
        ...agent,
        followers: (agent.social_links as any)?.followers || 0,
      }));

      return agentsWithFollowers
        .filter(agent => agent.followers > 0)
        .sort((a, b) => b.followers - a.followers)
        .slice(0, 10);
    },
    staleTime: 1000 * 60 * 60,
  });

  const getAvatarSrc = (avatarUrl: string | null) => {
    if (avatarUrl && avatarUrl.includes('pbs.twimg.com')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}`;
    }
    return avatarUrl;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const handleStoreClick = (agent: any) => {
    const xUsername = (agent.social_links as any)?.x_username;
    if (xUsername) {
      navigate(`/${xUsername}`);
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText("FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump");
      toast.success("Address copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

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
    <section className="relative min-h-[80vh] flex flex-col overflow-hidden bg-background pb-0">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://uovhemqkztmkoozlmqxq.supabase.co/storage/v1/object/sign/trimtab/4426378-uhd_3840_2160_25fps.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDZlOGY2My1iYjgzLTQwOGQtYjc1Mi1mOWM0OTMxZjU3OGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0cmltdGFiLzQ0MjYzNzgtdWhkXzM4NDBfMjE2MF8yNWZwcy5tcDQiLCJpYXQiOjE3NjIzMTYzOTgsImV4cCI6MTc5Mzg1MjM5OH0.m-yCbNjzr3XR15fzejjFmaZNqbtC-fU0_J9aUDlTEd8" type="video/mp4" />
      </video>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Top Bar with Logo and Badge */}
      <div className="absolute top-0 left-0 right-0 z-50 w-full px-4 py-6 flex items-center justify-between">
        <img
          src={theme === "dark" ? "/sim-logo-dark.png" : "/sim-logo-light-final.png"}
          alt="Sim Logo"
          className="h-10 w-10 object-contain"
          onError={(e) => {
            e.currentTarget.src = "/sim-logo.png";
          }}
        />
        <Badge 
          onClick={handleCopyAddress}
          className="cursor-pointer bg-[#82f3aa]/20 hover:bg-[#82f3aa]/30 text-[#82f3aa] border-[#82f3aa]/40 font-bold px-4 py-2 transition-all duration-300 hover:scale-105"
        >
          $SIMAI
        </Badge>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-24 text-center max-w-5xl mx-auto w-full">
        {/* Powered by badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50">
          <span className="text-xs sm:text-sm text-muted-foreground font-medium">Powered by</span>
          <span className="text-xs sm:text-sm font-bold text-foreground">x402</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold mb-4 tracking-tight text-foreground text-center w-full">
          Turn your X account into a money making machine
        </h1>
        
        {/* Zero fees text */}
        <p className="text-sm sm:text-base text-[#82f3aa] font-semibold mb-3">
          Accept crypto payments instantly with zero fees — powered by x402
        </p>
        
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl leading-relaxed">
          No middlemen. No transaction fees. Just pure profit.
        </p>

        <form onSubmit={handleGenerateStore} className="w-full max-w-md mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="@username or username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="flex-1 h-auto py-5 bg-background/80 backdrop-blur-sm border-border/50 text-foreground placeholder:text-muted-foreground text-base"
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

        <button
          onClick={onViewAllAgents}
          className="text-sm text-muted-foreground hover:text-[#82f3aa] hover:underline transition-all duration-300 font-medium mb-16"
        >
          Learn More
        </button>
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
