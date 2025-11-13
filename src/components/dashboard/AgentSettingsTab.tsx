import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save } from "lucide-react";

type AgentSettingsTabProps = {
  store: any;
  onUpdate: () => void;
};

export const AgentSettingsTab = ({ store, onUpdate }: AgentSettingsTabProps) => {
  const [formData, setFormData] = useState({
    interaction_style: '',
    response_tone: '',
    primary_focus: '',
    greeting_message: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (store) {
      setFormData({
        interaction_style: store.interaction_style || '',
        response_tone: store.response_tone || '',
        primary_focus: store.primary_focus || '',
        greeting_message: store.greeting_message || ''
      });
    }
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const { error } = await supabase
        .from('stores')
        .update({
          interaction_style: formData.interaction_style,
          response_tone: formData.response_tone,
          primary_focus: formData.primary_focus,
          greeting_message: formData.greeting_message,
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
    <Card>
      <CardHeader>
        <CardTitle>AI Agent Configuration</CardTitle>
        <CardDescription>
          Configure how your AI agent interacts with customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="interaction_style">Interaction Style</Label>
            <Textarea
              id="interaction_style"
              value={formData.interaction_style}
              onChange={(e) => setFormData({ ...formData, interaction_style: e.target.value })}
              placeholder="e.g., Friendly and helpful, Professional and informative..."
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Define how your agent should interact with customers
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="response_tone">Response Tone</Label>
            <Textarea
              id="response_tone"
              value={formData.response_tone}
              onChange={(e) => setFormData({ ...formData, response_tone: e.target.value })}
              placeholder="e.g., Professional, Casual, Enthusiastic..."
              rows={2}
            />
            <p className="text-sm text-muted-foreground">
              The overall tone of voice for your agent
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_focus">Primary Focus</Label>
            <Textarea
              id="primary_focus"
              value={formData.primary_focus}
              onChange={(e) => setFormData({ ...formData, primary_focus: e.target.value })}
              placeholder="e.g., Customer satisfaction, Driving sales, Providing information..."
              rows={2}
            />
            <p className="text-sm text-muted-foreground">
              What should your agent prioritize in conversations?
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="greeting_message">Greeting Message</Label>
            <Textarea
              id="greeting_message"
              value={formData.greeting_message}
              onChange={(e) => setFormData({ ...formData, greeting_message: e.target.value })}
              placeholder="e.g., Hello! How can I help you today?"
              rows={2}
            />
            <p className="text-sm text-muted-foreground">
              The first message customers see when they start a conversation
            </p>
          </div>

          <Button type="submit" disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Agent Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
