import { useState, useRef, DragEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Sparkles, ArrowLeft, ImagePlus, Link2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface CreateSimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onAuthRequired?: () => void;
  initialType?: string;
}

const simTypes = [
  { value: "Chat", label: "Chatbot" },
  { value: "Crypto Mail", label: "Crypto Mail" },
  { value: "NFT", label: "NFT" },
  { value: "Autonomous Agent", label: "Autonomous Agent", disabled: true, comingSoon: true },
];

const categories = [
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

export const CreateSimModal = ({ open, onOpenChange, onSuccess, onAuthRequired, initialType }: CreateSimModalProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [simType, setSimType] = useState(initialType || "Chat");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [editCode, setEditCode] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [socialLinksOpen, setSocialLinksOpen] = useState(false);
  const [xLink, setXLink] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [telegramLink, setTelegramLink] = useState("");
  const [cryptoWallet, setCryptoWallet] = useState("");
  const [x402Enabled, setX402Enabled] = useState(false);
  const [x402Price, setX402Price] = useState("");
  const [x402Wallet, setX402Wallet] = useState("");
  const [agentCategory, setAgentCategory] = useState("");
  const [briefTopic, setBriefTopic] = useState("");
  const [briefTime, setBriefTime] = useState("09:00");
  const [briefEmail, setBriefEmail] = useState("");
  const [nftSymbol, setNftSymbol] = useState("");
  const [nftSupply, setNftSupply] = useState("1");
  const [nftRoyalty, setNftRoyalty] = useState("5");
  const [isNftMinting, setIsNftMinting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // All sims get all integrations by default
  const allIntegrations = ["solana-explorer", "pumpfun", "x-analyzer", "crypto-prices"];

  // Update simType when initialType changes
  useEffect(() => {
    if (initialType) {
      setSimType(initialType);
    }
  }, [initialType]);

  // Generate a 6-digit edit code
  const generateEditCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
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

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name first");
      return;
    }

    // Skip description check for Autonomous Agent (uses briefTopic instead)
    if (simType !== "Autonomous Agent" && simType !== "NFT" && !description.trim()) {
      toast.error("Please enter a description first");
      return;
    }

    // For NFT, validate NFT-specific fields
    if (simType === "NFT") {
      if (!description.trim()) {
        toast.error("Please enter a description for the NFT");
        return;
      }
      if (!nftSymbol.trim()) {
        toast.error("Please enter an NFT symbol");
        return;
      }
      if (!avatarFile) {
        toast.error("Please upload an image for the NFT");
        return;
      }
      if (!cryptoWallet.trim()) {
        toast.error("Please enter a Solana wallet address to receive the NFT");
        return;
      }
      const code = generateEditCode();
      setEditCode(code);
      setWelcomeMessage(`NFT: ${name.trim()} (${nftSymbol.trim()})`);
      setSystemPrompt("N/A"); // Not used for NFT
      setStep(2);
      return;
    }

    // For Crypto Mail sims, skip AI generation and go directly to confirmation
    if (simType === "Crypto Mail") {
      const code = generateEditCode();
      setEditCode(code);
      setWelcomeMessage(`Thanks for reaching out! Fill out the form below and I'll get back to you.`);
      setSystemPrompt("N/A"); // Not used for Crypto Mail
      setStep(2);
      return;
    }

    // For Autonomous Agent, skip AI generation and go directly to confirmation
    if (simType === "Autonomous Agent") {
      if (!agentCategory) {
        toast.error("Please select an agent category first");
        return;
      }
      if (!briefTopic.trim()) {
        toast.error("Please enter what you want a daily brief on");
        return;
      }
      if (!briefTime) {
        toast.error("Please select a time for your daily brief");
        return;
      }
      const code = generateEditCode();
      setEditCode(code);
      setWelcomeMessage(briefTime);
      setSystemPrompt("N/A"); // Not used for Autonomous Agent
      setStep(2);
      return;
    }

    if (!category) {
      toast.error("Please select a category first");
      return;
    }

    setIsGenerating(true);
    try {
      // Generate system prompt
      const { data: promptData, error: promptError } = await supabase.functions.invoke("generate-system-prompt", {
        body: {
          name: name.trim(),
          description: description.trim(),
          category,
          integrations: allIntegrations,
        },
      });

      if (promptError) throw promptError;

      if (promptData?.systemPrompt) {
        setSystemPrompt(promptData.systemPrompt);
      }

      // Generate welcome message
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
              content: `Create a welcome message for an AI called "${name.trim()}" with this description: ${description.trim()}`,
            },
          ],
        },
      });

      if (welcomeData?.content) {
        setWelcomeMessage(welcomeData.content.trim());
      } else {
        setWelcomeMessage(`Hi! I'm ${name.trim()}. How can I help you today?`);
      }

      // Generate edit code when moving to review screen
      const code = generateEditCode();
      setEditCode(code);

      toast.success("Sim generated successfully!");
      setStep(2);
    } catch (error) {
      console.error("Error generating sim:", error);
      toast.error("Failed to generate sim");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a name for your Sim");
      return;
    }

    if (name.trim().length > 50) {
      toast.error("Sim name must be 50 characters or less");
      return;
    }

    // System prompt only required for Chat sims
    if (simType === "Chat" && !systemPrompt.trim()) {
      toast.error("Please enter or generate a system prompt");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user is authenticated (optional - sims can be created without auth)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let avatarUrl = null;

      // Upload avatar if provided
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        // Use user ID if available, otherwise use timestamp for anonymous uploads
        const uniqueId = user?.id || `anon-${Date.now()}`;
        const fileName = `${uniqueId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);

        avatarUrl = urlData.publicUrl;
      }

      // Handle NFT minting
      if (simType === "NFT") {
        setIsNftMinting(true);
        toast.info("Connecting to Solana wallet...");
        
        // Import wallet adapter
        const { useWallet } = await import('@solana/wallet-adapter-react');
        
        // Check if wallet is connected
        if (!window.solana || !window.solana.isConnected) {
          toast.error("Please connect your Solana wallet first (Phantom or Solflare)");
          setIsSubmitting(false);
          setIsNftMinting(false);
          return;
        }

        toast.info("Minting NFT on Solana...");
        
        // Import and use NFT minting service
        const { mintNFT } = await import('@/services/nftMintService');
        
        try {
          const { mint, signature } = await mintNFT({
            wallet: window.solana,
            metadata: {
              name: name.trim(),
              symbol: nftSymbol.trim().toUpperCase(),
              description: description.trim(),
              image: avatarUrl || '',
              sellerFeeBasisPoints: Math.floor(parseFloat(nftRoyalty) * 100), // Convert % to basis points
              creators: cryptoWallet.trim() ? [{ address: cryptoWallet.trim(), share: 100 }] : undefined,
            },
            supply: parseInt(nftSupply) || 1,
          });

          // Store NFT info in database
          const simData: any = {
            user_id: user?.id || null,
            name: name.trim(),
            sim_category: "NFT",
            prompt: "N/A",
            description: description.trim(),
            avatar_url: avatarUrl,
            price: 0,
            integrations: [],
            is_active: true,
            is_public: true,
            edit_code: editCode,
            crypto_wallet: cryptoWallet.trim() || null,
            marketplace_category: "nft",
            welcome_message: `NFT: ${name.trim()} (${nftSymbol.trim()})`,
            auto_description: description.trim().substring(0, 150),
            social_links: {
              mint_address: mint,
              transaction_signature: signature,
              symbol: nftSymbol.trim().toUpperCase(),
              supply: parseInt(nftSupply) || 1,
              royalty_percent: parseFloat(nftRoyalty),
            },
          };

          const { data: newSim, error: insertError } = await supabase
            .from("advisors")
            .insert(simData)
            .select()
            .single();

          if (insertError) throw insertError;

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

          toast.success(`NFT minted successfully! Mint: ${mint.substring(0, 8)}...`);
          setIsNftMinting(false);
          onOpenChange(false);
          setStep(1);
          setName("");
          setSimType("Chat");
          setCategory("");
          setDescription("");
          setAvatarFile(null);
          setAvatarPreview(null);
          setCryptoWallet("");
          setNftSymbol("");
          setNftSupply("1");
          setNftRoyalty("5");
          
          if (onSuccess) {
            await onSuccess();
          }
          window.location.href = "/";
          return;
        } catch (mintError: any) {
          console.error("Error minting NFT:", mintError);
          toast.error(mintError?.message || "Failed to mint NFT");
          setIsSubmitting(false);
          setIsNftMinting(false);
          return;
        }
      }

      // Generate a welcome message based on the system prompt
      let welcomeMessage = `Hi! I'm ${name.trim()}. How can I help you today?`;
      try {
        const { data: welcomeData } = await supabase.functions.invoke("chat-completion", {
          body: {
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant that creates engaging welcome messages for AI chatbots. The welcome message should: 1) Greet the user warmly, 2) Briefly explain what the AI does, 3) Explain HOW users should interact (rules, format, what to do first), 4) Be 2-3 sentences, under 200 characters. Write in first person from the AI's perspective.",
              },
              {
                role: "user",
                content: `Create a welcome message for an AI called "${name.trim()}" with this description: ${description.trim()}\n\nSystem prompt: ${systemPrompt.trim()}`,
              },
            ],
          },
        });

        if (welcomeData?.content) {
          welcomeMessage = welcomeData.content.trim();
        }
      } catch (error) {
        console.error("Error generating welcome message:", error);
        // Use fallback if generation fails
      }

      // Generate short auto-description based on system prompt
      let autoDescription = "";
      try {
        const { data: shortDescData } = await supabase.functions.invoke("generate-short-description", {
          body: { systemPrompt: systemPrompt.trim() },
        });

        if (shortDescData?.shortDescription) {
          autoDescription = shortDescData.shortDescription.trim();
        }
      } catch (error) {
        console.error("Error generating short description:", error);
        // Use fallback if generation fails
        autoDescription = description.trim().substring(0, 150);
      }

      // Prepare social links object
      const socialLinks: any = {};
      if (xLink.trim()) socialLinks.x = xLink.trim();
      if (websiteLink.trim()) socialLinks.website = websiteLink.trim();
      if (telegramLink.trim()) socialLinks.telegram = telegramLink.trim();

      // Create the sim with edit code
      const simData: any = {
        user_id: user?.id || null, // Set to null if no user
        name: name.trim(),
        sim_category: simType,
        prompt: simType === "Chat" ? systemPrompt.trim() : "N/A",
        avatar_url: avatarUrl,
        price: 0,
        integrations: allIntegrations,
        is_active: true,
        is_public: true,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        edit_code: editCode,
        crypto_wallet: cryptoWallet.trim() || null,
        x402_enabled: x402Enabled,
        x402_price: x402Enabled && x402Price ? parseFloat(x402Price) : null,
        x402_wallet: x402Enabled && x402Wallet.trim() ? x402Wallet.trim() : null,
      };

      // Set fields based on sim type
      if (simType === "Autonomous Agent") {
        simData.description = briefTopic.trim();
        simData.welcome_message = briefTime;
        simData.marketplace_category = agentCategory;
        simData.auto_description = briefTopic.trim().substring(0, 150);
        // Store email in social_links if provided
        if (briefEmail.trim()) {
          simData.social_links = { ...simData.social_links, brief_email: briefEmail.trim() };
        }
      } else {
        simData.description = description.trim();
        simData.marketplace_category = category || null;
        simData.welcome_message = welcomeMessage;
        simData.auto_description = autoDescription;
      }

      const { data: newSim, error: insertError } = await supabase
        .from("advisors")
        .insert(simData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Automatically add to user's advisors list (only if user is authenticated)
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
          // Don't throw - sim is still created successfully
        }
      }

      toast.success("Sim created successfully!");

      // Close modal first
      onOpenChange(false);

      // Reset form
      setStep(1);
      setName("");
      setSimType("Chat");
      setCategory("");
      setDescription("");
      setSystemPrompt("");
      setWelcomeMessage("");
      setEditCode("");
      setAvatarFile(null);
      setAvatarPreview(null);
      setXLink("");
      setWebsiteLink("");
      setTelegramLink("");
      setCryptoWallet("");
      setX402Enabled(false);
      setX402Price("");
      setX402Wallet("");
      setAgentCategory("");
      setBriefTopic("");
      setBriefTime("09:00");
      setBriefEmail("");
      setSocialLinksOpen(false);

      // Call onSuccess to refresh queries
      if (onSuccess) {
        await onSuccess();
      }

      // Navigate to home page and refresh
      window.location.href = "/";
    } catch (error) {
      console.error("Error creating sim:", error);
      toast.error("Failed to create Sim");
    } finally {
      setIsSubmitting(false);
      setIsNftMinting(false);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleClose = () => {
    setStep(1);
    setName("");
    setSimType("Chat");
    setCategory("");
    setDescription("");
    setSystemPrompt("");
    setWelcomeMessage("");
    setEditCode("");
    setAvatarFile(null);
    setAvatarPreview(null);
    setXLink("");
    setWebsiteLink("");
    setTelegramLink("");
    setCryptoWallet("");
    setX402Enabled(false);
    setX402Price("");
    setX402Wallet("");
    setAgentCategory("");
    setBriefTopic("");
    setBriefTime("09:00");
    setBriefEmail("");
    setNftSymbol("");
    setNftSupply("1");
    setNftRoyalty("5");
    setSocialLinksOpen(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-border/50">
        {step === 1 ? (
          <div className="space-y-6 p-8">
            {/* Header */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Create New Sim</h2>
              <p className="text-sm text-muted-foreground">Choose carefully, these details define your AI</p>
            </div>

            {/* Sim Details Section */}
            <div className="space-y-4">
              {/* Avatar and Name side by side */}
              <div className="grid grid-cols-[auto,1fr] gap-4 items-start">
                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Avatar</Label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative w-24 h-24 rounded-xl cursor-pointer
                      transition-all duration-300 ease-out
                      ${
                        isDragging
                          ? "scale-[1.05] ring-4 ring-primary/50 shadow-lg shadow-primary/25"
                          : "hover:scale-[1.02] hover:shadow-md"
                      }
                      ${avatarPreview ? "ring-2 ring-border" : "ring-2 ring-dashed ring-border hover:ring-primary/50"}
                      bg-muted/30 backdrop-blur-sm
                      overflow-hidden group
                    `}
                  >
                    {avatarPreview ? (
                      <>
                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <ImagePlus className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Upload
                          className={`
                          w-8 h-8 transition-colors duration-300
                          ${isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"}
                        `}
                        />
                      </div>
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

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Sim name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name your sim"
                    required
                    maxLength={50}
                    className="h-11 bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    {name.length}/50 characters
                  </p>
                </div>
              </div>

              {/* SOL Wallet Address */}
              <div className="space-y-2">
                <Label htmlFor="crypto-wallet" className="text-sm font-medium">
                  SOL Wallet Address <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="crypto-wallet"
                  value={cryptoWallet}
                  onChange={(e) => setCryptoWallet(e.target.value)}
                  placeholder="7xKXt...aBcD"
                  className="h-11 bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Required if you want to claim Creator Rewards
                </p>
              </div>

              {/* Sim Type */}
              <div className="space-y-2">
                <Label htmlFor="sim-type" className="text-sm font-medium">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select value={simType} onValueChange={setSimType} required>
                  <SelectTrigger className="h-11 bg-background">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {simTypes.map((type: any) => (
                      <SelectItem 
                        key={type.value} 
                        value={type.value}
                        disabled={type.disabled}
                      >
                        <div className="flex items-center gap-2">
                          <span>{type.label}</span>
                          {type.comingSoon && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                              Coming Soon for $SimAI Holders
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category - only show for Chat type */}
              {simType === "Chat" && (
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="h-11 bg-background">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Description - only show for non-Autonomous Agent */}
              {simType !== "Autonomous Agent" && (
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write a short description"
                    rows={4}
                    className="resize-none bg-background"
                    required
                  />
                </div>
              )}

              {/* Agent Category - only show for Autonomous Agent */}
              {simType === "Autonomous Agent" && (
                <div className="space-y-2">
                  <Label htmlFor="agent-category" className="text-sm font-medium">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select value={agentCategory} onValueChange={setAgentCategory} required>
                    <SelectTrigger className="h-11 bg-background">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="Daily Brief">Daily Brief</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Brief Topic - only show after selecting Daily Brief */}
              {simType === "Autonomous Agent" && agentCategory === "Daily Brief" && (
                <div className="space-y-2">
                  <Label htmlFor="brief-topic" className="text-sm font-medium">
                    What do you want a daily brief on? <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="brief-topic"
                    value={briefTopic}
                    onChange={(e) => setBriefTopic(e.target.value)}
                    placeholder="E.g., AI developments, cryptocurrency markets, climate change news..."
                    rows={4}
                    className="resize-none bg-background"
                    required
                  />
                </div>
              )}

              {/* Brief Time - only show after selecting Daily Brief */}
              {simType === "Autonomous Agent" && agentCategory === "Daily Brief" && (
                <div className="space-y-2">
                  <Label htmlFor="brief-time" className="text-sm font-medium">
                    When do you want to receive your daily brief? (UTC) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="brief-time"
                    type="time"
                    value={briefTime}
                    onChange={(e) => setBriefTime(e.target.value)}
                    className="h-11 bg-background"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your brief will be generated daily at this time
                  </p>
                </div>
              )}

              {/* Brief Email - only show after selecting Daily Brief */}
              {simType === "Autonomous Agent" && agentCategory === "Daily Brief" && (
                <div className="space-y-2">
                  <Label htmlFor="brief-email" className="text-sm font-medium">
                    Email <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="brief-email"
                    type="email"
                    value={briefEmail}
                    onChange={(e) => setBriefEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-11 bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Receive your daily brief in your inbox
                  </p>
                </div>
              )}

              {/* NFT Fields - only show for NFT type */}
              {simType === "NFT" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nft-symbol" className="text-sm font-medium">
                      Symbol <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nft-symbol"
                      value={nftSymbol}
                      onChange={(e) => setNftSymbol(e.target.value)}
                      placeholder="e.g., MYNFT"
                      maxLength={10}
                      className="h-11 bg-background uppercase"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      NFT collection symbol (max 10 characters)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nft-supply" className="text-sm font-medium">
                      Supply <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nft-supply"
                      type="number"
                      min="1"
                      value={nftSupply}
                      onChange={(e) => setNftSupply(e.target.value)}
                      placeholder="1"
                      className="h-11 bg-background"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of NFTs to mint (1 for unique NFT)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nft-royalty" className="text-sm font-medium">
                      Royalty % <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nft-royalty"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={nftRoyalty}
                      onChange={(e) => setNftRoyalty(e.target.value)}
                      placeholder="5"
                      className="h-11 bg-background"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Creator royalty percentage on secondary sales (0-100%)
                    </p>
                  </div>
                </>
              )}

              {/* Social Links Collapsible - hide for Autonomous Agent */}
              {simType !== "Autonomous Agent" && (
                <Collapsible open={socialLinksOpen} onOpenChange={setSocialLinksOpen}>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors w-full py-2">
                    <Link2 className="w-4 h-4" />
                    <span>
                      Add social links <span className="text-muted-foreground">(Optional)</span>
                    </span>
                    {socialLinksOpen ? (
                      <ChevronUp className="w-4 h-4 ml-auto" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-auto" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-3">
                    <div className="space-y-2">
                      <Label htmlFor="x-link" className="text-sm">
                        X (Twitter)
                      </Label>
                      <Input
                        id="x-link"
                        value={xLink}
                        onChange={(e) => setXLink(e.target.value)}
                        placeholder="https://x.com/username"
                        className="h-10 bg-background"
                        type="url"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website-link" className="text-sm">
                        Website
                      </Label>
                      <Input
                        id="website-link"
                        value={websiteLink}
                        onChange={(e) => setWebsiteLink(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="h-10 bg-background"
                        type="url"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telegram-link" className="text-sm">
                        Telegram
                      </Label>
                      <Input
                        id="telegram-link"
                        value={telegramLink}
                        onChange={(e) => setTelegramLink(e.target.value)}
                        placeholder="https://t.me/username"
                        className="h-10 bg-background"
                        type="url"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* x402 Payment Settings - hide for Autonomous Agent */}
              {simType !== "Autonomous Agent" && simType !== "NFT" && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="x402-enabled" className="text-sm font-medium">
                        Require Payment (x402)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Require users to pay in USDC before chatting with your Sim
                      </p>
                    </div>
                    <Switch
                      id="x402-enabled"
                      checked={x402Enabled}
                      onCheckedChange={setX402Enabled}
                    />
                  </div>

                  {x402Enabled && (
                    <div className="space-y-3 pl-4 border-l-2 border-primary/30">
                      <div className="space-y-2">
                        <Label htmlFor="x402-price" className="text-sm font-medium">
                          Price in USDC <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="x402-price"
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={x402Price}
                          onChange={(e) => setX402Price(e.target.value)}
                          placeholder="0.01"
                          className="h-10 bg-background"
                          required={x402Enabled}
                        />
                        <p className="text-xs text-muted-foreground">
                          Example: 0.01 for $0.01 USDC per conversation
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="x402-wallet" className="text-sm font-medium">
                          EVM Wallet Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="x402-wallet"
                          value={x402Wallet}
                          onChange={(e) => setX402Wallet(e.target.value)}
                          placeholder="0x..."
                          className="h-10 bg-background font-mono text-sm"
                          required={x402Enabled}
                        />
                        <p className="text-xs text-muted-foreground">
                          Base network wallet address to receive payments
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <div className="pt-2">
              <Button
                type="button"
                size="lg"
                onClick={handleGeneratePrompt}
                disabled={
                  isGenerating || 
                  !name.trim() || 
                  (simType === "Chat" && (!description.trim() || !category)) ||
                  (simType === "Crypto Mail" && !description.trim()) ||
                  (simType === "NFT" && (!description.trim() || !nftSymbol.trim() || !avatarFile || !cryptoWallet.trim())) ||
                  (simType === "Autonomous Agent" && (!briefTopic.trim() || !agentCategory || !briefTime))
                }
                className="gap-2 w-full h-12 font-semibold bg-[#82f2aa] hover:bg-[#6dd994] text-black"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Sim...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {simType === "Crypto Mail" || simType === "Autonomous Agent" || simType === "NFT" ? "Continue" : "Generate Sim"}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 p-8">
            <div className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2 -ml-2 hover:bg-muted/50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <div className="space-y-3 relative">
                <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                  Review & Create
                </h2>
                <p className="text-sm text-muted-foreground">
                  {simType === "Autonomous Agent" ? "Review your Autonomous Agent" : "Review and edit your sim's generated content"}
                </p>
              </div>

              {/* Edit Code Display */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-[#82f2aa]/10 via-[#82f2aa]/5 to-[#82f2aa]/10 border-2 border-[#82f2aa]/20">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#82f2aa] animate-pulse" />
                    <h3 className="font-semibold text-lg">Your Sim Creator Code</h3>
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
                      This is the only way to edit your Sim after it&apos;s created. Keep it safe and don&apos;t share
                      it with anyone.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary for Autonomous Agent / Welcome Message for others */}
            {simType === "Autonomous Agent" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Sim Summary
                  </Label>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>
                <div className="p-6 rounded-lg bg-muted/50 border border-border space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <p className="text-base font-semibold">Autonomous Agent - Daily Brief</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Brief Topic</p>
                    <p className="text-base">{briefTopic}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Scheduled Time (UTC)</p>
                    <p className="text-base">{briefTime}</p>
                  </div>
                  {briefEmail && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-base">{briefEmail}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Your daily brief will be automatically generated every day at the scheduled time and will appear in your Sim dashboard.
                      {briefEmail && " You will also receive it in your inbox."}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  <Label
                    htmlFor="welcome-message"
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Welcome Message
                  </Label>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>
                <Textarea
                  id="welcome-message"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="The first message users will see"
                  rows={3}
                  className="resize-none bg-background border-border text-foreground focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            )}

            {/* System Prompt - only show for Chat sims */}
            {simType === "Chat" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  <Label
                    htmlFor="system-prompt"
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    System Prompt <span className="text-destructive">*</span>
                  </Label>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>
                <Textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="The core instructions that define your sim's behavior and personality"
                  rows={12}
                  className="resize-none font-mono text-xs bg-background border-border text-foreground focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 h-12 hover:bg-muted/50 transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isNftMinting || (simType === "Chat" && !systemPrompt.trim())}
                className="flex-1 h-12 gap-2 bg-[#82f2aa] hover:bg-[#6dd994] text-black shadow-lg shadow-[#82f2aa]/25 hover:shadow-xl hover:shadow-[#82f2aa]/30 transition-all duration-300 font-semibold"
              >
                {isSubmitting || isNftMinting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isNftMinting ? "Minting NFT..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {simType === "NFT" ? "Mint NFT" : "Create Sim"}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
