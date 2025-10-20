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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <form onSubmit={handleSubmit} className="space-y-8 p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Create New Sim</h2>
            <p className="text-sm text-muted-foreground">
              Build an AI sim with custom knowledge, personality, and integrations
            </p>
          </div>

          {/* Sim Identity */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-foreground/80">Identity</h3>
            
            <div className="flex gap-8 items-start">
              <div className="flex flex-col items-center gap-3">
                <Avatar 
                  className="w-24 h-24 cursor-pointer border border-border/50 hover:border-border transition-colors" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Avatar preview" className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-muted/50">
                      <Upload className="w-6 h-6 text-muted-foreground/50" />
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
                  className="text-xs h-8 px-4"
                >
                  Upload
                </Button>
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Marcus, Dr. Code, Legal Eagle"
                    required
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground/80">Category</h3>
            
            <div className="space-y-2">
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="h-11">
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
          </div>

          {/* Intelligence & Behavior */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground/80">Behavior</h3>
            
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
                className="resize-none"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={handleGeneratePrompt}
              disabled={isGenerating || !description.trim() || !category}
              className="gap-2 w-full h-11"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate System Prompt
                </>
              )}
            </Button>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt" className="text-sm font-medium">
                System Prompt <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="systemPrompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are an expert in..."
                rows={8}
                required
                className="resize-none text-sm font-mono"
              />
            </div>
          </div>

          {/* Integrations */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-foreground/80">Integrations</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Optional capabilities beyond basic chat
              </p>
            </div>

            <div className="space-y-2">
              {availableIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border/50 hover:border-border transition-colors"
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

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !category || !systemPrompt.trim()}
              className="flex-1 h-11 gap-2"
            >
               {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Sim"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};