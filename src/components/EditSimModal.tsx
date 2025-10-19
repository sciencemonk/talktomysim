import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Link2, Copy, Check, Target, Brain, Users, Sparkles, Globe, Wallet, Info, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface EditSimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  simId: string;
}

const EditSimModal = ({ open, onOpenChange, simId }: EditSimModalProps) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [avatar, setAvatar] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [cryptoWallet, setCryptoWallet] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  
  // Personalization state
  const [purpose, setPurpose] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [personality, setPersonality] = useState('friendly');
  const [expertiseAreas, setExpertiseAreas] = useState('');
  const [conversationStyle, setConversationStyle] = useState('balanced');
  const [responseLength, setResponseLength] = useState('medium');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

  // Load sim data
  useEffect(() => {
    if (open && simId) {
      loadSimData();
    }
  }, [open, simId]);

  const loadSimData = async () => {
    try {
      const { data: sim, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('id', simId)
        .single();

      if (error) throw error;

      if (sim) {
        setName(sim.name || '');
        setTitle(sim.title || '');
        setAvatar(sim.avatar_url || '');
        setCustomUrl(sim.custom_url || '');
        setTwitterUrl(sim.twitter_url || '');
        setWebsiteUrl(sim.website_url || '');
        setCryptoWallet(sim.crypto_wallet || '');
        setBackgroundImage(sim.background_image_url || '');
        setPurpose(sim.description || '');
        setTargetAudience(sim.target_audience || '');
        setExpertiseAreas(sim.expertise_areas || '');
        setPersonality(sim.personality_type || 'friendly');
        setConversationStyle(sim.conversation_style || 'balanced');
        setResponseLength(sim.response_length || 'medium');
      }
    } catch (error) {
      console.error('Error loading sim:', error);
      toast.error('Failed to load sim data');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Please select an image smaller than 5MB');
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
      toast.success('Avatar uploaded');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      e.target.value = '';
      return;
    }

    setBackgroundFile(file);
    const previewUrl = URL.createObjectURL(file);
    setBackgroundImage(previewUrl);
  };

  const uploadBackgroundImage = async (): Promise<string | null> => {
    if (!backgroundFile) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const fileExt = backgroundFile.name.split('.').pop();
      const fileName = `${user.id}-background-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/backgrounds/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('advisor_assets')
        .upload(filePath, backgroundFile, {
          upsert: false,
          contentType: backgroundFile.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('advisor_assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading background:', error);
      toast.error('Failed to upload background image');
      return null;
    }
  };

  const generatePrompt = () => {
    let prompt = `You are ${name}`;
    if (title) prompt += `, ${title}`;
    prompt += '.\n\n';
    
    if (purpose) {
      prompt += `Purpose: ${purpose}\n\n`;
    }
    
    if (targetAudience) {
      prompt += `Target Audience: ${targetAudience}\n\n`;
    }
    
    if (expertiseAreas) {
      prompt += `Areas of Expertise: ${expertiseAreas}\n\n`;
    }
    
    const personalityMap: Record<string, string> = {
      professional: 'You maintain a professional and formal tone. You are precise, clear, and businesslike in your responses.',
      friendly: 'You are warm, approachable, and conversational. You use a friendly tone while remaining helpful and informative.',
      casual: 'You are relaxed and informal. You use everyday language and maintain a laid-back, easy-going tone.',
      enthusiastic: 'You are energetic and passionate. You show genuine excitement and positivity in your responses.',
      empathetic: 'You are understanding and compassionate. You listen carefully and respond with emotional intelligence.'
    };
    
    if (personality && personalityMap[personality]) {
      prompt += `Personality: ${personalityMap[personality]}\n\n`;
    }
    
    const styleMap: Record<string, string> = {
      concise: 'Keep your responses brief and to the point. Prioritize clarity and brevity.',
      balanced: 'Provide thorough yet concise responses. Balance detail with accessibility.',
      detailed: 'Give comprehensive, in-depth responses. Explain concepts thoroughly with examples when helpful.'
    };
    
    if (conversationStyle && styleMap[conversationStyle]) {
      prompt += `Communication Style: ${styleMap[conversationStyle]}\n\n`;
    }
    
    const lengthMap: Record<string, string> = {
      short: 'Keep responses under 100 words unless more detail is specifically requested.',
      medium: 'Aim for responses between 100-300 words, adjusting based on the complexity of the question.',
      long: 'Provide detailed responses of 300+ words when appropriate, ensuring comprehensive coverage.'
    };
    
    if (responseLength && lengthMap[responseLength]) {
      prompt += `Response Length: ${lengthMap[responseLength]}\n\n`;
    }
    
    prompt += `\n---\n\nCore Sim Guidelines:\n`;
    prompt += `- Stay in character at all times and respond authentically to the personality defined above\n`;
    prompt += `- Be helpful, engaging, and provide value in every interaction\n`;
    prompt += `- Ask clarifying questions when needed to better understand the user's needs\n`;
    prompt += `- Adapt your responses based on the context and complexity of questions\n`;
    prompt += `- If you don't know something, acknowledge it honestly rather than making assumptions\n`;
    prompt += `- Keep conversations natural and avoid being overly robotic or scripted\n`;
    prompt += `- Focus on actionable insights and practical advice when appropriate\n`;
    prompt += `- Respect boundaries and maintain appropriate professional or personal distance as defined by your purpose\n`;
    
    return prompt;
  };

  const copyUrl = () => {
    const url = customUrl ? `${window.location.origin}/${customUrl}` : '';
    navigator.clipboard.writeText(url);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
    toast.success('URL copied to clipboard');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name for your sim');
      return;
    }
    
    if (!purpose.trim()) {
      toast.error('Please describe the purpose of your sim');
      return;
    }
    
    setIsSaving(true);
    try {
      let finalBackgroundUrl = backgroundImage;

      if (backgroundFile) {
        const uploadedUrl = await uploadBackgroundImage();
        if (uploadedUrl) {
          finalBackgroundUrl = uploadedUrl;
        }
      }

      const generatedPrompt = generatePrompt();
      
      const { error } = await supabase
        .from('advisors')
        .update({
          name,
          title,
          description: purpose,
          prompt: generatedPrompt,
          avatar_url: avatar,
          custom_url: customUrl,
          twitter_url: twitterUrl || null,
          website_url: websiteUrl || null,
          crypto_wallet: cryptoWallet || null,
          background_image_url: finalBackgroundUrl,
          target_audience: targetAudience || null,
          expertise_areas: expertiseAreas || null,
          personality_type: personality,
          conversation_style: conversationStyle,
          response_length: responseLength,
          updated_at: new Date().toISOString()
        })
        .eq('id', simId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['user-sim'] });
      await queryClient.invalidateQueries({ queryKey: ['sim-conversations'] });
      
      toast.success('Sim updated successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving sim:', error);
      toast.error('Failed to update sim');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Sim</DialogTitle>
          <DialogDescription>
            Personalize your sim's identity, behavior, and landing page
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-4" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="space-y-8 pb-6">
            {/* Avatar & Basic Info Section */}
            <div className="space-y-6 pb-6 border-b">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Identity</h3>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex flex-col items-center space-y-3">
                  <Avatar className="h-24 w-24 border-4 shadow-lg">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      {name.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
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
                    {isUploading ? 'Uploading...' : 'Change'}
                  </Button>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Alex, Dr. Smith, TechBot"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title or Expertise</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Marketing Expert, Life Coach"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-url" className="flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      Custom URL
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="custom-url"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                        placeholder="your-sim-name"
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyUrl}
                        disabled={!customUrl}
                      >
                        {urlCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Purpose & Goals Section */}
            <div className="space-y-4 pb-6 border-b">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Purpose & Goals</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="purpose">Main Purpose</Label>
                  <Textarea
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g., Help customers with technical support, provide marketing advice..."
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Small business owners, Students"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertiseAreas">Areas of Expertise</Label>
                  <Input
                    id="expertiseAreas"
                    value={expertiseAreas}
                    onChange={(e) => setExpertiseAreas(e.target.value)}
                    placeholder="e.g., Digital Marketing, SEO, Content Strategy"
                  />
                </div>
              </div>
            </div>

            {/* Personality Section */}
            <div className="space-y-4 pb-6 border-b">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Personality & Style</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Personality Type</Label>
                  <RadioGroup value={personality} onValueChange={setPersonality}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional" className="font-normal">Professional</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="friendly" id="friendly" />
                      <Label htmlFor="friendly" className="font-normal">Friendly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="casual" id="casual" />
                      <Label htmlFor="casual" className="font-normal">Casual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="enthusiastic" id="enthusiastic" />
                      <Label htmlFor="enthusiastic" className="font-normal">Enthusiastic</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="empathetic" id="empathetic" />
                      <Label htmlFor="empathetic" className="font-normal">Empathetic</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conversationStyle">Conversation Style</Label>
                  <Select value={conversationStyle} onValueChange={setConversationStyle}>
                    <SelectTrigger id="conversationStyle">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responseLength">Response Length</Label>
                  <Select value={responseLength} onValueChange={setResponseLength}>
                    <SelectTrigger id="responseLength">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Landing Page Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Landing Page</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Background Image</Label>
                  <div className="flex gap-2">
                    <Input
                      value={backgroundImage}
                      onChange={(e) => setBackgroundImage(e.target.value)}
                      placeholder="Enter image URL or upload"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => backgroundInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input
                      ref={backgroundInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBackgroundUpload}
                    />
                  </div>
                  {backgroundFile && (
                    <p className="text-xs text-muted-foreground">
                      New file ready: {backgroundFile.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Twitter/X Profile URL</Label>
                  <Input
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://twitter.com/yourprofile"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <Input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Crypto Wallet Address</Label>
                  <Input
                    value={cryptoWallet}
                    onChange={(e) => setCryptoWallet(e.target.value)}
                    placeholder="Your wallet address"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditSimModal;
