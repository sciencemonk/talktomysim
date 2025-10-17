import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Link2, Copy, Check, User, Briefcase, MessageCircle, Lightbulb, X, Globe, Wallet } from "lucide-react";
import { AgentType } from "@/types/agent";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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
  
  // New fields for comprehensive sim creation
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [professionalBg, setProfessionalBg] = useState('');
  const [communicationStyle, setCommunicationStyle] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [newExpertise, setNewExpertise] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [cryptoWallet, setCryptoWallet] = useState('');

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
          twitter_url: twitterUrl,
          website_url: websiteUrl,
          crypto_wallet: cryptoWallet,
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

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !expertise.includes(newExpertise.trim())) {
      setExpertise([...expertise, newExpertise.trim()]);
      setNewExpertise('');
    }
  };

  const removeExpertise = (exp: string) => {
    setExpertise(expertise.filter(e => e !== exp));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 border-2 border-white/20 bg-gradient-to-br from-black/95 to-black/90 backdrop-blur-xl text-white overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-white/10 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-white">Create Your Twin</DialogTitle>
          <p className="text-sm text-white/60 mt-1">Build a sim that represents your personality, knowledge, and communication style</p>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-8 p-6">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4 pb-6 border-b border-white/10">
              <Avatar className="h-32 w-32 border-4 border-white/20 ring-4 ring-white/5 shadow-2xl">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-white">
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
                className="gap-2 border-white/20 bg-white/5 hover:bg-white/10 text-white"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload Avatar'}
              </Button>
            </div>

            {/* Section: Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/90">
                <User className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Basic Information</h3>
              </div>
              
              {/* Custom URL */}
              <div className="space-y-2 pl-7">
                <Label htmlFor="custom-url" className="text-sm font-medium text-white/80">Your Sim URL</Label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-lg bg-white/5 border-white/20">
                    <Link2 className="h-4 w-4 text-white/40 flex-shrink-0" />
                    <span className="text-sm font-mono truncate text-white/70">
                      {window.location.origin}/{customUrl || 'your-url'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyUrl}
                    disabled={!customUrl}
                    className="flex-shrink-0 border-white/20 bg-white/5 hover:bg-white/10 text-white"
                  >
                    {urlCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Input
                  id="custom-url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="your-sim-name"
                  className="font-mono bg-white/5 border-white/20 text-white placeholder:text-white/30"
                />
                <p className="text-xs text-white/40">
                  This is the URL people will use to access your sim
                </p>
              </div>

              {/* Name */}
              <div className="space-y-2 pl-7">
                <Label htmlFor="name" className="text-sm font-medium text-white/80">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your sim's name"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                />
              </div>

              {/* Title */}
              <div className="space-y-2 pl-7">
                <Label htmlFor="title" className="text-sm font-medium text-white/80">Title / Tagline</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., AI Expert, Crypto Enthusiast"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 pl-7">
                <Label htmlFor="description" className="text-sm font-medium text-white/80">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your sim"
                  className="min-h-[80px] bg-white/5 border-white/20 text-white placeholder:text-white/30 resize-none"
                />
              </div>
            </div>

            {/* Section: Professional Background */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/90">
                <Briefcase className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Professional Background</h3>
              </div>
              
              <div className="space-y-2 pl-7">
                <Label htmlFor="professional-bg" className="text-sm font-medium text-white/80">Professional Experience</Label>
                <Textarea
                  id="professional-bg"
                  value={professionalBg}
                  onChange={(e) => setProfessionalBg(e.target.value)}
                  placeholder="Share your professional background, key experiences, and achievements..."
                  className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder:text-white/30 resize-none"
                />
                <p className="text-xs text-white/40">
                  This helps your sim understand your professional context
                </p>
              </div>

              {/* Areas of Expertise */}
              <div className="space-y-2 pl-7">
                <Label className="text-sm font-medium text-white/80">Areas of Expertise</Label>
                <div className="flex gap-2">
                  <Input
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
                    placeholder="Add expertise (press Enter)"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={addExpertise}
                    className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
                  >
                    Add
                  </Button>
                </div>
                {expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {expertise.map((exp, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
                      >
                        {exp}
                        <button
                          onClick={() => removeExpertise(exp)}
                          className="ml-2 hover:text-white/70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section: Interests & Personality */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/90">
                <Lightbulb className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Interests & Personality</h3>
              </div>
              
              {/* Interests */}
              <div className="space-y-2 pl-7">
                <Label className="text-sm font-medium text-white/80">Interests & Hobbies</Label>
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    placeholder="Add interest (press Enter)"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={addInterest}
                    className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
                  >
                    Add
                  </Button>
                </div>
                {interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {interests.map((interest, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
                      >
                        {interest}
                        <button
                          onClick={() => removeInterest(interest)}
                          className="ml-2 hover:text-white/70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-white/40">
                  Add topics you're passionate about to make your sim more relatable
                </p>
              </div>
            </div>

            {/* Section: Communication Style */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/90">
                <MessageCircle className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Communication Style</h3>
              </div>
              
              <div className="space-y-2 pl-7">
                <Label htmlFor="communication-style" className="text-sm font-medium text-white/80">How do you communicate?</Label>
                <Textarea
                  id="communication-style"
                  value={communicationStyle}
                  onChange={(e) => setCommunicationStyle(e.target.value)}
                  placeholder="Describe your communication style... Are you formal or casual? Do you use humor? How do you explain complex ideas?"
                  className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder:text-white/30 resize-none"
                />
                <p className="text-xs text-white/40">
                  This helps your sim match your unique way of communicating
                </p>
              </div>

              {/* System Prompt */}
              <div className="space-y-2 pl-7">
                <Label htmlFor="prompt" className="text-sm font-medium text-white/80">Advanced: System Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Instructions for how your sim should behave and respond"
                  className="min-h-[120px] font-mono text-sm bg-white/5 border-white/20 text-white placeholder:text-white/30 resize-none"
                />
                <p className="text-xs text-white/40">
                  Fine-tune your sim's personality with custom instructions
                </p>
              </div>
            </div>

            {/* Section: Social Links & Donations */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/90">
                <Globe className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Social Links & Donations</h3>
              </div>
              
              <div className="space-y-2 pl-7">
                <Label htmlFor="twitter" className="text-sm font-medium text-white/80">X (Twitter) Profile</Label>
                <Input
                  id="twitter"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://x.com/yourhandle"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                />
              </div>

              <div className="space-y-2 pl-7">
                <Label htmlFor="website" className="text-sm font-medium text-white/80">Personal Website</Label>
                <Input
                  id="website"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                />
              </div>

              <div className="space-y-2 pl-7">
                <Label htmlFor="crypto" className="text-sm font-medium text-white/80">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Crypto Wallet (for donations)
                  </div>
                </Label>
                <Input
                  id="crypto"
                  value={cryptoWallet}
                  onChange={(e) => setCryptoWallet(e.target.value)}
                  placeholder="Your wallet address"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30 font-mono text-sm"
                />
                <p className="text-xs text-white/40">
                  Share your wallet address for crypto donations
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-white/10 bg-black/50 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-white text-black hover:bg-white/90 font-medium"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
