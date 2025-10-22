import { useState, useRef, DragEvent } from "react";
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

interface CreateSimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onAuthRequired?: () => void;
}

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

export const CreateSimModal = ({ open, onOpenChange, onSuccess, onAuthRequired }: CreateSimModalProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // All sims get all integrations by default
  const allIntegrations = ["solana-explorer", "pumpfun", "x-analyzer", "crypto-prices"];

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

    if (!description.trim()) {
      toast.error("Please enter a description first");
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

    if (!systemPrompt.trim()) {
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
      const { data: newSim, error: insertError } = await supabase
        .from("advisors")
        .insert({
          user_id: user?.id || null, // Set to null if no user
          name: name.trim(),
          category: category || null,
          description: description.trim(),
          auto_description: autoDescription,
          prompt: systemPrompt.trim(),
          avatar_url: avatarUrl,
          price: 0,
          integrations: allIntegrations,
          is_active: true,
          is_public: true,
          welcome_message: welcomeMessage,
          social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
          edit_code: editCode,
        })
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
          category: newSim.category,
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
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleClose = () => {
    setStep(1);
    setName("");
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
                    className="h-11 bg-background"
                  />
                </div>
              </div>

              {/* Category */}
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

              {/* Description */}
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

              {/* Social Links Collapsible */}
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
            </div>

            {/* Generate Button */}
            <div className="pt-2">
              <Button
                type="button"
                size="lg"
                onClick={handleGeneratePrompt}
                disabled={isGenerating || !name.trim() || !description.trim() || !category}
                className="gap-2 w-full h-12 font-semibold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Sim...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Sim
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
                <p className="text-sm text-muted-foreground">Review and edit your sim&apos;s generated content</p>
              </div>

              {/* Edit Code Display */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="font-semibold text-lg">Your Sim Edit Code</h3>
                  </div>
                  <div className="flex items-center justify-between gap-4 p-4 bg-background/50 rounded-lg border border-border">
                    <div className="flex-1">
                      <p className="text-3xl font-mono font-bold tracking-wider text-primary">{editCode}</p>
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

            {/* Welcome Message */}
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

            {/* System Prompt */}
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
                disabled={isSubmitting || !systemPrompt.trim()}
                className="flex-1 h-12 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Create Sim
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
