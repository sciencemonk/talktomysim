import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Twitter, Zap, TrendingUp } from "lucide-react";

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  comingSoon?: boolean;
}

interface AgentIntegrationsProps {
  integrations: Integration[];
  onChange: (integrations: Integration[]) => void;
}

export function AgentIntegrations({ integrations, onChange }: AgentIntegrationsProps) {
  const handleToggle = (integrationId: string) => {
    const updated = integrations.map(integration =>
      integration.id === integrationId
        ? { ...integration, enabled: !integration.enabled }
        : integration
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base">Integrations</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Enable integrations to enhance your agent's capabilities with real-time data
        </p>
      </div>
      
      <div className="grid gap-3">
        {integrations.map((integration) => (
          <Card 
            key={integration.id} 
            className={`border-border ${integration.enabled ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${integration.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                    {integration.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{integration.name}</h4>
                      {integration.comingSoon && (
                        <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {integration.description}
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={integration.enabled}
                  onCheckedChange={() => !integration.comingSoon && handleToggle(integration.id)}
                  disabled={integration.comingSoon}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {integrations.some(i => i.enabled) && (
        <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md border border-border">
          <strong>Note:</strong> Enabled integrations will be automatically included in your agent's system prompt, 
          allowing it to access and use this data in conversations.
        </p>
      )}
    </div>
  );
}

export const DEFAULT_INTEGRATIONS: Integration[] = [
  {
    id: 'solana',
    name: 'Solana Blockchain Explorer',
    description: 'Access real-time Solana blockchain data, wallet balances, and transaction history',
    icon: <Wallet className="h-4 w-4 text-primary" />,
    enabled: false,
  },
  {
    id: 'x_twitter',
    name: 'X (Twitter) Integration',
    description: 'Fetch and analyze tweets, trends, and social sentiment from X/Twitter',
    icon: <Twitter className="h-4 w-4 text-primary" />,
    enabled: false,
  },
  {
    id: 'pumpfun',
    name: 'Pump.fun',
    description: 'Monitor token launches, trading activity, and market data from Pump.fun',
    icon: <TrendingUp className="h-4 w-4 text-primary" />,
    enabled: false,
  },
  {
    id: 'defi',
    name: 'DeFi Data',
    description: 'Access DeFi protocols, liquidity pools, and yield farming opportunities',
    icon: <Zap className="h-4 w-4 text-primary" />,
    enabled: false,
    comingSoon: true,
  },
];
