import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthModal from '@/components/AuthModal';

const SimCreate = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const simId = searchParams.get('id');
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    prompt: 'You are a helpful AI assistant. Be friendly, informative, and engaging in conversations.',
    custom_url: '',
    avatar_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [existingSim, setExistingSim] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (simId && user) {
      fetchExistingSim();
    }
  }, [simId, user]);

  const fetchExistingSim = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('id', simId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      setExistingSim(data);
      setFormData({
        name: data.name || '',
        title: data.title || '',
        description: data.description || '',
        prompt: data.prompt || 'You are a helpful AI assistant. Be friendly, informative, and engaging in conversations.',
        custom_url: data.custom_url || '',
        avatar_url: data.avatar_url || ''
      });
      setPreviewUrl(data.avatar_url || '');
    } catch (error) {
      console.error('Error fetching sim:', error);
      toast({
        title: "Error",
        description: "Failed to load sim details",
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate custom_url from name if creating new sim
    if (field === 'name' && !existingSim) {
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
    if (!existingSim) {
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
        prompt: formData.prompt || 'You are a helpful AI assistant. Be friendly, informative, and engaging in conversations.',
        custom_url: formData.custom_url,
        avatar_url: avatarUrl || '',
        sim_type: 'living',
        is_public: true,
        is_active: true,
        user_id: user?.id
      };

      if (existingSim) {
        const { error } = await supabase
          .from('advisors')
          .update(submitData)
          .eq('id', existingSim.id);

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
      
      navigate('/dashboard');
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">
              {existingSim ? 'Edit Sim' : 'Create New Sim'}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8">
            <div className="mb-6">
              <p className="text-muted-foreground">
                {existingSim 
                  ? 'Update your sim details below.' 
                  : 'Create a personalized AI sim that others can chat with via a shareable link.'}
              </p>
            </div>
            
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your sim..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="custom_url">Custom URL *</Label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{window.location.origin}/sim/</span>
                  <Input
                    id="custom_url"
                    value={formData.custom_url}
                    onChange={(e) => handleInputChange('custom_url', e.target.value)}
                    placeholder="my-sim-name"
                    pattern="[a-z0-9-]+"
                    disabled={!!existingSim}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Only lowercase letters, numbers, and hyphens. {existingSim && 'Cannot be changed after creation.'}
                </p>
              </div>

              <div>
                <Label htmlFor="prompt">Personality & Instructions (Optional)</Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt}
                  onChange={(e) => handleInputChange('prompt', e.target.value)}
                  placeholder="You are a helpful AI assistant. Be friendly, informative, and engaging in conversations."
                  rows={4}
                  className="mt-2"
                />
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
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div>
                    <Input
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
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isUploading}
                  className="flex-1"
                >
                  {isSubmitting || isUploading ? 'Saving...' : existingSim ? 'Update Sim' : 'Create Sim'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SimCreate;
