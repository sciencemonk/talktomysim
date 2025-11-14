import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import PublicChatInterface from "@/components/PublicChatInterface";
import { IntegrationTiles } from "@/components/IntegrationTiles";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { AgentType } from "@/types/agent";
import { ArrowLeft, X } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";

const AgentPublicView = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Check if we're in an iframe
    setIsEmbedded(window.self !== window.top);
  }, []);

  const handleCloseEmbed = () => {
    // Send message to parent window to close the embed
    if (window.parent) {
      window.parent.postMessage('closeAgentEmbed', '*');
    }
  };

  const { data: agent, isLoading } = useQuery({
    queryKey: ['public-agent-view', agentId],
    queryFn: async () => {
      if (!agentId) throw new Error("Agent ID is required");

      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('id', agentId)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Agent not found");

      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        type: 'General Tutor' as const,
        status: 'active' as const,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        avatar: data.avatar_url,
        prompt: data.prompt,
        welcome_message: data.welcome_message,
        sim_category: data.sim_category,
        x402_enabled: data.x402_enabled,
        x402_price: data.x402_price,
        x402_wallet: data.x402_wallet,
        social_links: data.social_links,
        model: 'GPT-4',
        interactions: 0,
        studentsSaved: 0,
        helpfulnessScore: 0,
        avmScore: 0,
        csat: 0,
        performance: 0,
        channels: [],
        channelConfigs: {},
        isPersonal: false,
        voiceTraits: [],
      } as AgentType;
    },
    enabled: !!agentId,
  });

  const handleToggleIntegration = (integration: string) => {
    setSelectedIntegrations((prev) =>
      prev.includes(integration)
        ? prev.filter((i) => i !== integration)
        : [...prev, integration]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Agent not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {isEmbedded ? (
            <>
              <div className="flex items-center gap-3">
                {agent.avatar && (
                  <img 
                    src={getAvatarUrl(agent.avatar)} 
                    alt={agent.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-sm">{agent.name}</h3>
                  <p className="text-xs text-muted-foreground">AI Assistant</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseEmbed}
                className="h-9 w-9"
              >
                <X className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="h-9 w-9"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2"
                >
                  <img 
                    src={theme === 'dark' ? '/sim-logo-light-final.png' : '/sim-logo-new.png'}
                    alt="SIM" 
                    className="h-8 w-auto"
                  />
                </button>
              </div>
              
              <ThemeToggle />
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Interface - Left Side */}
        <div className="flex-1 flex flex-col">
          <PublicChatInterface 
            agent={agent}
            avatarUrl={getAvatarUrl(agent.avatar)}
          />
        </div>

        {/* MCP List - Right Side - Hidden when embedded */}
        {!isEmbedded && (
          <div className="w-80 border-l border-border bg-card/50 flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Model Context Protocol</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select integrations to enhance the conversation
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <IntegrationTiles
                selectedIntegrations={selectedIntegrations}
                onToggle={handleToggleIntegration}
              />
              
              <div className="mt-6 space-y-3">
                {selectedIntegrations.length > 0 && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm font-medium text-primary">
                      {selectedIntegrations.length} integration{selectedIntegrations.length > 1 ? 's' : ''} active
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentPublicView;
