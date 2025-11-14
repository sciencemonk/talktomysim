import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Save, Upload, X, Bot } from "lucide-react";
import { toast } from "sonner";

type StorePreviewTabProps = {
  store: any;
  onUpdate: () => void;
};

export const StorePreviewTab = ({ store, onUpdate }: StorePreviewTabProps) => {
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // Agent form data
  const [agentFormData, setAgentFormData] = useState({
    interaction_style: '',
    response_tone: '',
    primary_focus: '',
    greeting_message: '',
    avatar_url: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (store) {
      setAgentFormData({
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

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }

    try {
      setUploadingAvatar(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${store.user_id}/avatar-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('store-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('store-avatars')
        .getPublicUrl(filePath);

      setAgentFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveAgent = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('stores')
        .update({
          interaction_style: agentFormData.interaction_style,
          response_tone: agentFormData.response_tone,
          primary_focus: agentFormData.primary_focus,
          greeting_message: agentFormData.greeting_message,
          avatar_url: agentFormData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', store.id);

      if (error) throw error;
      toast.success('Agent settings updated successfully');
      onUpdate();
    } catch (error) {
      console.error('Error updating agent settings:', error);
      toast.error('Failed to update agent settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Agent Settings</h2>
        <p className="text-muted-foreground">
          Configure your AI agent's behavior and personality
        </p>
      </div>

      {/* Agent Configuration */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Agent Behavior</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure how your AI agent interacts with customers
              </p>
            </div>
            {store?.x_username && (
              <Button
                variant="outline"
                onClick={() => window.open(`/store/${store.x_username}`, '_blank')}
                className="gap-2 w-full md:w-auto"
              >
                View Live Store <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Agent Settings Form */}
      <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle>Agent Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="greeting_message">Greeting Message</Label>
              <Textarea
                id="greeting_message"
                value={agentFormData.greeting_message}
                onChange={(e) => setAgentFormData(prev => ({ ...prev, greeting_message: e.target.value }))}
                placeholder="How should the agent greet customers?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interaction_style">Interaction Style</Label>
              <Input
                id="interaction_style"
                value={agentFormData.interaction_style}
                onChange={(e) => setAgentFormData(prev => ({ ...prev, interaction_style: e.target.value }))}
                placeholder="e.g., Friendly and helpful"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="response_tone">Response Tone</Label>
              <Input
                id="response_tone"
                value={agentFormData.response_tone}
                onChange={(e) => setAgentFormData(prev => ({ ...prev, response_tone: e.target.value }))}
                placeholder="e.g., Professional, casual"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_focus">Primary Focus</Label>
              <Input
                id="primary_focus"
                value={agentFormData.primary_focus}
                onChange={(e) => setAgentFormData(prev => ({ ...prev, primary_focus: e.target.value }))}
                placeholder="What should the agent focus on?"
              />
            </div>

            <div className="space-y-2">
              <Label>Agent Avatar</Label>
              <div className="flex items-center gap-4">
                {agentFormData.avatar_url && (
                  <img
                    src={agentFormData.avatar_url}
                    alt="Agent avatar"
                    className="w-16 h-16 object-cover rounded-full border border-border"
                  />
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                  </Button>
                  {agentFormData.avatar_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setAgentFormData(prev => ({ ...prev, avatar_url: '' }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>

            <Button
              onClick={handleSaveAgent}
              disabled={saving}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Agent Settings'}
            </Button>
          </CardContent>
        </Card>
    </div>
  );
};
