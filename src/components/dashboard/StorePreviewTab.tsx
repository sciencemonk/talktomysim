import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Save, Upload, X, Bot, Copy } from "lucide-react";
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent Settings</h2>
          <p className="text-muted-foreground">
            Configure your AI agent's behavior and personality
          </p>
        </div>
        {store?.x_username && (
          <div className="text-right">
            <Button
              variant="outline"
              onClick={() => {
                const storeUrl = `https://simproject.org/store/${store.x_username}`;
                const embedCode = `<script data-agent-url="${storeUrl}">
(function(){window.AgentEmbed={init:function(e){if(!e||!e.agentUrl)return console.error("AgentEmbed: agentUrl is required");const t=document.createElement("button");t.id="agent-embed-button",t.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',t.style.cssText="position:fixed;top:20px;right:20px;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:2px solid rgba(102,126,234,.3);cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;color:white;transition:transform .2s,box-shadow .2s;z-index:9998",t.addEventListener("mouseenter",function(){t.style.transform="scale(1.1)",t.style.boxShadow="0 6px 20px rgba(0,0,0,.2)"}),t.addEventListener("mouseleave",function(){t.style.transform="scale(1)",t.style.boxShadow="0 4px 12px rgba(0,0,0,.15)"});const n=document.createElement("div");n.id="agent-embed-sidebar",n.style.cssText="position:fixed;top:0;right:0;width:0;height:100vh;background:white;border-left:1px solid #e5e7eb;box-shadow:-4px 0 24px rgba(0,0,0,.1);overflow:hidden;transition:width .3s ease;z-index:9999;display:flex;flex-direction:column";const i=document.createElement("iframe");i.src=e.agentUrl,i.style.cssText="width:100%;height:100%;border:none",i.setAttribute("allow","microphone; camera"),n.appendChild(i);let o=!1;function s(){o=!0,t.style.display="none",window.innerWidth>1024?(n.style.width="384px",n.style.height="100vh",n.style.top="0",n.style.bottom="auto",n.style.left="auto",n.style.right="0",n.style.borderLeft="1px solid #e5e7eb",n.style.borderTop="none",n.style.transition="width .3s ease"):window.innerWidth>768?(n.style.width="320px",n.style.height="100vh",n.style.top="0",n.style.bottom="auto",n.style.left="auto",n.style.right="0",n.style.borderLeft="1px solid #e5e7eb",n.style.borderTop="none",n.style.transition="width .3s ease"):(n.style.width="100%",n.style.height="384px",n.style.top="auto",n.style.bottom="0",n.style.left="0",n.style.right="0",n.style.borderLeft="none",n.style.borderTop="1px solid #e5e7eb",n.style.transition="height .3s ease")}function d(){o=!1,t.style.display="flex",window.innerWidth<=768?n.style.height="0":n.style.width="0"}t.addEventListener("click",s),window.addEventListener("message",function(e){"closeAgentEmbed"===e.data&&d()}),window.addEventListener("resize",function(){o&&(window.innerWidth<=768?(n.style.width="100%",n.style.height="384px",n.style.top="auto",n.style.bottom="0",n.style.left="0",n.style.right="0",n.style.borderLeft="none",n.style.borderTop="1px solid #e5e7eb",n.style.transition="height .3s ease"):(n.style.width=window.innerWidth>1024?"384px":"320px",n.style.height="100vh",n.style.top="0",n.style.bottom="auto",n.style.left="auto",n.style.right="0",n.style.borderLeft="1px solid #e5e7eb",n.style.borderTop="none",n.style.transition="width .3s ease"))}),document.body.appendChild(t),document.body.appendChild(n),console.log("AgentEmbed: Initialized successfully")}},document.addEventListener("DOMContentLoaded",function(){const e=document.querySelector("script[data-agent-url]");if(e){const t=e.getAttribute("data-agent-url");window.AgentEmbed.init({agentUrl:t})}})})();
</script>`;
                navigator.clipboard.writeText(embedCode);
                toast.success('Embed code copied to clipboard');
              }}
              className="gap-2 flex-shrink-0"
            >
              <Copy className="h-4 w-4" />
              Embed on Your Site
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Paste before the closing &lt;/body&gt; tag
            </p>
          </div>
        )}
      </div>

      {/* Agent Configuration */}
      {/* Agent Settings Form */}
      <Card>
          <CardContent className="space-y-4 pt-6">
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
