import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Upload, X, Bot } from "lucide-react";

type AgentEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store: any;
  onUpdate: () => void;
};

export const AgentEditModal = ({ open, onOpenChange, store, onUpdate }: AgentEditModalProps) => {
  const [formData, setFormData] = useState({
    store_name: '',
    store_description: '',
    interaction_style: '',
    response_tone: '',
    primary_focus: '',
    greeting_message: '',
    avatar_url: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (store) {
      setFormData({
        store_name: store.store_name || '',
        store_description: store.store_description || '',
        interaction_style: store.interaction_style || '',
        response_tone: store.response_tone || '',
        primary_focus: store.primary_focus || '',
        greeting_message: store.greeting_message || '',
        avatar_url: store.avatar_url || ''
      });
    }
  }, [store]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }

    try {
      setUploading(true);
      
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${store.user_id}/avatar-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('store-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('store-avatars')
        .getPublicUrl(filePath);

      // Update form data
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({ ...prev, avatar_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const { error } = await supabase
        .from('stores')
        .update({
          store_name: formData.store_name,
          store_description: formData.store_description,
          interaction_style: formData.interaction_style,
          response_tone: formData.response_tone,
          primary_focus: formData.primary_focus,
          greeting_message: formData.greeting_message,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', store.id);

      if (error) throw error;
      toast.success('Agent settings updated successfully');
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating agent settings:', error);
      toast.error('Failed to update agent settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit AI Agent</DialogTitle>
          <DialogDescription>
            Customize your AI agent's appearance and behavior
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label>Agent Avatar</Label>
            <div className="flex items-center gap-4">
              {formData.avatar_url ? (
                <div className="relative">
                  <img
                    src={formData.avatar_url}
                    alt="Agent Avatar"
                    className="h-20 w-20 rounded-full object-cover border-2 border-border"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                  <Bot className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Avatar'}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: Square image, max 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Agent Name */}
          <div className="space-y-2">
            <Label htmlFor="store_name">Agent Name</Label>
            <Input
              id="store_name"
              value={formData.store_name}
              onChange={(e) => setFormData(prev => ({ ...prev, store_name: e.target.value }))}
              placeholder="My Store AI"
            />
          </div>

          {/* Agent Description */}
          <div className="space-y-2">
            <Label htmlFor="store_description">Agent Description</Label>
            <Textarea
              id="store_description"
              value={formData.store_description}
              onChange={(e) => setFormData(prev => ({ ...prev, store_description: e.target.value }))}
              placeholder="Describe what your AI agent does..."
              rows={3}
            />
          </div>

          {/* Interaction Style */}
          <div className="space-y-2">
            <Label htmlFor="interaction_style">Interaction Style</Label>
            <Input
              id="interaction_style"
              value={formData.interaction_style}
              onChange={(e) => setFormData(prev => ({ ...prev, interaction_style: e.target.value }))}
              placeholder="e.g., Friendly and approachable"
            />
          </div>

          {/* Response Tone */}
          <div className="space-y-2">
            <Label htmlFor="response_tone">Response Tone</Label>
            <Input
              id="response_tone"
              value={formData.response_tone}
              onChange={(e) => setFormData(prev => ({ ...prev, response_tone: e.target.value }))}
              placeholder="e.g., Professional yet casual"
            />
          </div>

          {/* Primary Focus */}
          <div className="space-y-2">
            <Label htmlFor="primary_focus">Primary Focus</Label>
            <Input
              id="primary_focus"
              value={formData.primary_focus}
              onChange={(e) => setFormData(prev => ({ ...prev, primary_focus: e.target.value }))}
              placeholder="e.g., Customer satisfaction and sales"
            />
          </div>

          {/* Greeting Message */}
          <div className="space-y-2">
            <Label htmlFor="greeting_message">Greeting Message</Label>
            <Textarea
              id="greeting_message"
              value={formData.greeting_message}
              onChange={(e) => setFormData(prev => ({ ...prev, greeting_message: e.target.value }))}
              placeholder="Hello! How can I help you today?"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
