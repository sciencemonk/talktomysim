import { useState, useRef, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Sparkles, ArrowLeft, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateSimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onAuthRequired?: () => void;
}

const categories = [
  { value: 'crypto', label: 'Crypto & Web3' },
  { value: 'historical', label: 'Historical Figures' },
  { value: 'influencers', label: 'Influencers & Celebrities' },
  { value: 'fictional', label: 'Fictional Characters' },
  { value: 'education', label: 'Education & Tutoring' },
  { value: 'business', label: 'Business & Finance' },
  { value: 'lifestyle', label: 'Lifestyle & Wellness' },
  { value: 'entertainment', label: 'Entertainment & Games' },
  { value: 'spiritual', label: 'Spiritual & Philosophy' },
  { value: 'adult', label: 'Adult' },
];

export const CreateSimModal = ({ open, onOpenChange, onSuccess, onAuthRequired }: CreateSimModalProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableIntegrations = [
    { 
      id: 'solana-explorer', 
      label: 'Solana Explorer', 
      description: 'Access Solana blockchain data and wallet information',
      example: 'e.g., "Check my wallet balance" or "What\'s the latest on this token?"'
    },
    { 
      id: 'pumpfun', 
      label: 'PumpFun', 
      description: 'Analyze and monitor PumpFun token trades',
      example: 'e.g., "Show me recent trades for this token" or "What\'s trending on PumpFun?"'
    },
    { 
      id: 'x-analyzer', 
      label: 'X (Twitter) Analyzer', 
      description: 'Analyze X/Twitter profiles and content',
      example: 'e.g., "Analyze this Twitter profile" or "What\'s the sentiment on this account?"'
    },
    { 
      id: 'crypto-prices', 
      label: 'Crypto Prices', 
      description: 'Get real-time cryptocurrency prices and market data',
      example: 'e.g., "What\'s the price of Bitcoin?" or "How much is SOL worth right now?"'
    },
  ];

  const toggleIntegration = (integrationId: string) => {
    setSelectedIntegrations(prev => 
      prev.includes(integrationId)
        ? prev.filter(id => id !== integrationId)
        : [...prev, integrationId]
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
  };

  const processAvatarFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
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
          integrations: selectedIntegrations 
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
              content: "You are a helpful assistant that creates brief, engaging welcome messages for AI chatbots based on their details. Keep it to 1-2 sentences, under 150 characters, in first person."
            },
            {
              role: "user",
              content: `Create a welcome message for an AI called "${name.trim()}" with this description: ${description.trim()}`
            }
          ]
        }
      });
      
      if (welcomeData?.content) {
        setWelcomeMessage(welcomeData.content.trim());
      } else {
        setWelcomeMessage(`Hi! I'm ${name.trim()}. How can I help you today?`);
      }

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsSubmitting(false);
        onOpenChange(false);
        if (onAuthRequired) {
          onAuthRequired();
        } else {
          toast.error("Please sign in to create a Sim");
        }
        return;
      }

      let avatarUrl = null;

      // Upload avatar if provided
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

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
                content: "You are a helpful assistant that creates engaging welcome messages for AI chatbots. The welcome message should: 1) Greet the user warmly, 2) Briefly explain what the AI does, 3) Explain HOW users should interact (rules, format, what to do first), 4) Be 2-3 sentences, under 200 characters. Write in first person from the AI's perspective."
              },
              {
                role: "user",
                content: `Create a welcome message for an AI called "${name.trim()}" with this description: ${description.trim()}\n\nSystem prompt: ${systemPrompt.trim()}`
              }
            ]
          }
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
          body: { systemPrompt: systemPrompt.trim() }
        });
        
        if (shortDescData?.shortDescription) {
          autoDescription = shortDescData.shortDescription.trim();
        }
      } catch (error) {
        console.error("Error generating short description:", error);
        // Use fallback if generation fails
        autoDescription = description.trim().substring(0, 150);
      }

      // Create the sim
      const { data: newSim, error: insertError } = await supabase
        .from('advisors')
        .insert({
          user_id: user.id,
          name: name.trim(),
          title: title.trim() || null,
          category: category || null,
          description: description.trim(),
          auto_description: autoDescription,
          prompt: systemPrompt.trim(),
          avatar_url: avatarUrl,
          price: 0,
          integrations: selectedIntegrations,
          is_active: true,
          is_public: true,
          welcome_message: welcomeMessage,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Automatically add to user's advisors list
      if (newSim) {
        const { error: userAdvisorError } = await supabase
          .from('user_advisors')
          .insert({
            user_id: user.id,
            advisor_id: newSim.id,
            name: newSim.name,
            title: newSim.title,
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
      setTitle("");
      setCategory("");
      setDescription("");
      setSystemPrompt("");
      setWelcomeMessage("");
      setAvatarFile(null);
      setAvatarPreview(null);
      setSelectedIntegrations([]);
      
      // Call onSuccess to refresh queries and then navigate
      if (onSuccess) {
        await onSuccess();
      }
      
      // Navigate to the new sim's chat after a brief delay to allow queries to refresh
      setTimeout(() => {
        navigate(`/home?sim=${newSim.id}`);
      }, 100);
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
    setTitle("");
    setCategory("");
    setDescription("");
    setSystemPrompt("");
    setWelcomeMessage("");
    setAvatarFile(null);
    setAvatarPreview(null);
    setSelectedIntegrations([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-border/50 bg-gradient-to-br from-background via-background to-muted/20">
        {step === 1 ? (
          <div className="space-y-8 p-8">
            {/* Header with gradient accent */}
            <div className="space-y-3 relative">
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                Create New Sim
              </h2>
              <p className="text-sm text-muted-foreground">
                Build an AI sim with custom knowledge, personality, and integrations
              </p>
            </div>

            {/* Sim Identity */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Identity</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
              
              <div className="flex gap-8 items-start">
                {/* Avatar Upload with Drag & Drop */}
                <div className="flex flex-col items-center gap-3">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative w-40 aspect-[4/3] rounded-2xl cursor-pointer
                      transition-all duration-300 ease-out
                      ${isDragging 
                        ? 'scale-105 ring-4 ring-primary/50 shadow-lg shadow-primary/25' 
                        : 'hover:scale-105 hover:shadow-xl'
                      }
                      ${avatarPreview 
                        ? 'ring-2 ring-primary/30' 
                        : 'ring-2 ring-dashed ring-border hover:ring-primary/50'
                      }
                      bg-gradient-to-br from-muted/50 to-muted/20 backdrop-blur-sm
                      overflow-hidden group
                    `}
                  >
                    {avatarPreview ? (
                      <>
                        <img 
                          src={avatarPreview} 
                          alt="Avatar preview" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <ImagePlus className="w-8 h-8 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <div className={`
                          transition-all duration-300
                          ${isDragging ? 'scale-110' : 'group-hover:scale-110'}
                        `}>
                          <Upload className={`
                            w-8 h-8 transition-colors duration-300
                            ${isDragging ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}
                          `} />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium text-center px-4">
                          {isDragging ? 'Drop here' : 'Click or drag'}
                        </p>
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

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Marcus, Dr. Code, Legal Eagle"
                      required
                      className="h-12 bg-input-bg border-input-border focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
              
              <div className="space-y-2">
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="h-12 bg-input-bg border-input-border focus:ring-2 focus:ring-primary/20 transition-all">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50 border-border/50">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="focus:bg-muted/50">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Intelligence & Behavior */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Behavior</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does your Sim do?"
                  rows={3}
                  className="resize-none bg-input-bg border-input-border focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Integrations */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="text-center">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Integrations</h3>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    Optional capabilities
                  </p>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              <div className="space-y-2">
                {availableIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/30 hover:border-primary/30 transition-all duration-200"
                  >
                    <Checkbox
                      id={integration.id}
                      checked={selectedIntegrations.includes(integration.id)}
                      onCheckedChange={() => toggleIntegration(integration.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={integration.id}
                        className="text-sm font-medium cursor-pointer block"
                      >
                        {integration.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Sim Button */}
            <div className="pt-4">
              <Button
                type="button"
                size="lg"
                onClick={handleGeneratePrompt}
                disabled={isGenerating || !name.trim() || !description.trim() || !category}
                className="gap-2 w-full h-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 text-base font-semibold"
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
                <p className="text-sm text-muted-foreground">
                  Review and edit your sim's generated content
                </p>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <Label htmlFor="welcome-message" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                className="resize-none bg-input-bg border-input-border focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* System Prompt */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <Label htmlFor="system-prompt" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                className="resize-none font-mono text-xs bg-input-bg border-input-border focus:ring-2 focus:ring-primary/20 transition-all"
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