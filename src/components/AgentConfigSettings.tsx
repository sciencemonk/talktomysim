
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bot, 
  MessageSquare, 
  Shield,
  Save,
  Loader2
} from 'lucide-react';
import { useAgentDetails } from '@/hooks/useAgentDetails';
import { agentService } from '@/services/agentService';
import { GatekeeperSettings } from './GatekeeperSettings';
import { toast } from 'sonner';

interface AgentConfigSettingsProps {
  agentId: string;
}

export const AgentConfigSettings = ({ agentId }: AgentConfigSettingsProps) => {
  const { agent, isLoading, refetch } = useAgentDetails(agentId);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompt: '',
    welcomeMessage: '',
    isPublic: false,
    customUrl: '',
    subject: '',
    gradeLevel: '',
    learningObjective: ''
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || '',
        description: agent.description || '',
        prompt: agent.prompt || '',
        welcomeMessage: agent.welcomeMessage || '',
        isPublic: agent.isPublic || false,
        customUrl: agent.customUrl || '',
        subject: agent.subject || '',
        gradeLevel: agent.gradeLevel || '',
        learningObjective: agent.learningObjective || ''
      });
    }
  }, [agent]);

  const handleSave = async () => {
    if (!agent) return;

    setIsSaving(true);
    try {
      await agentService.updateAgent(agent.id, formData);
      toast.success('Agent settings saved successfully!');
      refetch();
    } catch (error) {
      console.error('Error saving agent:', error);
      toast.error('Failed to save agent settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  if (isLoading || !agent) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Agent Configuration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your agent's behavior, appearance, and intelligence features
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="behavior" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Behavior
              </TabsTrigger>
              <TabsTrigger value="gatekeeper" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Gatekeeper
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    placeholder="Enter agent name..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => updateFormData({ subject: e.target.value })}
                    placeholder="e.g., Mathematics, History, Science..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Describe what your agent does..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Grade Level</Label>
                  <Select 
                    value={formData.gradeLevel} 
                    onValueChange={(value) => updateFormData({ gradeLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade level..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="K-2">K-2</SelectItem>
                      <SelectItem value="3-5">3-5</SelectItem>
                      <SelectItem value="6-8">6-8</SelectItem>
                      <SelectItem value="9-12">9-12</SelectItem>
                      <SelectItem value="College">College</SelectItem>
                      <SelectItem value="Adult">Adult</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customUrl">Custom URL</Label>
                  <Input
                    id="customUrl"
                    value={formData.customUrl}
                    onChange={(e) => updateFormData({ customUrl: e.target.value })}
                    placeholder="my-agent"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your agent will be available at: /chat/{formData.customUrl || 'your-url'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="learningObjective">Learning Objective</Label>
                <Input
                  id="learningObjective"
                  value={formData.learningObjective}
                  onChange={(e) => updateFormData({ learningObjective: e.target.value })}
                  placeholder="What should students learn from this agent?"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Make Public</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow other users to discover and chat with your agent
                  </p>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => updateFormData({ isPublic: checked })}
                />
              </div>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">System Prompt</Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt}
                  onChange={(e) => updateFormData({ prompt: e.target.value })}
                  placeholder="Define how your agent should behave and respond..."
                  rows={8}
                />
                <p className="text-xs text-muted-foreground">
                  This prompt defines your agent's personality, knowledge, and behavior patterns.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  value={formData.welcomeMessage}
                  onChange={(e) => updateFormData({ welcomeMessage: e.target.value })}
                  placeholder="Enter the first message users will see..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  This message will be displayed when users first start chatting with your agent.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="gatekeeper" className="mt-6">
              <GatekeeperSettings advisorId={agent.id} />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-6">
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Advanced settings coming soon</p>
                <p className="text-sm text-muted-foreground">
                  Features like API integrations, custom actions, and workflow automation
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
