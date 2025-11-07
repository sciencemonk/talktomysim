import { Store, Share2, Wallet } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const HowItWorksSection = () => {
  const navigate = useNavigate();
  // Fetch X agents for the scroller
  const { data: xAgents } = useQuery({
    queryKey: ['x-agents-tiles'],
    queryFn: async () => {
      const { data: agents, error } = await supabase
        .from('advisors')
        .select('id, name, avatar_url, social_links, created_at')
        .eq('is_active', true)
        .eq('sim_category', 'Crypto Mail')
        .limit(100);
      
      if (error) throw error;
      
      const agentsWithFollowers = (agents || []).map(agent => ({
        ...agent,
        followers: (agent.social_links as any)?.followers || 0
      }));

      // Sort by followers (if available), then by creation date
      return agentsWithFollowers
        .sort((a, b) => {
          // First sort by follower count (descending)
          if (b.followers !== a.followers) {
            return b.followers - a.followers;
          }
          // If followers are equal (or both 0), sort by creation date (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
        .slice(0, 25);
    },
    staleTime: 1000 * 60 * 60
  });

  const getAvatarSrc = (avatarUrl: string | null) => {
    if (avatarUrl) {
      let processedUrl = avatarUrl;
      // If it's a Twitter image with _normal, upgrade to _400x400 for high resolution
      if (processedUrl.includes('pbs.twimg.com') && processedUrl.includes('_normal')) {
        processedUrl = processedUrl.replace('_normal', '_400x400');
      }
      if (processedUrl.includes('pbs.twimg.com')) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(processedUrl)}`;
      }
      return processedUrl;
    }
    return avatarUrl;
  };

  const handleAgentClick = (agent: any) => {
    const xUsername = (agent.social_links as any)?.x_username;
    if (xUsername) {
      navigate(`/${xUsername}`);
    }
  };

  const steps = [
    {
      number: "1",
      icon: Store,
      title: "Connect your X account",
      description: "Sign in with X to instantly create your crypto-enabled store. Customize your offerings, set prices in USDC, and add your Solana wallet address—all in minutes, no coding required."
    },
    {
      number: "2",
      icon: Share2,
      title: "Share your store",
      description: "Your unique store link can be shared anywhere—X bio, Discord, Telegram, or embedded on your website. One link, unlimited reach across all your channels."
    },
    {
      number: "3",
      icon: Wallet,
      title: "Receive instant payments",
      description: "Get notified instantly when customers pay. USDC transfers directly to your Solana wallet with zero transaction fees—no middlemen, no waiting, just pure profit."
    }
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm md:text-base text-gray-600 mb-2 uppercase tracking-wider">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Accept crypto payments in minutes, without writing code
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.number}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Connector line - hidden on mobile, shown on desktop between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#635BFF] to-transparent opacity-30" />
                )}
                
                {/* Number badge */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#635BFF]/20 to-[#635BFF]/5 border border-[#635BFF]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-9 h-9 text-[#635BFF]" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#635BFF] text-white font-bold flex items-center justify-center text-sm shadow-lg">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA hint */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-600 mb-8">
            Join creators already earning with <span className="text-[#635BFF] font-semibold">zero fees</span>
          </p>
          
          {/* X Agents Scroller */}
          {xAgents && xAgents.length > 0 && (
            <div className="w-full py-8 overflow-hidden">
              <div className="relative">
                <div className="flex gap-3 animate-scroll-mobile md:animate-scroll hover:pause-animation px-4">
                  {/* First set */}
                  {xAgents.map(agent => (
                    <button 
                      key={`first-${agent.id}`} 
                      onClick={() => handleAgentClick(agent)} 
                      className="flex-shrink-0 transition-all duration-300 hover:scale-110 hover:opacity-80 cursor-pointer"
                    >
                      <Avatar className="w-[6.21rem] h-[6.21rem] md:w-[6.9rem] md:h-[6.9rem] rounded-xl shadow-md">
                        <AvatarImage 
                          src={getAvatarSrc(agent.avatar_url)} 
                          alt={agent.name} 
                          referrerPolicy="no-referrer" 
                          crossOrigin="anonymous" 
                          className="rounded-xl object-cover" 
                        />
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm rounded-xl">
                          {agent.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  ))}
                  {/* Duplicate set for seamless loop */}
                  {xAgents.map(agent => (
                    <button 
                      key={`second-${agent.id}`} 
                      onClick={() => handleAgentClick(agent)} 
                      className="flex-shrink-0 transition-all duration-300 hover:scale-110 hover:opacity-80 cursor-pointer"
                    >
                      <Avatar className="w-[6.21rem] h-[6.21rem] md:w-[6.9rem] md:h-[6.9rem] rounded-xl shadow-md">
                        <AvatarImage 
                          src={getAvatarSrc(agent.avatar_url)} 
                          alt={agent.name} 
                          referrerPolicy="no-referrer" 
                          crossOrigin="anonymous" 
                          className="rounded-xl object-cover" 
                        />
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm rounded-xl">
                          {agent.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
