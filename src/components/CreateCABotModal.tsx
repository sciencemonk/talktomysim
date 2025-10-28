import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Bot, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import pumpfunLogo from "@/assets/pumpfun-logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreateCABotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface TokenData {
  name: string;
  symbol: string;
  description: string;
  image: string;
  creator: string;
}

export const CreateCABotModal = ({ open, onOpenChange, onSuccess }: CreateCABotModalProps) => {
  const [step, setStep] = useState(1);
  const [contractAddress, setContractAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [editCode, setEditCode] = useState("");

  const generateEditCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleFetchToken = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contractAddress.trim()) {
      toast.error("Please enter a contract address");
      return;
    }

    setIsLoading(true);

    try {
      const trimmedCA = contractAddress.trim();
      
      // Check if agent with this contract address already exists
      const { data: existingAgents, error: checkError } = await supabase
        .from("advisors")
        .select("id, name, social_links")
        .eq("sim_category", "PumpFun Agent");

      if (checkError) {
        console.error("Error checking for duplicates:", checkError);
      }

      if (existingAgents && existingAgents.length > 0) {
        const duplicateAgent = existingAgents.find(
          (agent) => {
            const socialLinks = agent.social_links as { contract_address?: string } | null;
            return socialLinks?.contract_address === trimmedCA;
          }
        );

        if (duplicateAgent) {
          toast.error("This PumpFun AI agent has already been created");
          setContractAddress("");
          setIsLoading(false);
          return;
        }
      }

      // Fetch token data from PumpFun
      const { data: response, error: tokenError } = await supabase.functions.invoke(
        "analyze-pumpfun-token",
        {
          body: { tokenAddress: contractAddress.trim() },
        }
      );

      if (tokenError) throw tokenError;

      if (response?.error) {
        toast.error(response.error || "Token not found");
        return;
      }

      if (!response?.tokenData) {
        toast.error("Unable to fetch token data");
        return;
      }

      const { name, symbol, description, image, creator } = response.tokenData;
      
      setTokenData({ name, symbol, description, image, creator });
      setEditCode(generateEditCode());
      setStep(2);
      toast.success("Token data fetched successfully!");
    } catch (error) {
      console.error("Error fetching token:", error);
      toast.error("Failed to fetch token data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSim = async () => {
    if (!tokenData) return;

    setIsCreating(true);

    try {
      const { name, symbol, description, image, creator } = tokenData;

      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Generate system prompt for the PumpFun Agent
      const systemPrompt = `You are ${name} (${symbol}), a PumpFun token chatbot.

Your contract address (CA) is: ${contractAddress.trim()}

${description || ""}

You can discuss your tokenomics, community, and answer questions about the project. When users ask about market cap, price, trading activity, or any token metrics, use the PumpFun CA Data integration to provide real-time information about your token. Be enthusiastic and engaging!`;

      // Generate welcome message
      const welcomeMessage = `Hey! I'm ${name} (${symbol}). Ask me anything about the token!`;

      // Generate short description
      const autoDescription = description
        ? description.substring(0, 150)
        : `${name} (${symbol}) - PumpFun Token`;

      // Create the sim
      const simData: any = {
        user_id: user?.id || null,
        name: `${name} (${symbol})`,
        sim_category: "PumpFun Agent",
        prompt: systemPrompt,
        description: description || `${name} - PumpFun token chatbot`,
        avatar_url: image || null,
        price: 0,
        integrations: ["solana-explorer", "pumpfun", "x-analyzer", "crypto-prices"],
        is_active: true,
        is_public: true,
        social_links: { 
          contract_address: contractAddress.trim(),
          creator: creator || null 
        },
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

      toast.success(`${name} Agent created successfully!`);

      // Reset and close
      onOpenChange(false);
      setStep(1);
      setContractAddress("");
      setTokenData(null);
      setEditCode("");

      if (onSuccess) {
        await onSuccess();
      }

      // Refresh page
      window.location.href = "/";
    } catch (error) {
      console.error("Error creating PumpFun Agent:", error);
      toast.error("Failed to create PumpFun Agent");
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setTokenData(null);
    setEditCode("");
  };

  const handleClose = () => {
    setStep(1);
    setContractAddress("");
    setTokenData(null);
    setEditCode("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Bot className="h-5 w-5" />
            Create <img src={pumpfunLogo} alt="PumpFun" className="h-5 w-5 inline-block" /> AI Agent
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Enter a PumpFun token contract address to create an AI chatbot"
              : "Review your AI agent and save your creator code"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <form onSubmit={handleFetchToken} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contractAddress" className="text-foreground">
                PumpFun Token Contract Address
              </Label>
              <Input
                id="contractAddress"
                placeholder="Enter token CA..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                disabled={isLoading}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Enter the contract address of a PumpFun token to automatically create a chatbot
              </p>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !contractAddress.trim()} 
              className="w-full text-black hover:opacity-90"
              style={{ backgroundColor: '#82f2aa' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fetching Token Data...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  Continue
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2 -ml-2 hover:bg-muted/50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {/* Token Preview */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
              <Avatar className="h-16 w-16">
                <AvatarImage src={tokenData?.image} alt={tokenData?.name} />
                <AvatarFallback>{tokenData?.symbol?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{tokenData?.name} ({tokenData?.symbol})</h3>
                {tokenData?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {tokenData.description}
                  </p>
                )}
              </div>
            </div>

            {/* Edit Code Display */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-[#82f2aa]/10 via-[#82f2aa]/5 to-[#82f2aa]/10 border-2 border-[#82f2aa]/20">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#82f2aa] animate-pulse" />
                  <h3 className="font-semibold text-lg">Your Creator Code</h3>
                </div>
                <div className="flex items-center justify-between gap-4 p-4 bg-background/50 rounded-lg border border-border">
                  <div className="flex-1">
                    <p className="text-3xl font-mono font-bold tracking-wider text-[#82f2aa]">{editCode}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(editCode);
                      toast.success("Code copied to clipboard!");
                    }}
                    className="shrink-0"
                  >
                    Copy
                  </Button>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">⚠️ Write this code down!</p>
                  <p className="text-xs text-muted-foreground">
                    This is the only way to edit your AI agent after it&apos;s created. Keep it safe and don&apos;t share it with anyone.
                  </p>
                </div>
              </div>
            </div>

            {/* Contract Address */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Contract Address</Label>
              <p className="text-sm font-mono p-3 bg-muted/50 rounded-md border border-border break-all">
                {contractAddress}
              </p>
            </div>

            {/* Enabled Integrations */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Enabled Integrations</Label>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  PumpFun CA Data
                </div>
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  Solana Blockchain
                </div>
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  X Explorer
                </div>
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  Crypto Prices
                </div>
              </div>
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateSim}
              disabled={isCreating}
              className="w-full text-black hover:opacity-90"
              style={{ backgroundColor: '#82f2aa' }}
              size="lg"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating AI Agent...
                </>
              ) : (
                <>
                  <Bot className="h-5 w-5 mr-2" />
                  Create <img src={pumpfunLogo} alt="PumpFun" className="h-4 w-4 inline-block mx-1" /> Agent
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
