import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateCABotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateCABotModal = ({ open, onOpenChange, onSuccess }: CreateCABotModalProps) => {
  const [contractAddress, setContractAddress] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const generateEditCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contractAddress.trim()) {
      toast.error("Please enter a contract address");
      return;
    }

    setIsCreating(true);

    try {
      // Fetch token data from PumpFun
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke(
        "analyze-pumpfun-token",
        {
          body: { tokenAddress: contractAddress.trim() },
        }
      );

      if (tokenError) throw tokenError;

      if (tokenData?.error) {
        toast.error(tokenData.error || "Token not found");
        return;
      }

      if (!tokenData?.tokenData) {
        toast.error("Unable to fetch token data");
        return;
      }

      const { name, symbol, description, image, creator } = tokenData.tokenData;

      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Generate system prompt for the CA Bot
      const systemPrompt = `You are ${name} (${symbol}), a PumpFun token chatbot. Your contract address is ${contractAddress.trim()}. ${
        description || ""
      } You can discuss your tokenomics, community, and answer questions about the project. Be enthusiastic and engaging!`;

      // Generate welcome message
      const welcomeMessage = `Hey! I'm ${name} (${symbol}). Ask me anything about the token!`;

      // Generate short description
      const autoDescription = description
        ? description.substring(0, 150)
        : `${name} (${symbol}) - PumpFun Token`;

      const editCode = generateEditCode();

      // Create the sim
      const simData: any = {
        user_id: user?.id || null,
        name: `${name} (${symbol})`,
        sim_category: "CA Bot",
        prompt: systemPrompt,
        description: description || `${name} - PumpFun token chatbot`,
        avatar_url: image || null,
        price: 0,
        integrations: ["solana-explorer", "pumpfun", "crypto-prices"],
        is_active: true,
        is_public: true,
        social_links: creator ? { creator: creator } : null,
        edit_code: editCode,
        marketplace_category: "crypto",
        welcome_message: welcomeMessage,
        auto_description: autoDescription,
      };

      const { data: newSim, error: insertError } = await supabase
        .from("advisors")
        .insert(simData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Add to user's advisors list if authenticated
      if (newSim && user) {
        const { error: userAdvisorError } = await supabase.from("user_advisors").insert({
          user_id: user.id,
          advisor_id: newSim.id,
          name: newSim.name,
          description: newSim.description,
          prompt: newSim.prompt,
          avatar_url: newSim.avatar_url,
          marketplace_category: newSim.marketplace_category,
          sim_category: newSim.sim_category,
          auto_description: autoDescription,
        });

        if (userAdvisorError) {
          console.error("Error adding to user advisors:", userAdvisorError);
        }
      }

      toast.success(`${name} CA Bot created successfully!`);

      // Reset and close
      onOpenChange(false);
      setContractAddress("");

      if (onSuccess) {
        await onSuccess();
      }

      // Refresh page
      window.location.href = "/";
    } catch (error) {
      console.error("Error creating CA Bot:", error);
      toast.error("Failed to create CA Bot");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setContractAddress("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Create CA Bot
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contractAddress">PumpFun Token Contract Address</Label>
            <Input
              id="contractAddress"
              placeholder="Enter unbonded token CA..."
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              disabled={isCreating}
            />
            <p className="text-xs text-muted-foreground">
              Enter the contract address of an unbonded PumpFun token to automatically create a chatbot
            </p>
          </div>
          <Button type="submit" disabled={isCreating} className="w-full">
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Bot...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                Create CA Bot
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
