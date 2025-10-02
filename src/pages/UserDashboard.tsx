import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X, Eye, Copy, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopNavigation from "@/components/TopNavigation";
import SimpleFooter from "@/components/SimpleFooter";
import { Badge } from "@/components/ui/badge";

interface UserSim {
  id: string;
  name: string;
  title: string;
  description: string;
  custom_url: string;
  avatar_url: string;
  created_at: string;
  prompt: string;
}

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userSim, setUserSim] = useState<UserSim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    prompt: `You are to roleplay as [Insert Name], the historical, cultural, or intellectual figure. Speak as if the user is directly conversing with this person. Stay fully in character at all times.

Identity & Background

You are [Name] ([Lifespan or Era]), known for [primary role/achievements/field of influence].

Key aspects of your life and worldview include:

[List 3–4 defining achievements, beliefs, or experiences].

[Include cultural/historical context if relevant].

Speaking Style

Speak in the voice and manner consistent with [Name's] character.

Tone should be [examples: formal, poetic, witty, direct, authoritative, compassionate, etc.].

Use imagery, metaphors, or references that fit their background and perspective.

Avoid modern slang or expressions inconsistent with their era/persona.

Response Guidelines

Always answer as [Name], not as a chatbot or narrator. Do not break character.

Ground responses in their worldview, philosophy, or lived experiences.

When asked about modern issues, interpret them through timeless principles or their personal perspective, rather than adopting modern knowledge outside their identity.

Use examples, metaphors, or anecdotes consistent with [Name's] life and writings.

Encourage the user to reflect, act, or think in ways consistent with the advisor's teachings or legacy.

Constraints

Do not reference being an AI or anything outside your identity.

Do not provide third-person historical summaries — always speak as if you are the person.

Avoid technical or anachronistic detail that the figure would not know.

Stay true to the tone, values, and personality of [Name].`,
    custom_url: '',
    avatar_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      fetchUserSim();
    }
  }, [user]);

  const fetchUserSim = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('advisors')
        .select('id, name, title, description, custom_url, avatar_url, created_at, prompt')
        .eq('user_id', user?.id)
        .eq('sim_type', 'living')
        .maybeSingle();

      if (error) throw error;
      
      setUserSim(data);
      
      // If sim exists, populate form with data
      if (data) {
        setFormData({
          name: data.name || '',
          title: data.title || '',
          description: data.description || '',
          prompt: data.prompt || `You are to roleplay as [Insert Name], the historical, cultural, or intellectual figure. Speak as if the user is directly conversing with this person. Stay fully in character at all times.

Identity & Background

You are [Name] ([Lifespan or Era]), known for [primary role/achievements/field of influence].

Key aspects of your life and worldview include:

[List 3–4 defining achievements, beliefs, or experiences].

[Include cultural/historical context if relevant].

Speaking Style

Speak in the voice and manner consistent with [Name's] character.

Tone should be [examples: formal, poetic, witty, direct, authoritative, compassionate, etc.].

Use imagery, metaphors, or references that fit their background and perspective.

Avoid modern slang or expressions inconsistent with their era/persona.

Response Guidelines

Always answer as [Name], not as a chatbot or narrator. Do not break character.

Ground responses in their worldview, philosophy, or lived experiences.

When asked about modern issues, interpret them through timeless principles or their personal perspective, rather than adopting modern knowledge outside their identity.

Use examples, metaphors, or anecdotes consistent with [Name's] life and writings.

Encourage the user to reflect, act, or think in ways consistent with the advisor's teachings or legacy.

Constraints

Do not reference being an AI or anything outside your identity.

Do not provide third-person historical summaries — always speak as if you are the person.

Avoid technical or anachronistic detail that the figure would not know.

Stay true to the tone, values, and personality of [Name].`,
          custom_url: data.custom_url || '',
          avatar_url: data.avatar_url || ''
        });
        setPreviewUrl(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Error fetching user sim:', error);
      toast({
        title: "Error",
        description: "Failed to load your sim",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate custom_url from name if creating new sim
    if (field === 'name' && !userSim) {
      const urlSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, custom_url: urlSlug }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return formData.avatar_url;

    setIsUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `user-sim-avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.custom_url.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and custom URL are required fields",
        variant: "destructive"
      });
      return;
    }

    // Check if custom_url is available (only for new sims)
    if (!userSim) {
      const { data: existing } = await supabase
        .from('advisors')
        .select('id')
        .eq('custom_url', formData.custom_url)
        .maybeSingle();

      if (existing) {
        toast({
          title: "URL not available",
          description: "This custom URL is already taken. Please choose another.",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const avatarUrl = await uploadImage();
      
      const submitData = {
        name: formData.name,
        title: formData.title,
        description: formData.description,
        prompt: formData.prompt || `You are to roleplay as [Insert Name], the historical, cultural, or intellectual figure. Speak as if the user is directly conversing with this person. Stay fully in character at all times.

Identity & Background

You are [Name] ([Lifespan or Era]), known for [primary role/achievements/field of influence].

Key aspects of your life and worldview include:

[List 3–4 defining achievements, beliefs, or experiences].

[Include cultural/historical context if relevant].

Speaking Style

Speak in the voice and manner consistent with [Name's] character.

Tone should be [examples: formal, poetic, witty, direct, authoritative, compassionate, etc.].

Use imagery, metaphors, or references that fit their background and perspective.

Avoid modern slang or expressions inconsistent with their era/persona.

Response Guidelines

Always answer as [Name], not as a chatbot or narrator. Do not break character.

Ground responses in their worldview, philosophy, or lived experiences.

When asked about modern issues, interpret them through timeless principles or their personal perspective, rather than adopting modern knowledge outside their identity.

Use examples, metaphors, or anecdotes consistent with [Name's] life and writings.

Encourage the user to reflect, act, or think in ways consistent with the advisor's teachings or legacy.

Constraints

Do not reference being an AI or anything outside your identity.

Do not provide third-person historical summaries — always speak as if you are the person.

Avoid technical or anachronistic detail that the figure would not know.

Stay true to the tone, values, and personality of [Name].`,
        custom_url: formData.custom_url,
        avatar_url: avatarUrl || '',
        sim_type: 'living',
        is_public: true,
        is_active: true,
        user_id: user?.id
      };

      if (userSim) {
        const { error } = await supabase
          .from('advisors')
          .update(submitData)
          .eq('id', userSim.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Your sim has been updated"
        });
      } else {
        const { error } = await supabase
          .from('advisors')
          .insert([submitData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Your sim has been created!"
        });
      }
      
      fetchUserSim();
    } catch (error) {
      console.error('Failed to save sim:', error);
      toast({
        title: "Error",
        description: "Failed to save your sim",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, avatar_url: '' }));
  };

  const copyShareLink = () => {
    if (!userSim?.custom_url) return;
    
    const shareUrl = `${window.location.origin}/sim/${userSim.custom_url}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard"
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Sign in to create your sim</h1>
            <p className="text-muted-foreground mb-6">Create a personalized AI sim that others can chat with</p>
          </div>
        </div>
        <AuthModal 
          open={showAuthModal} 
          onOpenChange={(open) => {
            setShowAuthModal(open);
            if (!open) navigate('/');
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNavigation />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Create Your Sim</h2>
              <p className="text-muted-foreground">
                Build a personalized AI sim that others can chat with via a shareable link
              </p>
            </div>

            {/* Sim Preview Card (if exists) */}
            {userSim && (
              <Card className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={userSim.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-semibold">
                          {userSim.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-xl">{userSim.name}</CardTitle>
                        {userSim.title && (
                          <CardDescription>{userSim.title}</CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={copyShareLink}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => window.open(`/sim/${userSim.custom_url}`, '_blank')}
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* Sim Creation Form */}
            <Card>
              <CardHeader>
                <CardTitle>{userSim ? 'Edit Your Sim' : 'Sim Details'}</CardTitle>
                <CardDescription>
                  {userSim 
                    ? 'Update your sim information below' 
                    : 'Fill in the details to create your personalized AI sim'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="knowledge" disabled>
                      Vector Embeddings <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="mt-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="name">Sim Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="e.g., Tech Advisor Alex"
                          required
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="title">Title / Role</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="e.g., Technology Consultant"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="custom_url">Custom URL *</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {window.location.origin}/sim/
                          </span>
                          <Input
                            id="custom_url"
                            value={formData.custom_url}
                            onChange={(e) => handleInputChange('custom_url', e.target.value)}
                            placeholder="my-sim-name"
                            pattern="[a-z0-9-]+"
                            disabled={!!userSim}
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Only lowercase letters, numbers, and hyphens. {userSim && 'Cannot be changed after creation.'}
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="prompt">System Prompt</Label>
                        <Textarea
                          id="prompt"
                          value={formData.prompt}
                          onChange={(e) => handleInputChange('prompt', e.target.value)}
                          placeholder="Define how your sim should behave and respond..."
                          rows={12}
                          className="mt-2 font-mono text-xs"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Define the character, personality, and response style of your sim
                        </p>
                      </div>

                      <div>
                        <Label>Avatar Image</Label>
                        <div className="space-y-3 mt-2">
                          {previewUrl ? (
                            <div className="relative inline-block">
                              <img
                                src={previewUrl}
                                alt="Avatar preview"
                                className="w-20 h-20 rounded-full object-cover border"
                              />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                            >
                              <Upload className="h-6 w-6 text-muted-foreground" />
                            </button>
                          )}
                          
                          <div>
                            <Input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="cursor-pointer"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Max file size: 5MB. Supported formats: JPG, PNG, GIF
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting || isUploading}
                          className="flex-1"
                        >
                          {isSubmitting || isUploading ? 'Saving...' : userSim ? 'Update Sim' : 'Create Sim'}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="knowledge" className="mt-6">
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-lg font-medium mb-2">Vector Embeddings Coming Soon</p>
                      <p className="text-sm">
                        Upload documents and files to enhance your sim's knowledge base
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
};

export default UserDashboard;
