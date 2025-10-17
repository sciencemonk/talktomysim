import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Link2, Copy, Check } from "lucide-react";
import { AgentType } from "@/types/agent";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SimSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sim: AgentType;
  onSimUpdate: (updatedSim: AgentType) => void;
}

export const SimSettingsModal = ({ open, onOpenChange, sim, onSimUpdate }: SimSettingsModalProps) => {
  const { toast } = useToast();
  const [name, setName] = useState(sim.name);
  const [title, setTitle] = useState(sim.title || '');
  const [description, setDescription] = useState(sim.description || '');
  const [prompt, setPrompt] = useState(sim.prompt || '');
  const [avatar, setAvatar] = useState(sim.avatar || '');
  const [customUrl, setCustomUrl] = useState(sim.custom_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setAvatar(dataUrl);
      };
      reader.readAsDataURL(file);

      toast({
        title: "Image uploaded",
        description: "Your avatar has been updated."
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your avatar.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('advisors')
        .update({
          name,
          title,
          description,
          prompt,
          avatar_url: avatar,
          custom_url: customUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', sim.id)
        .select()
        .single();

      if (error) throw error;

      const updatedSim: AgentType = {
        ...sim,
        name,
        title,
        description,
        prompt,
        avatar,
        custom_url: customUrl,
        updatedAt: new Date().toISOString()
      };

      onSimUpdate(updatedSim);
      toast({
        title: "Saved!",
        description: "Your sim has been updated."
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving sim:", error);
      toast({
        title: "Failed to save",
        description: "There was an error updating your sim.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyUrl = () => {
    const url = customUrl ? `${window.location.origin}/${customUrl}` : '';
    navigator.clipboard.writeText(url);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Sim URL copied to clipboard"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 border-2 border-white/20 bg-white/95 backdrop-blur-md">
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <DialogTitle className="text-2xl font-bold">Sim Settings</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="space-y-6 p-6">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4 pb-6 border-b border-white/10">
              <Avatar className="h-24 w-24 border-2 border-primary/30 ring-4 ring-white/10">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                size="sm"
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload Avatar'}
              </Button>
            </div>

            {/* Custom URL */}
            <div className="space-y-2">
              <Label htmlFor="custom-url" className="text-sm font-medium">Your Sim URL</Label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-lg bg-white/50 border-white/20">
                  <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-mono truncate">
                    {window.location.origin}/{customUrl || 'your-url'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyUrl}
                  disabled={!customUrl}
                  className="flex-shrink-0"
                >
                  {urlCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Input
                id="custom-url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="your-sim-name"
                className="font-mono bg-white/50 border-white/20"
              />
              <p className="text-xs text-muted-foreground">
                This is the URL people will use to access your sim
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your sim's name"
                className="bg-white/50 border-white/20"
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Title / Tagline</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., AI Expert, Crypto Enthusiast"
                className="bg-white/50 border-white/20"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your sim"
                className="min-h-[80px] bg-white/50 border-white/20"
              />
            </div>

            {/* System Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-sm font-medium">System Prompt</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Instructions for how your sim should behave and respond"
                className="min-h-[150px] font-mono text-sm bg-white/50 border-white/20"
              />
              <p className="text-xs text-muted-foreground">
                This controls your sim's personality and how it responds to messages
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 p-6 pt-4 border-t border-white/10 bg-white/50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-black text-white hover:bg-black/90"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
