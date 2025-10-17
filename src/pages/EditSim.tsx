import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Link2, Copy, Check, User, Globe, Wallet, X, MessageCircle, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { AgentType } from '@/types/agent';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const EditSim = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const isMobile = useIsMobile();
  
  // Form state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [avatar, setAvatar] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [cryptoWallet, setCryptoWallet] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      if (!session) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (!session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: userSim, refetch: refetchUserSim } = useQuery({
    queryKey: ['user-sim', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        type: 'General Tutor' as const,
        status: 'active' as const,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        avatar: data.avatar_url,
        prompt: data.prompt,
        title: data.title,
        sim_type: data.sim_type as 'historical' | 'living',
        custom_url: data.custom_url,
        is_featured: false,
        model: 'GPT-4',
        interactions: 0,
        studentsSaved: 0,
        helpfulnessScore: 0,
        avmScore: 0,
        csat: 0,
        performance: 0,
        channels: [],
        channelConfigs: {},
        isPersonal: false,
        voiceTraits: [],
        twitter_url: data.twitter_url,
        website_url: data.website_url,
        crypto_wallet: data.crypto_wallet,
        background_image_url: data.background_image_url
      } as AgentType;
    },
    enabled: !!currentUser
  });

  // Update form state when userSim loads
  useEffect(() => {
    if (userSim) {
      setName(userSim.name);
      setTitle(userSim.title || '');
      setDescription(userSim.description || '');
      setPrompt(userSim.prompt || '');
      setAvatar(userSim.avatar || '');
      setCustomUrl(userSim.custom_url || '');
      setTwitterUrl(userSim.twitter_url || '');
      setWebsiteUrl(userSim.website_url || '');
      setCryptoWallet(userSim.crypto_wallet || '');
      setBackgroundImage(userSim.background_image_url || '');
    }
  }, [userSim]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploadingBackground(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setBackgroundImage(dataUrl);
      };
      reader.readAsDataURL(file);
      toast.success('Background uploaded');
    } catch (error) {
      console.error('Error uploading background:', error);
      toast.error('Failed to upload background');
    } finally {
      setIsUploadingBackground(false);
    }
  };

  const copyUrl = () => {
    const url = customUrl ? `${window.location.origin}/${customUrl}` : '';
    navigator.clipboard.writeText(url);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
    toast.success('URL copied to clipboard');
  };

  const handleSave = async () => {
    if (!userSim) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
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
          background_image_url: backgroundImage,
          updated_at: new Date().toISOString()
        })
        .eq('id', userSim.id);

      if (error) throw error;

      await refetchUserSim();
      toast.success('Sim updated successfully!');
    } catch (error) {
      console.error('Error saving sim:', error);
      toast.error('Failed to update sim');
    } finally {
      setIsSaving(false);
    }
  };

  if (!userSim) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-6">
          <p>Loading your sim...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header with Menu */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
          <div className="flex items-center justify-between p-3">
            <SidebarTrigger className="h-10 w-10">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="text-lg font-semibold">Sim Settings</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className={`h-full p-8 ${isMobile ? 'pt-[73px]' : ''}`}>
        <div className="max-w-4xl mx-auto">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <Card className="p-8">
              <div className="space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4 pb-6 border-b">
                  <Avatar className="h-32 w-32 border-4 shadow-2xl">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      {name.charAt(0) || 'S'}
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

                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">Basic Information</h3>
                  </div>
                  
                  <div className="space-y-2 pl-7">
                    <Label htmlFor="custom-url" className="text-sm font-medium">Your Sim URL</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-lg bg-muted">
                        <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-mono truncate text-muted-foreground">
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
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-2 pl-7">
                    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your sim's name"
                    />
                  </div>

                  <div className="space-y-2 pl-7">
                    <Label htmlFor="title" className="text-sm font-medium">Title / Tagline</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Historical Figure, Expert in..., Teacher of..."
                    />
                  </div>

                  <div className="space-y-2 pl-7">
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="A brief description of your sim..."
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </div>

                {/* Social & Contact */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">Social & Contact</h3>
                  </div>
                  
                  <div className="space-y-2 pl-7">
                    <Label htmlFor="twitter" className="text-sm font-medium">X (Twitter) Profile</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">x.com/</span>
                      <Input
                        id="twitter"
                        value={twitterUrl}
                        onChange={(e) => setTwitterUrl(e.target.value)}
                        placeholder="username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pl-7">
                    <Label htmlFor="website" className="text-sm font-medium">Personal Website</Label>
                    <Input
                      id="website"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="space-y-2 pl-7">
                    <Label htmlFor="crypto" className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Crypto Wallet Address (Optional)
                      </div>
                    </Label>
                    <Input
                      id="crypto"
                      value={cryptoWallet}
                      onChange={(e) => setCryptoWallet(e.target.value)}
                      placeholder="Your wallet address"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Share your wallet address for crypto donations
                    </p>
                  </div>

                  <div className="space-y-2 pl-7">
                    <Label className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Background Image
                      </div>
                    </Label>
                    <input
                      ref={backgroundFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundUpload}
                      className="hidden"
                    />
                    <div className="flex gap-2 items-center">
                      <Button 
                        variant="outline" 
                        onClick={() => backgroundFileInputRef.current?.click()}
                        disabled={isUploadingBackground}
                        size="sm"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploadingBackground ? 'Uploading...' : backgroundImage ? 'Change Background' : 'Upload Background'}
                      </Button>
                      {backgroundImage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBackgroundImage('')}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Customize your sim landing page background (max 5MB)
                    </p>
                    {backgroundImage && (
                      <div className="relative h-24 rounded-lg overflow-hidden border">
                        <img 
                          src={backgroundImage} 
                          alt="Background preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Personality & Instructions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">AI Personality & Instructions</h3>
                  </div>
                  
                  <div className="space-y-2 pl-7">
                    <Label htmlFor="prompt" className="text-sm font-medium">System Prompt</Label>
                    <Textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Define how your sim should behave, its personality, communication style, and knowledge areas..."
                      className="min-h-[200px] resize-none font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      This instructs the AI on how to respond as your sim
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-6 text-lg"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default EditSim;
