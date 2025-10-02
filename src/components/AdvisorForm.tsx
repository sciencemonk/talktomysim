import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createAdvisor, updateAdvisor } from '@/services/advisorService';
import { Advisor } from '@/pages/Admin';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X } from 'lucide-react';
import AdvisorDocumentManager from './AdvisorDocumentManager';

interface AdvisorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  advisor?: Advisor | null;
  onSuccess: () => void;
}

const AdvisorForm = ({ open, onOpenChange, advisor, onSuccess }: AdvisorFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    prompt: '',
    avatar_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState('basic');

  // Reset form when dialog opens/closes or advisor changes
  useEffect(() => {
    if (advisor) {
      setFormData({
        name: advisor.name || '',
        title: advisor.title || '',
        prompt: advisor.prompt || '',
        avatar_url: advisor.avatar_url || ''
      });
      setPreviewUrl(advisor.avatar_url || '');
      setActiveTab('basic');
    } else {
      setFormData({
        name: '',
        title: '',
        prompt: '',
        avatar_url: ''
      });
      setPreviewUrl('');
      setActiveTab('basic');
    }
    setSelectedFile(null);
  }, [advisor, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
      const filePath = `advisor-avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

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
    
    if (!formData.name.trim() || !formData.prompt.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and system prompt are required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const avatarUrl = await uploadImage();
      
      const submitData = {
        ...formData,
        avatar_url: avatarUrl || ''
      };

      if (advisor) {
        await updateAdvisor(advisor.id, submitData);
        toast({
          title: "Success",
          description: "Sim updated successfully"
        });
      } else {
        await createAdvisor(submitData);
        toast({
          title: "Success",
          description: "Sim created successfully"
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save advisor:', error);
      toast({
        title: "Error",
        description: "Failed to save sim",
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{advisor ? 'Edit Sim' : 'Create New Sim'}</DialogTitle>
          <DialogDescription>
            {advisor ? 'Update the sim information and manage source materials.' : 'Fill in the details to create a new sim and add source materials.'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="documents" disabled={!advisor}>
              Knowledge Base {!advisor && "(Save first)"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="mt-4 space-y-4 overflow-y-auto max-h-[60vh]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Advisor name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Professional title"
                />
              </div>

              <div>
                <Label htmlFor="prompt">System Prompt *</Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt}
                  onChange={(e) => handleInputChange('prompt', e.target.value)}
                  placeholder="The system prompt that defines how this sim behaves"
                  rows={4}
                  required
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {isSubmitting || isUploading ? 'Saving...' : advisor ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-4 overflow-y-auto max-h-[60vh]">
            {advisor ? (
              <AdvisorDocumentManager 
                advisorId={advisor.id} 
                advisorName={advisor.name}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Please save the sim first to manage source materials.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdvisorForm;
