import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PublicChatInterface from "@/components/PublicChatInterface";
import { AgentType } from "@/types/agent";

interface AgentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentType;
  avatarUrl?: string;
  collectedInfo?: Record<string, string>;
}

export function AgentChatModal({ isOpen, onClose, agent, avatarUrl, collectedInfo }: AgentChatModalProps) {
  // Enhance agent prompt with collected information
  const enhancedAgent = collectedInfo && Object.keys(collectedInfo).length > 0 ? {
    ...agent,
    prompt: `${agent.prompt}\n\nUser Information:\n${Object.entries(collectedInfo)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')}\n\nUse this information to personalize your responses and provide more relevant assistance.`
  } : agent;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Chat with {agent.name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <PublicChatInterface 
            agent={enhancedAgent}
            avatarUrl={avatarUrl}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
