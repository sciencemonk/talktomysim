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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Create New Sim</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Build an AI sim with custom knowledge, personality, and integrations
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Sim Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold">Sim Identity</h3>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <Label className="text-sm font-medium mb-2 block">Avatar</Label>
                <Avatar 
                  className="w-28 h-28 cursor-pointer border-2 border-border hover:border-primary transition-colors" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Avatar preview" className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-muted">
                      <Upload className="w-8 h-8 text-muted-foreground" />
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
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 w-28 text-sm"
                >
                  Upload
                </Button>
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Sim Name <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">(What users will call your sim)</p>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Marcus the Sales Advisor, Dr. Code, Legal Eagle"
                    required
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </div>


          {/* Category & Positioning */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold">Category & Positioning</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Primary Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="h-10">
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
              <p className="text-xs text-muted-foreground">
                Helps users discover your agent and optimizes AI behavior
              </p>
            </div>
          </div>

          {/* Intelligence & Behavior */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold">Intelligence & Behavior</h3>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm font-medium">💡 Build an effective sim by defining:</p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• Clear expertise and what problems it solves</li>
                <li>• Unique personality and communication style</li>
                <li>• Specific actions it can take for users</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Sim Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: An expert marketing strategist who analyzes campaigns, suggests improvements, and creates data-driven strategies. Specializes in social media growth and conversion optimization."
                rows={3}
                className="resize-none"
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              size="default"
              onClick={handleGeneratePrompt}
              disabled={isGenerating || !description.trim() || !category}
              className="gap-2 w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Auto-Generate System Prompt
                </>
              )}
            </Button>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt" className="text-sm font-medium">
                System Prompt <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                The core instructions that define your sim's behavior and personality
              </p>
              <Textarea
                id="systemPrompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are a highly skilled marketing strategist with 15 years of experience...&#10;&#10;Your expertise includes:&#10;- Campaign optimization&#10;- Data analysis&#10;- Social media growth&#10;&#10;Your communication style is professional yet friendly..."
                rows={10}
                required
                className="resize-none font-mono text-sm"
              />
            </div>
          </div>

          {/* Integrations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <div>
                <h3 className="text-base font-semibold">Integrations (Optional)</h3>
                <p className="text-xs text-muted-foreground">
                  Add capabilities beyond basic chat
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {availableIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors"
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

          {/* Monetization Notice */}
          <div className="p-3 rounded-lg border bg-muted/50">
            <p className="text-sm">
              💎 <span className="font-medium">Monetize your sim with $SIMAI</span>
              <span className="text-muted-foreground ml-1">— Coming Soon</span>
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !category || !systemPrompt.trim()}
              className="flex-1 gap-2"
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