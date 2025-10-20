import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UserSimFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingSim?: any;
  onSuccess: () => void;
}

const UserSimForm = ({ open, onOpenChange, existingSim, onSuccess }: UserSimFormProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    prompt: '',
    custom_url: '',
    avatar_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (existingSim) {
      setFormData({
        name: existingSim.name || '',
        title: existingSim.title || '',
        description: existingSim.description || '',
        prompt: existingSim.prompt || '',
        custom_url: existingSim.custom_url || '',
        avatar_url: existingSim.avatar_url || ''
      });
      setPreviewUrl(existingSim.avatar_url || '');
    } else {
      setFormData({
        name: '',
        title: '',
        description: '',
        prompt: 'You are a helpful AI assistant. Be friendly, informative, and engaging in conversations.',
        custom_url: '',
        avatar_url: ''
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
  }, [existingSim, open]);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const autoSave = useCallback(async (data: typeof formData) => {
    if (!existingSim || !data.name.trim()) return;

    setIsAutoSaving(true);
    try {
      const { error } = await supabase
        .from('advisors')
        .update({
          name: data.name,
          title: data.title,
          description: data.description,
          prompt: data.prompt || 'You are a helpful AI assistant. Be friendly, informative, and engaging in conversations.',
          avatar_url: data.avatar_url
        })
        .eq('id', existingSim.id);

      if (error) throw error;
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [existingSim]);

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...formData, [field]: value };
    
    // Auto-generate custom_url from name if creating new sim
    if (field === 'name' && !existingSim) {
      const urlSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      updatedData.custom_url = urlSlug;
    }
    
    setFormData(updatedData);

    // Trigger auto-save with debounce (only for existing sims)
    if (existingSim) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        autoSave(updatedData);
      }, 1000); // 1 second debounce
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

  const generateDescription = async () => {
    if (!formData.prompt.trim()) {
      toast({
        title: "Cannot generate description",
        description: "Please add a system prompt first",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-sim-description', {
        body: { prompt: formData.prompt }
      });

      if (error) throw error;

      if (data?.description) {
        setFormData(prev => ({ ...prev, description: data.description }));
        toast({
          title: "Description generated",
          description: "AI has created a display description for your sim"
        });
      }
    } catch (error) {
      console.error('Failed to generate description:', error);
      toast({
        title: "Generation failed",
        description: "Could not generate description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingDescription(false);
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
      // Always auto-generate description for new sims
      // For existing sims, regenerate if description is empty OR too long (likely the full prompt)
      let finalDescription = formData.description;
      const shouldGenerateDescription = 
        !existingSim || // Always for new sims
        !finalDescription.trim() || // Empty description
        finalDescription.length > 250; // Too long, probably the full prompt
      
      if (shouldGenerateDescription && formData.prompt.trim()) {
        const { data } = await supabase.functions.invoke('generate-sim-description', {
          body: { prompt: formData.prompt }
        });
        if (data?.description) {
          finalDescription = data.description;
        }
      }

      const avatarUrl = await uploadImage();
      
      const submitData = {
        name: formData.name,
        title: formData.title,
        description: finalDescription,
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
      
      onSuccess();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {existingSim ? 'Edit Your Sim' : 'Create Your Sim'}
            {isAutoSaving && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-normal">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {existingSim 
              ? 'Changes are automatically saved as you type.' 
              : 'Create a personalized AI sim that others can chat with via a shareable link.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Sim Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Tech Advisor Alex"
              required
            />
          </div>

          <div>
            <Label htmlFor="title">Title / Role</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Technology Consultant"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="description">Short Description (Display)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateDescription}
                disabled={isGeneratingDescription || !formData.prompt.trim()}
              >
                {isGeneratingDescription ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Auto-Generate'
                )}
              </Button>
            </div>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief 1-2 sentence description for display..."
              rows={2}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {existingSim 
                ? 'For display purposes - will auto-generate if left empty.'
                : 'For display purposes - will be auto-generated from your prompt.'} {formData.description.length}/200 characters.
            </p>
          </div>

          <div>
            <Label htmlFor="custom_url">Custom URL *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{window.location.origin}/sim/</span>
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
              placeholder="Describe how your sim should behave and respond..."
              rows={4}
            />
          </div>

          <div>
            <Label>Avatar Image</Label>
            <div className="space-y-3">
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting || isUploading ? 'Saving...' : existingSim ? 'Update Sim' : 'Create Sim'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserSimForm;
