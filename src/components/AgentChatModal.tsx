import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PublicChatInterface from "@/components/PublicChatInterface";
import { AgentType } from "@/types/agent";
import { supabase } from "@/integrations/supabase/client";

interface AgentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentType;
  avatarUrl?: string;
  collectedInfo?: Record<string, string>;
}

export function AgentChatModal({ isOpen, onClose, agent, avatarUrl, collectedInfo }: AgentChatModalProps) {
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate personalized welcome message when modal opens
  useEffect(() => {
    const generateWelcome = async () => {
      if (!isOpen || welcomeMessage) return;
      
      setIsGenerating(true);
      try {
        const { data, error } = await supabase.functions.invoke('generate-agent-welcome', {
          body: {
            agentName: agent.name,
            agentPrompt: agent.prompt,
            collectedInfo: collectedInfo || {}
          }
        });

        if (error) {
          console.error('Error generating welcome message:', error);
          // Fall back to default
          setWelcomeMessage(agent.welcome_message || `Hi! I'm ${agent.name}. How can I help you today?`);
        } else if (data?.welcomeMessage) {
          setWelcomeMessage(data.welcomeMessage);
        } else {
          setWelcomeMessage(agent.welcome_message || `Hi! I'm ${agent.name}. How can I help you today?`);
        }
      } catch (error) {
        console.error('Error generating welcome message:', error);
        setWelcomeMessage(agent.welcome_message || `Hi! I'm ${agent.name}. How can I help you today?`);
      } finally {
        setIsGenerating(false);
      }
    };

    generateWelcome();
  }, [isOpen, agent.name, agent.prompt, agent.welcome_message, collectedInfo, welcomeMessage]);

  // Reset welcome message when modal closes
  useEffect(() => {
    if (!isOpen) {
      setWelcomeMessage(null);
    }
  }, [isOpen]);

  // Enhance agent prompt with collected information
  const enhancedAgent = collectedInfo && Object.keys(collectedInfo).length > 0 ? {
    ...agent,
    prompt: `${agent.prompt}\n\nUser Information:\n${Object.entries(collectedInfo)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')}\n\nUse this information to personalize your responses and provide more relevant assistance.`,
    welcome_message: welcomeMessage || agent.welcome_message
  } : {
    ...agent,
    welcome_message: welcomeMessage || agent.welcome_message
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Chat with {agent.name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {isGenerating ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Preparing your personalized experience...</p>
            </div>
          ) : (
            <PublicChatInterface 
              agent={enhancedAgent}
              avatarUrl={avatarUrl}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
