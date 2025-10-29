import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
import predictionIcon from "@/assets/prediction-icon.png";
import gmailIcon from "@/assets/gmail-icon.png";

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
    id: "pumpfun",
    label: "PumpFun Agent",
    description: "Plug in CA for dedicated agent page",
    iconImage: pumpfunLogo,
    category: "PumpFun Agent",
  },
  {
    id: "crypto-mail",
    label: "x402 Mail",
    description: "Get paid to respond to messages",
    iconImage: donationIcon,
    category: "Crypto Mail",
    inviteOnly: true,
  },
  {
    id: "autonomous",
    label: "Autonomous Agent",
    description: "Automated tasks like daily briefs",
    iconImage: aiIcon,
    category: "Autonomous Agent",
    inviteOnly: true,
  },
  {
    id: "prediction-market",
    label: "Prediction Market",
    description: "Host your own prediction market",
    iconImage: predictionIcon,
    category: "Prediction Market",
    inviteOnly: true,
  },
  {
    id: "email-agent",
    label: "Email Agent",
    description: "Review, respond, and summarize your Gmail",
    iconImage: gmailIcon,
    category: "Email Agent",
    inviteOnly: true,
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
    cryptoWallet: "",
    xProfile: "",
    x402Price: "5.0",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [editCode, setEditCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateEditCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setStep(1);
  };

  const processAvatarFile = (file: File) => {
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
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processAvatarFile(files[0]);
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
      window.location.href = "/agents";
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
      cryptoWallet: "",
      xProfile: "",
      x402Price: "5.0",
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setTokenData(null);
    setEditCode("");
    setIsDragging(false);
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
    if (step === 1) return ""; // Removed title for step 1
    if (step === 2) return "Configure Agent";
    if (step === 3) return "Review & Create";
    return "";
  };

  const getProgress = () => {
    return ((step + 1) / 4) * 100;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleReset();
        onOpenChange(false);
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Create Agent</DialogTitle>
        </VisuallyHidden>
        <div className="space-y-6">
          {/* Agent Type Header - Always visible when agent type is selected */}
          {step > 0 && selectedType && (
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-neonGreen/10">
                <img 
                  src={AGENT_TYPES.find(t => t.id === selectedType)?.iconImage} 
                  alt={AGENT_TYPES.find(t => t.id === selectedType)?.label}
                  className="w-8 h-8"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{AGENT_TYPES.find(t => t.id === selectedType)?.label}</h3>
                <p className="text-sm text-muted-foreground">{AGENT_TYPES.find(t => t.id === selectedType)?.description}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
          )}

          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
            {getStepTitle() && <h2 className="text-2xl font-bold">{getStepTitle()}</h2>}
            </div>
            {step > 0 && selectedType !== "crypto-mail" && selectedType !== "autonomous" && selectedType !== "chat" && selectedType !== "pumpfun" && (
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      step >= stepNum 
                        ? 'border-neonGreen bg-neonGreen/10 text-neonGreen' 
                        : 'border-border bg-background text-muted-foreground'
                    }`}>
                      <span className="text-sm font-semibold">{stepNum}</span>
                    </div>
                    {stepNum < 3 && (
                      <div className={`w-16 h-0.5 mx-1 transition-colors ${
                        step > stepNum ? 'bg-neonGreen' : 'bg-border'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 0: Agent Type Selection */}
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AGENT_TYPES.map((type) => {
                const isInviteOnly = type.inviteOnly || false;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    className="p-6 rounded-lg border-2 border-border hover:border-primary transition-all text-left space-y-3 hover:shadow-lg group relative"
                  >
                    {isInviteOnly && (
                      <div className="absolute top-4 right-4 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-neonGreen/20 border border-neonGreen/40">
                        <span className="text-[10px] sm:text-xs font-semibold text-neonGreen">Invite Only</span>
                      </div>
                    )}
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
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="contractAddress" className="text-xs uppercase tracking-wider text-muted-foreground">PumpFun Token Contract Address</Label>
                    <Input
                      id="contractAddress"
                      placeholder="Enter token CA..."
                      value={formData.contractAddress}
                      onChange={(e) => setFormData({ ...formData, contractAddress: e.target.value })}
                      className="h-12 bg-background border-border/50 focus:border-neonGreen transition-colors font-mono"
                    />
                    <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-neonGreen" />
                      Enter the contract address of a PumpFun token
                    </p>
                  </div>
                  <Button
                    onClick={handleFetchPumpFunToken}
                    disabled={isLoading || !formData.contractAddress.trim()}
                    className="w-full bg-neonGreen hover:bg-neonGreen/90 text-black font-semibold"
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
              ) : selectedType === "crypto-mail" || selectedType === "autonomous" ? (
                <div className="space-y-6">
                  <div className="p-8 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 text-center space-y-4">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-neonGreen/10 border-2 border-neonGreen/30">
                      <Sparkles className="w-8 h-8 text-neonGreen" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">By Invite Only</h3>
                      <p className="text-muted-foreground">
                        This agent type is currently in private beta. Request an invite to get early access.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inviteXProfile" className="text-xs uppercase tracking-wider text-muted-foreground">Your X Profile *</Label>
                    <Input
                      id="inviteXProfile"
                      placeholder="@username"
                      value={formData.xProfile}
                      onChange={(e) => setFormData({ ...formData, xProfile: e.target.value })}
                      className="h-12 bg-background border-border/50 focus:border-neonGreen transition-colors"
                    />
                    <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-neonGreen" />
                      We'll contact you via X when your invite is ready
                    </p>
                  </div>

                  <Button 
                    onClick={() => {
                      if (!formData.xProfile.trim()) {
                        toast.error("Please enter your X profile");
                        return;
                      }
                      toast.success("Invite request submitted! We'll reach out soon on X.");
                      onOpenChange(false);
                      handleReset();
                    }}
                    disabled={!formData.xProfile.trim()}
                    className="w-full bg-neonGreen hover:bg-neonGreen/90 text-black font-semibold"
                  >
                    Request Invite
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-[auto,1fr] gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Avatar</Label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative w-32 h-32 rounded-2xl cursor-pointer border-2 border-dashed transition-all flex items-center justify-center bg-gradient-to-br from-bg-muted/50 to-bg group overflow-hidden ${
                          isDragging 
                            ? 'border-neonGreen bg-neonGreen/10 scale-105' 
                            : 'border-border hover:border-neonGreen'
                        }`}
                      >
                        {avatarPreview ? (
                          <Avatar className="w-full h-full rounded-2xl">
                            <AvatarImage src={avatarPreview} />
                            <AvatarFallback>{formData.name[0]}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className={`w-10 h-10 transition-colors ${
                              isDragging ? 'text-neonGreen' : 'text-muted-foreground group-hover:text-neonGreen'
                            }`} />
                            <span className="text-xs text-muted-foreground">
                              {isDragging ? 'Drop here' : 'Upload or drag'}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-neonGreen/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">
                          {selectedType === "crypto-mail" ? "Your Name *" : "Agent Name *"}
                        </Label>
                        <Input
                          id="name"
                          placeholder={selectedType === "crypto-mail" ? "e.g., John Doe" : "e.g., Tech Advisor Alex"}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-12 bg-background border-border/50 focus:border-neonGreen transition-colors"
                        />
                      </div>

                      {selectedType === "crypto-mail" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="cryptoWallet" className="text-xs uppercase tracking-wider text-muted-foreground">EVM Wallet Address *</Label>
                            <Input
                              id="cryptoWallet"
                              placeholder="0x..."
                              value={formData.cryptoWallet}
                              onChange={(e) => setFormData({ ...formData, cryptoWallet: e.target.value })}
                              className="h-12 bg-background border-border/50 focus:border-neonGreen transition-colors font-mono"
                            />
                            <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-neonGreen" />
                              EVM-compatible wallet for receiving payments
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="xProfile" className="text-xs uppercase tracking-wider text-muted-foreground">X Profile *</Label>
                            <Input
                              id="xProfile"
                              placeholder="@username"
                              value={formData.xProfile}
                              onChange={(e) => setFormData({ ...formData, xProfile: e.target.value })}
                              className="h-12 bg-background border-border/50 focus:border-neonGreen transition-colors"
                            />
                            <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-neonGreen" />
                              Your X (Twitter) profile handle
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="x402Price" className="text-xs uppercase tracking-wider text-muted-foreground">Message Price (USDC) *</Label>
                            <Input
                              id="x402Price"
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="5.0"
                              value={formData.x402Price}
                              onChange={(e) => setFormData({ ...formData, x402Price: e.target.value })}
                              className="h-12 bg-background border-border/50 focus:border-neonGreen transition-colors font-mono"
                            />
                            <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-neonGreen" />
                              Price in USDC to receive and respond to messages (x402 enabled)
                            </p>
                          </div>
                        </>
                      )}

                      {selectedType !== "autonomous" && selectedType !== "crypto-mail" && (
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-xs uppercase tracking-wider text-muted-foreground">Category *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                          >
                            <SelectTrigger className="h-12 bg-background border-border/50 focus:border-neonGreen transition-colors">
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
                      )}

                      {selectedType === "autonomous" && (
                        <div className="space-y-2">
                          <Label htmlFor="agentCategory" className="text-xs uppercase tracking-wider text-muted-foreground">Category *</Label>
                          <Select
                            value={formData.agentCategory}
                            onValueChange={(value) => setFormData({ ...formData, agentCategory: value })}
                          >
                            <SelectTrigger className="h-12 bg-background border-border/50 focus:border-neonGreen transition-colors">
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
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="briefTopic" className="text-xs uppercase tracking-wider text-muted-foreground">What do you want a daily brief on? *</Label>
                        <Textarea
                          id="briefTopic"
                          placeholder="E.g., AI developments, cryptocurrency markets, climate change news..."
                          value={formData.briefTopic}
                          onChange={(e) => setFormData({ ...formData, briefTopic: e.target.value })}
                          rows={4}
                          className="bg-background border-border/50 focus:border-neonGreen transition-colors resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="briefTime" className="text-xs uppercase tracking-wider text-muted-foreground">When do you want to receive your daily brief? *</Label>
                        <Input
                          id="briefTime"
                          type="time"
                          value={formData.briefTime}
                          onChange={(e) => setFormData({ ...formData, briefTime: e.target.value })}
                          className="h-12 bg-background border-border/50 focus:border-neonGreen transition-colors"
                        />
                        <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-neonGreen" />
                          Your brief will be generated daily at this time
                        </p>
                      </div>
                    </div>
                  ) : selectedType === "crypto-mail" ? (
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what this contact form is for..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="bg-background border-border/50 focus:border-neonGreen transition-colors resize-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your agent's personality and purpose..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="bg-background border-border/50 focus:border-neonGreen transition-colors resize-none"
                      />
                    </div>
                  )}

                  <Button onClick={handleGeneratePrompt} disabled={isLoading} className="w-full bg-neonGreen hover:bg-neonGreen/90 text-black font-semibold">
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

              {/* System Prompt - Only for Chat Agents */}
              {selectedType === "chat" && formData.systemPrompt && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-neonGreen" />
                    <Label htmlFor="reviewPrompt" className="text-xs uppercase tracking-wider text-muted-foreground">System Prompt</Label>
                  </div>
                  <Textarea
                    id="reviewPrompt"
                    value={formData.systemPrompt}
                    onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                    rows={8}
                    className="bg-background border-border/50 focus:border-neonGreen transition-colors resize-none font-mono text-sm"
                    placeholder="System prompt..."
                  />
                  <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-neonGreen" />
                    You can modify the system prompt before creating your agent
                  </p>
                </div>
              )}

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
              <Button onClick={handleSubmit} disabled={isLoading} className="w-full bg-neonGreen hover:bg-neonGreen/90 text-black font-semibold" size="lg">
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
