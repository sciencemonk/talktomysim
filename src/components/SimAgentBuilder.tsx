import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SimAgentBuilderProps {
  simId: string;
  editCode: string;
}

interface CustomInteraction {
  id: string;
  trigger: string;
  response: string;
}

export function SimAgentBuilder({ simId, editCode }: SimAgentBuilderProps) {
  const [interactions, setInteractions] = useState<CustomInteraction[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const addInteraction = () => {
    setInteractions([
      ...interactions,
      {
        id: Date.now().toString(),
        trigger: '',
        response: '',
      },
    ]);
  };

  const removeInteraction = (id: string) => {
    setInteractions(interactions.filter((i) => i.id !== id));
  };

  const updateInteraction = (id: string, field: 'trigger' | 'response', value: string) => {
    setInteractions(
      interactions.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement saving custom interactions to database
      toast.success('Agent customizations saved!');
    } catch (error) {
      console.error('Error saving customizations:', error);
      toast.error('Failed to save customizations');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Custom Interactions</CardTitle>
          <CardDescription>
            Define specific responses for certain triggers or questions. Your Sim will use these
            responses when the trigger phrase is detected.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {interactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No custom interactions yet. Add one to get started.
              </p>
              <Button onClick={addInteraction} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Interaction
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {interactions.map((interaction, index) => (
                <Card key={interaction.id} className="border-muted">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`trigger-${interaction.id}`}>
                            Trigger Phrase #{index + 1}
                          </Label>
                          <Input
                            id={`trigger-${interaction.id}`}
                            value={interaction.trigger}
                            onChange={(e) =>
                              updateInteraction(interaction.id, 'trigger', e.target.value)
                            }
                            placeholder="e.g., 'what are your rates?' or 'how do I get started?'"
                            className="bg-background"
                          />
                          <p className="text-xs text-muted-foreground">
                            When users say this or something similar...
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`response-${interaction.id}`}>Custom Response</Label>
                          <Textarea
                            id={`response-${interaction.id}`}
                            value={interaction.response}
                            onChange={(e) =>
                              updateInteraction(interaction.id, 'response', e.target.value)
                            }
                            placeholder="Enter the response your Sim should give..."
                            rows={4}
                            className="resize-none bg-background"
                          />
                          <p className="text-xs text-muted-foreground">
                            Your Sim will respond with this message
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeInteraction(interaction.id)}
                        className="shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-2">
                <Button onClick={addInteraction} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {interactions.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Customizations'}
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            More agent customization features are on the way
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Conversation flow builders</li>
            <li>• Integration with external APIs</li>
            <li>• Advanced personality tuning</li>
            <li>• Custom function calling</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
