import { Coins, Wallet, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntegrationTilesProps {
  selectedIntegrations: string[];
  onToggle: (integration: string) => void;
  disabled?: boolean;
}

const integrations = [
  {
    id: "pumpfun",
    name: "PumpFun CA Data",
    icon: Coins,
  },
  {
    id: "solana-explorer",
    name: "Solana Blockchain",
    icon: Wallet,
  },
  {
    id: "x-analyzer",
    name: "X Explorer",
    icon: Twitter,
  },
];

export const IntegrationTiles = ({
  selectedIntegrations,
  onToggle,
  disabled = false,
}: IntegrationTilesProps) => {
  return (
    <div className="px-4 py-3 overflow-x-auto">
      <div className="flex gap-2 min-w-max">
        {integrations.map((integration) => {
          const isSelected = selectedIntegrations.includes(integration.id);
          const Icon = integration.icon;
          
          return (
            <button
              key={integration.id}
              onClick={() => !disabled && onToggle(integration.id)}
              disabled={disabled}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all",
                "hover:scale-105 active:scale-95",
                isSelected
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                disabled && "opacity-50 cursor-not-allowed hover:scale-100"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium whitespace-nowrap">
                {integration.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
