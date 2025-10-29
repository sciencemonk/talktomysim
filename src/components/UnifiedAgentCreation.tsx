import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Upload,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Rocket,
  Sparkles,
} from "lucide-react";
import pumpfunLogo from "@/assets/pumpfun-logo.png";
import chatbotIcon from "@/assets/chatbot-icon.png";
import donationIcon from "@/assets/donation-icon.png";
import aiIcon from "@/assets/ai-icon.png";

interface UnifiedAgentCreationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AGENT_TYPES = [
  {
    id: "chat",
    label: "Chat Agent",
    description: "AI chatbot for conversations",
    iconImage: chatbotIcon,
    category: "Chat",
  },
  {
    id: "crypto-mail",
    label: "Crypto Mail",
    description: "Contact form with message collection",
    iconImage: donationIcon,
    category: "Crypto Mail",
  },
  {
    id: "autonomous",
    label: "Autonomous Agent",
    description: "Automated tasks like daily briefs",
    iconImage: aiIcon,
    category: "Autonomous Agent",
  },
  {
    id: "pumpfun",
    label: "PumpFun Agent",
    description: "Token-based chatbot",
    iconImage: pumpfunLogo,
    category: "PumpFun Agent",
  },
];

const CATEGORIES = [
  { value: "crypto", label: "Crypto & Web3" },
  { value: "historical", label: "Historical Figures" },
  { value: "influencers", label: "Influencers & Celebrities" },
  { value: "fictional", label: "Fictional Characters" },
  { value: "education", label: "Education & Tutoring" },
  { value: "business", label: "Business & Finance" },
  { value: "lifestyle", label: "Lifestyle & Wellness" },
  { value: "entertainment", label: "Entertainment & Games" },
  { value: "spiritual", label: "Spiritual & Philosophy" },
];

export const UnifiedAgentCreation = ({ open, onOpenChange, onSuccess }: UnifiedAgentCreationProps) => {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    systemPrompt: "",
    contractAddress: "",
    briefTopic: "",
    briefTime: "09:00",
    agentCategory: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [editCode, setEditCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateEditCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setStep(1);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null;

    const fileExt = avatarFile.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const handleFetchPumpFunToken = async () => {
    if (!formData.contractAddress.trim()) {
      toast.error("Please enter a contract address");
      return;
    }

    setIsLoading(true);
    try {
      const { data: existingAgents } = await supabase
        .from("advisors")
        .select("id, social_links")
        .eq("sim_category", "PumpFun Agent");

      const duplicateAgent = existingAgents?.find((agent) => {
        const socialLinks = agent.social_links as { contract_address?: string } | null;
        return socialLinks?.contract_address === formData.contractAddress.trim();
      });

      if (duplicateAgent) {
        toast.error("This PumpFun agent has already been created");
        return;
      }

      const { data: response, error } = await supabase.functions.invoke("analyze-pumpfun-token", {
        body: { tokenAddress: formData.contractAddress.trim() },
      });

      if (error) throw error;
      if (response?.error) {
        toast.error(response.error || "Token not found");
        return;
      }
      if (!response?.tokenData) {
        toast.error("Unable to fetch token data");
        return;
      }

      setTokenData(response.tokenData);
      setEditCode(generateEditCode());
      setStep(3);
      toast.success("Token data fetched successfully!");
    } catch (error) {
      console.error("Error fetching token:", error);
      toast.error("Failed to fetch token data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a name first");
      return;
    }

    if (selectedType === "chat" && !formData.description.trim()) {
      toast.error("Please enter a description first");
      return;
    }

    if (selectedType === "autonomous") {
      if (!formData.agentCategory) {
        toast.error("Please select an agent category");
        return;
      }
      if (!formData.briefTopic.trim()) {
        toast.error("Please enter what you want a daily brief on");
        return;
      }
      setEditCode(generateEditCode());
      setStep(3);
      return;
    }

    if (selectedType === "crypto-mail") {
      setEditCode(generateEditCode());
      setStep(3);
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category first");
      return;
    }

    setIsLoading(true);
    try {
      const { data: promptData, error: promptError } = await supabase.functions.invoke(
        "generate-system-prompt",
        {
          body: {
            name: formData.name.trim(),
            description: formData.description.trim(),
            category: formData.category,
            integrations: ["solana-explorer", "pumpfun", "x-analyzer", "crypto-prices"],
          },
        }
      );

      if (promptError) throw promptError;

      if (promptData?.systemPrompt) {
        setFormData((prev) => ({ ...prev, systemPrompt: promptData.systemPrompt }));
      }

      setEditCode(generateEditCode());
      toast.success("Prompt generated successfully!");
      setStep(3);
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast.error("Failed to generate prompt");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      if (selectedType === "pumpfun" && tokenData) {
        const systemPrompt = `You are ${tokenData.name} (${tokenData.symbol}), a PumpFun token chatbot.

Your contract address (CA) is: ${formData.contractAddress.trim()}

${tokenData.description || ""}

You can discuss your tokenomics, community, and answer questions about the project. When users ask about market cap, price, trading activity, or any token metrics, use the PumpFun CA Data integration to provide real-time information about your token. Be enthusiastic and engaging!`;

        const simData = {
          user_id: user?.id || null,
          name: `${tokenData.name} (${tokenData.symbol})`,
          sim_category: "PumpFun Agent",
          prompt: systemPrompt,
          description: tokenData.description || `${tokenData.name} - PumpFun token chatbot`,
          avatar_url: tokenData.image || null,
          price: 0,
          integrations: ["solana-explorer", "pumpfun", "x-analyzer", "crypto-prices"],
          is_active: true,
          is_public: true,
          social_links: {
            contract_address: formData.contractAddress.trim(),
            creator: tokenData.creator || null,
          },
          edit_code: editCode,
          marketplace_category: "crypto",
          welcome_message: `Hey! I'm ${tokenData.name} (${tokenData.symbol}). Ask me anything about the token!`,
          auto_description: tokenData.description?.substring(0, 150) || `${tokenData.name} (${tokenData.symbol})`,
        };

        const { data: newSim, error } = await supabase.from("advisors").insert(simData).select().single();

        if (error) throw error;

        if (newSim && user) {
          await supabase.from("user_advisors").insert({
            user_id: user.id,
            advisor_id: newSim.id,
            name: newSim.name,
            description: newSim.description,
            prompt: newSim.prompt,
            avatar_url: newSim.avatar_url,
            marketplace_category: newSim.marketplace_category,
            sim_category: newSim.sim_category,
            auto_description: simData.auto_description,
          });
        }

        toast.success("PumpFun Agent created successfully!");
      } else {
        const selectedAgentType = AGENT_TYPES.find((t) => t.id === selectedType);
        const simCategory = selectedAgentType?.category || "Chat";

        let welcomeMessage = `Hi! I'm ${formData.name.trim()}. How can I help you today?`;
        let autoDescription = "";

        if (simCategory === "Crypto Mail") {
          welcomeMessage = "Thanks for reaching out! Fill out the form below and I'll get back to you.";
        } else if (simCategory === "Autonomous Agent") {
          welcomeMessage = formData.briefTime;
          autoDescription = formData.briefTopic.substring(0, 150);
        } else {
          try {
            const { data: welcomeData } = await supabase.functions.invoke("chat-completion", {
              body: {
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a helpful assistant that creates brief, engaging welcome messages for AI chatbots based on their details. Keep it to 1-2 sentences, under 150 characters, in first person.",
                  },
                  {
                    role: "user",
                    content: `Create a welcome message for an AI called "${formData.name.trim()}" with this description: ${formData.description.trim()}`,
                  },
                ],
              },
            });

            if (welcomeData?.content) {
              welcomeMessage = welcomeData.content.trim();
            }
          } catch (error) {
            console.error("Error generating welcome message:", error);
          }

          try {
            const { data: shortDescData } = await supabase.functions.invoke("generate-short-description", {
              body: { systemPrompt: formData.systemPrompt.trim() },
            });

            if (shortDescData?.shortDescription) {
              autoDescription = shortDescData.shortDescription.trim();
            }
          } catch (error) {
            console.error("Error generating short description:", error);
            autoDescription = formData.description.trim().substring(0, 150);
          }
        }

        const simData: any = {
          user_id: user?.id || null,
          name: formData.name.trim(),
          sim_category: simCategory,
          prompt: simCategory === "Chat" ? formData.systemPrompt.trim() : "N/A",
          avatar_url: avatarUrl,
          price: 0,
          integrations: ["solana-explorer", "pumpfun", "x-analyzer", "crypto-prices"],
          is_active: true,
          is_public: true,
          edit_code: editCode,
          welcome_message: welcomeMessage,
          auto_description: autoDescription,
        };

        if (simCategory === "Autonomous Agent") {
          simData.description = formData.briefTopic.trim();
          simData.marketplace_category = formData.agentCategory;
        } else {
          simData.description = formData.description.trim();
          simData.marketplace_category = formData.category || null;
        }

        const { data: newSim, error } = await supabase.from("advisors").insert(simData).select().single();

        if (error) throw error;

        if (newSim && user) {
          await supabase.from("user_advisors").insert({
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
        }

        toast.success("Agent created successfully!");
      }

      onOpenChange(false);
      handleReset();
      if (onSuccess) await onSuccess();
      window.location.href = "/";
    } catch (error) {
      console.error("Error creating agent:", error);
      toast.error("Failed to create agent");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setSelectedType(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      systemPrompt: "",
      contractAddress: "",
      briefTopic: "",
      briefTime: "09:00",
      agentCategory: "",
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setTokenData(null);
    setEditCode("");
  };

  const handleBack = () => {
    if (step === 1) {
      setStep(0);
      setSelectedType(null);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const getStepTitle = () => {
    if (step === 0) return "Choose Agent Type";
    if (step === 1) return "Basic Information";
    if (step === 2) return "Configure Agent";
    if (step === 3) return "Review & Create";
    return "";
  };

  const getProgress = () => {
    return ((step + 1) / 4) * 100;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleReset()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{getStepTitle()}</h2>
              {step > 0 && (
                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
            </div>
            {step > 0 && <Progress value={getProgress()} className="h-2" />}
          </div>

          {/* Step 0: Agent Type Selection */}
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AGENT_TYPES.map((type) => {
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    className="p-6 rounded-lg border-2 border-border hover:border-primary transition-all text-left space-y-3 hover:shadow-lg group"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={type.iconImage} 
                        alt={type.label} 
                        className="w-8 h-8 group-hover:scale-110 transition-transform" 
                      />
                      <h3 className="text-lg font-semibold">{type.label}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              {selectedType === "pumpfun" ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contractAddress">PumpFun Token Contract Address</Label>
                    <Input
                      id="contractAddress"
                      placeholder="Enter token CA..."
                      value={formData.contractAddress}
                      onChange={(e) => setFormData({ ...formData, contractAddress: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the contract address of a PumpFun token
                    </p>
                  </div>
                  <Button
                    onClick={handleFetchPumpFunToken}
                    disabled={isLoading || !formData.contractAddress.trim()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Fetching Token Data...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-[auto,1fr] gap-4">
                    <div className="space-y-2">
                      <Label>Avatar</Label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-xl cursor-pointer border-2 border-dashed border-border hover:border-primary transition-all flex items-center justify-center bg-muted/30"
                      >
                        {avatarPreview ? (
                          <Avatar className="w-full h-full rounded-xl">
                            <AvatarImage src={avatarPreview} />
                            <AvatarFallback>{formData.name[0]}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Agent Name *</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Tech Advisor Alex"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      {selectedType === "autonomous" && (
                        <div>
                          <Label htmlFor="agentCategory">Category *</Label>
                          <Select
                            value={formData.agentCategory}
                            onValueChange={(value) => setFormData({ ...formData, agentCategory: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Daily Brief">Daily Brief</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedType === "autonomous" ? (
                    <>
                      <div>
                        <Label htmlFor="briefTopic">What do you want a daily brief on? *</Label>
                        <Textarea
                          id="briefTopic"
                          placeholder="E.g., AI developments, cryptocurrency markets, climate change news..."
                          value={formData.briefTopic}
                          onChange={(e) => setFormData({ ...formData, briefTopic: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="briefTime">When do you want to receive your daily brief? *</Label>
                        <Input
                          id="briefTime"
                          type="time"
                          value={formData.briefTime}
                          onChange={(e) => setFormData({ ...formData, briefTime: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Your brief will be generated daily at this time
                        </p>
                      </div>
                    </>
                  ) : selectedType === "crypto-mail" ? (
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what this contact form is for..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your agent's personality and purpose..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <Button onClick={handleGeneratePrompt} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Step 3: Review & Create */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Agent Preview */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
                <Avatar className="h-16 w-16">
                  {selectedType === "pumpfun" && tokenData ? (
                    <>
                      <AvatarImage src={tokenData.image} />
                      <AvatarFallback>{tokenData.symbol?.[0] || "?"}</AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src={avatarPreview || undefined} />
                      <AvatarFallback>{formData.name[0] || "?"}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {selectedType === "pumpfun" && tokenData
                      ? `${tokenData.name} (${tokenData.symbol})`
                      : formData.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {selectedType === "pumpfun" && tokenData
                      ? tokenData.description
                      : selectedType === "autonomous"
                        ? formData.briefTopic
                        : formData.description}
                  </p>
                </div>
              </div>

              {/* Edit Code */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="font-semibold text-lg">Your Creator Code</h3>
                  </div>
                  <div className="flex items-center justify-between gap-4 p-4 bg-background/50 rounded-lg border">
                    <p className="text-3xl font-mono font-bold tracking-wider text-primary">{editCode}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(editCode);
                        toast.success("Code copied!");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">⚠️ Write this code down!</p>
                    <p className="text-xs text-muted-foreground">
                      This is the only way to edit your agent after creation. Keep it safe!
                    </p>
                  </div>
                </div>
              </div>

              {/* Create Button */}
              <Button onClick={handleSubmit} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Agent...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5 mr-2" />
                    Create Agent
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
