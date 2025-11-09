import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot, Zap, MessageCircle, Sparkles } from "lucide-react";
import pumpfunLogo from "@/assets/pumpfun-logo.png";

interface AgentOfferingTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTypeSelect: (type: 'pumpfun' | 'chatbot' | 'specialized') => void;
}

export const AgentOfferingTypeModal = ({ 
  open, 
  onOpenChange, 
  onTypeSelect 
}: AgentOfferingTypeModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Select Agent Type</DialogTitle>
          <DialogDescription>
            Choose the type of AI agent you want to create for your store
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <button
            type="button"
            onClick={() => onTypeSelect('pumpfun')}
            className="p-6 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <img src={pumpfunLogo} alt="PumpFun" className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">PumpFun Agent</h3>
                <p className="text-sm text-muted-foreground">
                  Create an AI agent for a PumpFun token. Enter the contract address to generate the agent.
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onTypeSelect('chatbot')}
            className="p-6 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Chatbot</h3>
                <p className="text-sm text-muted-foreground">
                  Create a custom chatbot with a specific personality, knowledge base, and conversation style.
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onTypeSelect('specialized')}
            className="p-6 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Specialized Agent</h3>
                <p className="text-sm text-muted-foreground">
                  Create a custom AI agent with advanced configuration options, pricing, and requirements.
                </p>
              </div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
