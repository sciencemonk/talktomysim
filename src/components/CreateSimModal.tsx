import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          price: isFree ? 0 : parseFloat(price) || 0,
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
      setIsFree(true);
      setPrice("");
    } catch (error) {
      console.error("Error creating sim:", error);
      toast.error("Failed to create Sim");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Create Your Sim</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Build an AI agent that users can interact with. Fill in the details below to bring your Sim to life.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4 p-6 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors bg-muted/30">
            <Avatar className="w-32 h-32 cursor-pointer ring-4 ring-background shadow-xl" onClick={() => fileInputRef.current?.click()}>
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt="Avatar preview" className="object-cover" />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Upload className="w-10 h-10" />
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
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {avatarPreview ? "Change Avatar" : "Upload Avatar"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Recommended: 512x512px</p>
            </div>
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Sim Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Alex the Marketing Expert"
                required
                className="h-11"
              />
            </div>

            {/* Title/Role */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                Title/Role
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Marketing Expert, Code Helper"
                className="h-11"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-semibold">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a category for your Sim" />
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
              This helps users discover your Sim and improves AI prompt generation
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your Sim does, its expertise, and how it helps users..."
              rows={3}
              className="resize-none"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleGeneratePrompt}
              disabled={isGenerating || !description.trim() || !category}
              className="gap-2 mt-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating AI Prompt...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate AI System Prompt
                </>
              )}
            </Button>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="systemPrompt" className="text-sm font-semibold">
              System Prompt <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter the AI instructions that define your Sim's personality, expertise, and behavior..."
              rows={8}
              required
              className="resize-none font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This is the core instruction set that controls how your Sim thinks and responds. Be specific and detailed.
            </p>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Free to Use</Label>
                <p className="text-xs text-muted-foreground">
                  Make your Sim accessible to everyone at no cost
                </p>
              </div>
              <Switch
                checked={isFree}
                onCheckedChange={setIsFree}
              />
            </div>

            {!isFree && (
              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="price" className="text-sm font-semibold">
                  Price per Conversation
                </Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="h-11 pr-20"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    $SIMAI
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Users pay this amount in $SIMAI tokens to start a conversation
                </p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
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
                  Creating Your Sim...
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