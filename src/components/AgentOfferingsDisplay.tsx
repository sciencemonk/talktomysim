import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, Sparkles } from "lucide-react";

interface AgentOffering {
  id: string;
  title: string;
  description: string;
  price: number;
  agent_system_prompt?: string;
  agent_avatar_url?: string;
  agent_data_source?: string;
  price_per_conversation?: number;
  offering_type?: string;
}

interface AgentOfferingsDisplayProps {
  offerings: AgentOffering[];
  avatarUrl?: string;
  agentName?: string;
}

// Generate a short display description from the system prompt
const generateDisplayDescription = (systemPrompt?: string): string => {
  if (!systemPrompt) return '';
  
  // Take first 150 characters of the system prompt and clean it up
  const cleaned = systemPrompt
    .replace(/You are /i, '')
    .replace(/\n\n/g, ' ')
    .replace(/\n/g, ' ')
    .trim();
  
  return cleaned.length > 150 ? cleaned.substring(0, 150) + '...' : cleaned;
};

export function AgentOfferingsDisplay({ offerings, avatarUrl, agentName }: AgentOfferingsDisplayProps) {
  // Filter to only show agent type offerings
  const agentOfferings = offerings.filter(o => o.offering_type === 'agent');

  if (agentOfferings.length === 0) {
    return (
      <Card className="shadow-lg border-border/50">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Agents
          </CardTitle>
          <CardDescription>AI-powered assistants available for hire</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center space-y-2 py-8">
            <Bot className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground">No AI agents available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="bg-muted/30">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Agents
        </CardTitle>
        <CardDescription>AI-powered assistants by @{agentName}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {agentOfferings.map((offering) => (
            <div key={offering.id} className="p-6 hover:bg-muted/20 transition-colors">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 shrink-0 ring-2 ring-primary/10">
                  <AvatarImage 
                    src={offering.agent_avatar_url || avatarUrl} 
                    alt={offering.title}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-6 w-6 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                      {offering.title}
                      <Sparkles className="h-4 w-4 text-primary" />
                    </h3>
                    {offering.agent_system_prompt && (
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {generateDisplayDescription(offering.agent_system_prompt)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Badge variant="outline" className="bg-primary/5">
                      {offering.price_per_conversation && offering.price_per_conversation > 0
                        ? `$${offering.price_per_conversation} USDC per conversation`
                        : 'Free to use'
                      }
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}