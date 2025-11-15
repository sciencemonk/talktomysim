import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Save, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AgentConfigTabProps = {
  store: any;
  onUpdate: () => void;
};

export const AgentConfigTab = ({ store, onUpdate }: AgentConfigTabProps) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [agentFormData, setAgentFormData] = useState({
    store_name: '',
    avatar_url: '',
    greeting_message: '',
    interaction_style: 'balanced',
    response_tone: 'professional',
    primary_focus: 'customer_satisfaction',
    response_length: 50,
    personality: 50,
    expertise_level: 50,
  });
  
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (store) {
      setAgentFormData({
        store_name: store.store_name || '',
        avatar_url: store.avatar_url || '',
        greeting_message: store.greeting_message || '',
        interaction_style: store.interaction_style || 'balanced',
        response_tone: store.response_tone || 'professional',
        primary_focus: store.primary_focus || 'customer_satisfaction',
        response_length: 50,
        personality: 50,
        expertise_level: 50,
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

  const handleRemoveAvatar = () => {
    setAgentFormData(prev => ({ ...prev, avatar_url: '' }));
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleSaveAgent = async () => {
    if (!agentFormData.store_name.trim()) {
      toast.error('Agent name is required');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('stores')
        .update({
          store_name: agentFormData.store_name,
          avatar_url: agentFormData.avatar_url,
          interaction_style: agentFormData.interaction_style,
          response_tone: agentFormData.response_tone,
          primary_focus: agentFormData.primary_focus,
          greeting_message: agentFormData.greeting_message,
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

  const handleCopyEmbedCode = () => {
    if (!store?.x_username) {
      toast.error('Please configure your store URL first');
      return;
    }

    const storeUrl = `https://simproject.org/store/${store.x_username}`;
    const embedCode = `<script data-agent-url="${storeUrl}">
(function(){window.AgentEmbed={init:function(e){if(!e||!e.agentUrl)return console.error("AgentEmbed: agentUrl is required");const t=document.createElement("button");t.id="agent-embed-button",t.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',t.style.cssText="position:fixed;top:20px;right:20px;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:2px solid rgba(102,126,234,.3);cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;color:white;transition:transform .2s,box-shadow .2s;z-index:9998",t.addEventListener("mouseenter",function(){t.style.transform="scale(1.1)",t.style.boxShadow="0 6px 20px rgba(0,0,0,.2)"}),t.addEventListener("mouseleave",function(){t.style.transform="scale(1)",t.style.boxShadow="0 4px 12px rgba(0,0,0,.15)"});const n=document.createElement("div");n.id="agent-embed-sidebar",n.style.cssText="position:fixed;top:0;right:0;width:0;height:100vh;background:white;border-left:1px solid #e5e7eb;box-shadow:-4px 0 24px rgba(0,0,0,.1);overflow:hidden;transition:width .3s ease;z-index:9999;display:flex;flex-direction:column";const i=document.createElement("iframe");i.src=e.agentUrl,i.style.cssText="width:100%;height:100%;border:none",i.setAttribute("allow","microphone; camera"),n.appendChild(i);let o=!1;function s(){o=!0,t.style.display="none",window.innerWidth>1024?(n.style.width="384px",n.style.height="100vh",n.style.top="0",n.style.bottom="auto",n.style.left="auto",n.style.right="0",n.style.borderLeft="1px solid #e5e7eb",n.style.borderTop="none",n.style.transition="width .3s ease"):window.innerWidth>768?(n.style.width="320px",n.style.height="100vh",n.style.top="0",n.style.bottom="auto",n.style.left="auto",n.style.right="0",n.style.borderLeft="1px solid #e5e7eb",n.style.borderTop="none",n.style.transition="width .3s ease"):(n.style.width="100%",n.style.height="384px",n.style.top="auto",n.style.bottom="0",n.style.left="0",n.style.right="0",n.style.borderLeft="none",n.style.borderTop="1px solid #e5e7eb",n.style.transition="height .3s ease")}function d(){o=!1,t.style.display="flex",window.innerWidth<=768?n.style.height="0":n.style.width="0"}t.addEventListener("click",s),window.addEventListener("message",function(e){"closeAgentEmbed"===e.data&&d()}),window.addEventListener("resize",function(){o&&(window.innerWidth<=768?(n.style.width="100%",n.style.height="384px",n.style.top="auto",n.style.bottom="0",n.style.left="0",n.style.right="0",n.style.borderLeft="none",n.style.borderTop="1px solid #e5e7eb",n.style.transition="height .3s ease"):(n.style.width=window.innerWidth>1024?"384px":"320px",n.style.height="100vh",n.style.top="0",n.style.bottom="auto",n.style.left="auto",n.style.right="0",n.style.borderLeft="1px solid #e5e7eb",n.style.borderTop="none",n.style.transition="width .3s ease"))}),document.body.appendChild(t),document.body.appendChild(n),console.log("AgentEmbed: Initialized successfully")}},document.addEventListener("DOMContentLoaded",function(){const e=document.querySelector("script[data-agent-url]");if(e){const t=e.getAttribute("data-agent-url");window.AgentEmbed.init({agentUrl:t})}})})();
</script>`;
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Agent Configuration</h2>
          <p className="text-muted-foreground">
            Customize your AI agent's personality and behavior for e-commerce
          </p>
        </div>
        {store?.x_username && (
          <div className="text-right">
            <Button
              variant="outline"
              onClick={handleCopyEmbedCode}
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

      <Card>
        <CardHeader>
          <CardTitle>Agent Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="space-y-4">
            <Label>Agent Avatar</Label>
            <div className="flex items-center gap-4">
              {agentFormData.avatar_url ? (
                <div className="relative">
                  <img
                    src={agentFormData.avatar_url}
                    alt="Agent avatar"
                    className="h-24 w-24 rounded-full object-cover border-2 border-border"
                  />
                  <button
                    onClick={handleRemoveAvatar}
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, max 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Agent Name */}
          <div className="space-y-2">
            <Label htmlFor="store_name">Agent Name *</Label>
            <Input
              id="store_name"
              value={agentFormData.store_name}
              onChange={(e) => setAgentFormData(prev => ({ ...prev, store_name: e.target.value }))}
              placeholder="e.g., Shopping Assistant, Style Advisor"
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              The name customers will see when interacting with your AI agent
            </p>
          </div>

          {/* Greeting Message */}
          <div className="space-y-2">
            <Label htmlFor="greeting_message">Greeting Message</Label>
            <Textarea
              id="greeting_message"
              value={agentFormData.greeting_message}
              onChange={(e) => setAgentFormData(prev => ({ ...prev, greeting_message: e.target.value }))}
              placeholder="Hi! I'm here to help you find exactly what you're looking for."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              The first message customers see when they start a conversation
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personality & Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Interaction Style */}
          <div className="space-y-3">
            <Label htmlFor="interaction_style">Interaction Style</Label>
            <Select
              value={agentFormData.interaction_style}
              onValueChange={(value) => setAgentFormData(prev => ({ ...prev, interaction_style: value }))}
            >
              <SelectTrigger id="interaction_style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise - Brief and to the point</SelectItem>
                <SelectItem value="balanced">Balanced - Mix of detail and brevity</SelectItem>
                <SelectItem value="detailed">Detailed - Comprehensive responses</SelectItem>
                <SelectItem value="conversational">Conversational - Natural and flowing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Response Tone */}
          <div className="space-y-3">
            <Label htmlFor="response_tone">Response Tone</Label>
            <Select
              value={agentFormData.response_tone}
              onValueChange={(value) => setAgentFormData(prev => ({ ...prev, response_tone: value }))}
            >
              <SelectTrigger id="response_tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional - Business-like and polished</SelectItem>
                <SelectItem value="friendly">Friendly - Warm and approachable</SelectItem>
                <SelectItem value="casual">Casual - Relaxed and informal</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic - Energetic and excited</SelectItem>
                <SelectItem value="empathetic">Empathetic - Understanding and caring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Primary Focus */}
          <div className="space-y-3">
            <Label htmlFor="primary_focus">Primary Focus</Label>
            <Select
              value={agentFormData.primary_focus}
              onValueChange={(value) => setAgentFormData(prev => ({ ...prev, primary_focus: value }))}
            >
              <SelectTrigger id="primary_focus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer_satisfaction">Customer Satisfaction - Ensuring happy customers</SelectItem>
                <SelectItem value="sales_conversion">Sales Conversion - Driving purchases</SelectItem>
                <SelectItem value="product_education">Product Education - Teaching about products</SelectItem>
                <SelectItem value="problem_solving">Problem Solving - Resolving issues</SelectItem>
                <SelectItem value="relationship_building">Relationship Building - Creating connections</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Response Length Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="response_length">Response Length</Label>
              <span className="text-sm text-muted-foreground">
                {agentFormData.response_length < 33 ? 'Short' : 
                 agentFormData.response_length < 66 ? 'Medium' : 'Long'}
              </span>
            </div>
            <Slider
              id="response_length"
              value={[agentFormData.response_length]}
              onValueChange={(value) => setAgentFormData(prev => ({ ...prev, response_length: value[0] }))}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Concise</span>
              <span>Balanced</span>
              <span>Detailed</span>
            </div>
          </div>

          {/* Personality Warmth Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="personality">Personality Warmth</Label>
              <span className="text-sm text-muted-foreground">
                {agentFormData.personality < 33 ? 'Reserved' : 
                 agentFormData.personality < 66 ? 'Balanced' : 'Warm'}
              </span>
            </div>
            <Slider
              id="personality"
              value={[agentFormData.personality]}
              onValueChange={(value) => setAgentFormData(prev => ({ ...prev, personality: value[0] }))}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Formal</span>
              <span>Friendly</span>
              <span>Enthusiastic</span>
            </div>
          </div>

          {/* Expertise Level Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise_level">Product Expertise</Label>
              <span className="text-sm text-muted-foreground">
                {agentFormData.expertise_level < 33 ? 'Basic' : 
                 agentFormData.expertise_level < 66 ? 'Intermediate' : 'Expert'}
              </span>
            </div>
            <Slider
              id="expertise_level"
              value={[agentFormData.expertise_level]}
              onValueChange={(value) => setAgentFormData(prev => ({ ...prev, expertise_level: value[0] }))}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>General Knowledge</span>
              <span>Knowledgeable</span>
              <span>Deep Expertise</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSaveAgent}
          disabled={saving || !agentFormData.store_name.trim()}
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Agent Configuration'}
        </Button>
      </div>
    </div>
  );
};
