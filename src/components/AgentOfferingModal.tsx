import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, DollarSign } from "lucide-react";
import PublicChatInterface from "./PublicChatInterface";

interface Agent {
  id: string;
  name: string;
  description: string;
  avatar_url?: string;
  media_url?: string;
}

interface AgentOfferingModalProps {
  isOpen: boolean;
  onClose: () => void;
  offering: {
    id: string;
    title: string;
    description: string;
    price: number;
    media_url?: string;
  };
  agentData: {
    id: string;
    name: string;
    description: string;
    avatar: string;
    avatar_url?: string;
  };
  pricePerConversation?: number;
}

export function AgentOfferingModal({ 
  isOpen, 
  onClose, 
  offering, 
  agentData,
  pricePerConversation = 0
}: AgentOfferingModalProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showChat, setShowChat] = useState(false);

  // For now, create a single agent based on the offering
  // In the future, this could be a list of multiple agents
  const agents: Agent[] = [{
    id: agentData.id,
    name: offering.title,
    description: offering.description,
    avatar_url: offering.media_url || agentData.avatar_url || agentData.avatar,
    media_url: offering.media_url
  }];

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowChat(true);
  };

  const handleBackToAgents = () => {
    setShowChat(false);
    setSelectedAgent(null);
  };

  if (showChat && selectedAgent) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 pb-4 border-b">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToAgents}
                  className="mr-2"
                >
                  ← Back
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedAgent.avatar_url} alt={selectedAgent.name} />
                  <AvatarFallback>{selectedAgent.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-lg">{selectedAgent.name}</DialogTitle>
                  {pricePerConversation > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <DollarSign className="h-3 w-3 mr-1" />
                      ${pricePerConversation} per conversation
                    </Badge>
                  )}
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <PublicChatInterface
                agent={{
                  ...agentData,
                  description: selectedAgent.description,
                } as any}
                avatarUrl={selectedAgent.avatar_url}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{offering.title}</DialogTitle>
          <DialogDescription>{offering.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Initial Access</p>
              <p className="text-xs text-muted-foreground">One-time payment to unlock agents</p>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <DollarSign className="h-3.5 w-3.5 mr-1" />
              {Number(offering.price).toLocaleString()} USDC
            </Badge>
          </div>

          {pricePerConversation > 0 && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Per Conversation</p>
                <p className="text-xs text-muted-foreground">Pay as you chat with agents</p>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <DollarSign className="h-3.5 w-3.5 mr-1" />
                {pricePerConversation} USDC
              </Badge>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-4">Available Agents</h3>
            <div className="space-y-3">
              {agents.map((agent) => (
                <Card key={agent.id} className="hover:border-primary transition-colors cursor-pointer" onClick={() => handleAgentClick(agent)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={agent.avatar_url} alt={agent.name} />
                        <AvatarFallback>{agent.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{agent.name}</h4>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}