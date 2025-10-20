import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateSimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
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

export const CreateSimModal = ({ open, onOpenChange, onSuccess }: CreateSimModalProps) => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
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
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGeneratePrompt = async () => {
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
      const { data, error } = await supabase.functions.invoke("generate-system-prompt", {
        body: { description, category },
      });

      if (error) throw error;

      if (data?.systemPrompt) {
        setSystemPrompt(data.systemPrompt);
        toast.success("System prompt generated!");
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast.error("Failed to generate system prompt");
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
      if (!user) throw new Error("Not authenticated");

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

      // Create the sim
      const { error: insertError } = await supabase
        .from('advisors')
        .insert({
          user_id: user.id,
          name: name.trim(),
          title: title.trim() || null,
          category: category || null,
          description: description.trim(),
          prompt: systemPrompt.trim(),
          avatar_url: avatarUrl,
          price: 0,
          integrations: selectedIntegrations,
          is_active: true,
          is_public: true,
        });

      if (insertError) throw insertError;

      toast.success("Sim created successfully!");
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setName("");
      setTitle("");
      setCategory("");
      setDescription("");
      setSystemPrompt("");
      setAvatarFile(null);
      setAvatarPreview(null);
      setSelectedIntegrations([]);
    } catch (error) {
      console.error("Error creating sim:", error);
      toast.error("Failed to create Sim");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20">
        <DialogHeader className="space-y-3 pb-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Create Your AI Agent
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Build an intelligent agent with custom knowledge, integrations, and personality
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 mt-6">
          {/* Basic Identity */}
          <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h3 className="text-lg font-semibold">Agent Identity</h3>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <Label className="text-sm font-semibold mb-2 block">Avatar</Label>
                <Avatar 
                  className="w-24 h-24 cursor-pointer ring-2 ring-border hover:ring-primary transition-all shadow-lg" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Avatar preview" className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                      <Upload className="w-8 h-8" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-xs h-8 w-24"
                >
                  {avatarPreview ? "Change" : "Upload"}
                </Button>
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                    Agent Name <span className="text-destructive">*</span>
                    <span className="text-xs font-normal text-muted-foreground">(What users will call your agent)</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Marcus the Sales Advisor, Dr. Code, Legal Eagle"
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
                    Professional Title
                    <span className="text-xs font-normal text-muted-foreground">(Expertise or role)</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Senior Marketing Strategist, Full-Stack Developer"
                    className="h-12 text-base"
                  />
                </div>
              </div>
            </div>
          </div>


          {/* Category & Positioning */}
          <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h3 className="text-lg font-semibold">Category & Positioning</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold">
                Primary Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select your agent's primary domain" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Helps users discover your agent and optimizes AI behavior
              </p>
            </div>
          </div>

          {/* Agent Intelligence & Behavior */}
          <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h3 className="text-lg font-semibold">Intelligence & Behavior</h3>
            </div>

            <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium text-foreground">💡 Create an effective agent by defining:</p>
              <ul className="text-xs text-muted-foreground space-y-1.5 ml-4">
                <li>• <strong>Clear expertise</strong>: What specific problems does it solve?</li>
                <li>• <strong>Unique personality</strong>: How should it communicate and engage?</li>
                <li>• <strong>Action-oriented</strong>: What can it actually DO for users?</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Agent Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: 'An expert marketing strategist who analyzes campaigns, suggests improvements, and creates data-driven strategies. Specializes in social media growth and conversion optimization.'"
                rows={3}
                className="resize-none text-base"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="default"
                onClick={handleGeneratePrompt}
                disabled={isGenerating || !description.trim() || !category}
                className="gap-2 flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating AI Instructions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Auto-Generate System Prompt
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt" className="text-sm font-semibold flex items-center gap-2">
                System Prompt <span className="text-destructive">*</span>
                <span className="text-xs font-normal text-muted-foreground">(The AI's core instructions)</span>
              </Label>
              <Textarea
                id="systemPrompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are a highly skilled marketing strategist with 15 years of experience...&#10;&#10;Your expertise includes:&#10;- Campaign optimization&#10;- Data analysis&#10;- Social media growth&#10;&#10;Your communication style is professional yet friendly..."
                rows={10}
                required
                className="resize-none font-mono text-sm leading-relaxed"
              />
              <p className="text-xs text-muted-foreground">
                ⚡ Pro tip: Be specific about expertise, tone, and how the agent should handle different scenarios
              </p>
            </div>
          </div>

          {/* Integrations - What Makes This More Than a Chatbot */}
          <div className="space-y-4 p-6 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Superpowers & Integrations</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Transform your agent from a chatbot into an intelligent assistant with real capabilities
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {availableIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                    selectedIntegrations.includes(integration.id)
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border bg-background hover:border-primary/50'
                  }`}
                >
                  <Checkbox
                    id={integration.id}
                    checked={selectedIntegrations.includes(integration.id)}
                    onCheckedChange={() => toggleIntegration(integration.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={integration.id}
                      className="text-base font-semibold cursor-pointer leading-tight block"
                    >
                      {integration.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 leading-tight">
                      {integration.description}
                    </p>
                    <div className="mt-2 p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground italic leading-tight">
                        {integration.example}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedIntegrations.length === 0 && (
              <div className="text-center py-3 text-sm text-muted-foreground">
                💡 Select integrations to give your agent real-world capabilities
              </div>
            )}
          </div>

          {/* Monetization Coming Soon */}
          <div className="p-4 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <p className="text-sm text-foreground">
              💎 <span className="font-semibold">Monetize your agent with $SIMAI</span>
              <span className="text-muted-foreground ml-2">— Coming Soon</span>
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 h-12 text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !category || !systemPrompt.trim()}
              className="flex-1 h-12 gap-2 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
               {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Your Agent...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Create AI Agent
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};