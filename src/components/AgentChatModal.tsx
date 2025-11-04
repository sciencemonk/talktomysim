import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PublicChatInterface from "@/components/PublicChatInterface";
import { AgentType } from "@/types/agent";

interface AgentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentType;
  avatarUrl?: string;
}

export function AgentChatModal({ isOpen, onClose, agent, avatarUrl }: AgentChatModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Chat with {agent.name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <PublicChatInterface 
            agent={agent}
            avatarUrl={avatarUrl}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
