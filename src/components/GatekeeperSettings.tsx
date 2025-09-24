import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Shield, Settings, AlertTriangle, Users } from 'lucide-react';
import { escalationService, EscalationRule } from '@/services/escalationService';
import { toast } from 'sonner';

interface GatekeeperSettingsProps {
  advisorId: string;
  onSettingsChange?: (hasChanges: boolean) => void;
}

export const GatekeeperSettings = ({ advisorId, onSettingsChange }: GatekeeperSettingsProps) => {
  const [rules, setRules] = useState<EscalationRule | null>(null);
  const [originalRules, setOriginalRules] = useState<EscalationRule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    loadEscalationRules();
  }, [advisorId]);

  // Check for changes whenever rules change
  useEffect(() => {
    if (rules && originalRules && onSettingsChange) {
      const hasChanges = JSON.stringify(rules) !== JSON.stringify(originalRules);
      onSettingsChange(hasChanges);
    }
  }, [rules, originalRules, onSettingsChange]);

  const loadEscalationRules = async () => {
    setIsLoading(true);
    const fetchedRules = await escalationService.getEscalationRules(advisorId);
    
    if (fetchedRules) {
      setRules(fetchedRules);
      setOriginalRules(JSON.parse(JSON.stringify(fetchedRules))); // Deep copy
    } else {
      // Create default rules
      const defaultRules = {
        score_threshold: 7,
        message_count_threshold: 5,
        urgency_keywords: ['urgent', 'asap', 'emergency', 'critical'],
        value_keywords: ['budget', 'purchase', 'contract', 'deal', 'buy'],
        vip_keywords: ['CEO', 'founder', 'director', 'VP', 'president'],
        custom_keywords: [],
        contact_capture_enabled: true,
        contact_capture_message: 'This sounds important! I\'d love to connect you with my creator. Could you share your email or phone so they can reach out directly?',
        is_active: true
      };
      setRules(defaultRules as EscalationRule);
      setOriginalRules(JSON.parse(JSON.stringify(defaultRules)) as EscalationRule); // Deep copy
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!rules) return;

    setIsSaving(true);
    const savedRules = await escalationService.createOrUpdateEscalationRules(advisorId, rules);
    
    if (savedRules) {
      setRules(savedRules);
      setOriginalRules(JSON.parse(JSON.stringify(savedRules))); // Deep copy
      toast.success('Gatekeeper settings saved successfully!');
      if (onSettingsChange) {
        onSettingsChange(false); // No more unsaved changes
      }
    } else {
      toast.error('Failed to save gatekeeper settings');
    }
    setIsSaving(false);
  };

  const updateRules = (updates: Partial<EscalationRule>) => {
    if (rules) {
      setRules({ ...rules, ...updates });
    }
  };

  const addKeyword = (type: 'urgency_keywords' | 'value_keywords' | 'vip_keywords' | 'custom_keywords') => {
    if (!newKeyword.trim() || !rules) return;

    const currentKeywords = rules[type] || [];
    const updatedKeywords = [...currentKeywords, newKeyword.trim()];
    updateRules({ [type]: updatedKeywords });
    setNewKeyword('');
  };

  const removeKeyword = (type: 'urgency_keywords' | 'value_keywords' | 'vip_keywords' | 'custom_keywords', keyword: string) => {
    if (!rules) return;

    const currentKeywords = rules[type] || [];
    const updatedKeywords = currentKeywords.filter(k => k !== keyword);
    updateRules({ [type]: updatedKeywords });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rules) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Smart Gatekeeper Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure how your Sim identifies and escalates important conversations
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Gatekeeper */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Smart Gatekeeper</Label>
              <p className="text-sm text-muted-foreground">
                Automatically identify and escalate high-value conversations
              </p>
            </div>
            <Switch
              checked={rules.is_active}
              onCheckedChange={(checked) => updateRules({ is_active: checked })}
            />
          </div>

          <Separator />

          {/* Scoring Thresholds */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <Label className="text-base font-medium">Escalation Threshold</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="score-threshold">Score Threshold (1-10)</Label>
              <Input
                id="score-threshold"
                type="number"
                min="1"
                max="10"
                value={rules.score_threshold}
                onChange={(e) => updateRules({ score_threshold: parseInt(e.target.value) || 7 })}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                Conversations scoring above this will trigger escalation
              </p>
            </div>
          </div>

          <Separator />

          {/* Keywords Configuration */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <Label className="text-base font-medium">Trigger Keywords</Label>
            </div>

            {/* Urgency Keywords */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-orange-600">Urgency Keywords (+3 points)</Label>
              <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border border-border rounded-md bg-background">
                {(rules.urgency_keywords || []).map((keyword) => (
                  <Badge key={keyword} className="bg-orange-800 text-orange-100 hover:bg-orange-700 border-orange-700">
                    {keyword}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-orange-200"
                      onClick={() => removeKeyword('urgency_keywords', keyword)}
                    />
                  </Badge>
                ))}
                {(!rules.urgency_keywords || rules.urgency_keywords.length === 0) && (
                  <span className="text-sm text-muted-foreground italic">No urgency keywords added yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add urgency keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword('urgency_keywords');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addKeyword('urgency_keywords')}
                  disabled={!newKeyword.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Value Keywords */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-green-600">Value Keywords (+4 points)</Label>
              <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border border-border rounded-md bg-background">
                {(rules.value_keywords || []).map((keyword) => (
                  <Badge key={keyword} className="bg-green-800 text-green-100 hover:bg-green-700 border-green-700">
                    {keyword}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-green-200"
                      onClick={() => removeKeyword('value_keywords', keyword)}
                    />
                  </Badge>
                ))}
                {(!rules.value_keywords || rules.value_keywords.length === 0) && (
                  <span className="text-sm text-muted-foreground italic">No value keywords added yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add value keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword('value_keywords');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addKeyword('value_keywords')}
                  disabled={!newKeyword.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* VIP Keywords */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-purple-600">VIP Keywords (+5 points)</Label>
              <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border border-border rounded-md bg-background">
                {(rules.vip_keywords || []).map((keyword) => (
                  <Badge key={keyword} className="bg-purple-800 text-purple-100 hover:bg-purple-700 border-purple-700">
                    {keyword}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-purple-200"
                      onClick={() => removeKeyword('vip_keywords', keyword)}
                    />
                  </Badge>
                ))}
                {(!rules.vip_keywords || rules.vip_keywords.length === 0) && (
                  <span className="text-sm text-muted-foreground italic">No VIP keywords added yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add VIP keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword('vip_keywords');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addKeyword('vip_keywords')}
                  disabled={!newKeyword.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Custom Keywords */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-blue-600">Custom Keywords (+2 points)</Label>
              <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border border-border rounded-md bg-background">
                {(rules.custom_keywords || []).map((keyword) => (
                  <Badge key={keyword} className="bg-blue-800 text-blue-100 hover:bg-blue-700 border-blue-700">
                    {keyword}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-blue-200"
                      onClick={() => removeKeyword('custom_keywords', keyword)}
                    />
                  </Badge>
                ))}
                {(!rules.custom_keywords || rules.custom_keywords.length === 0) && (
                  <span className="text-sm text-muted-foreground italic">No custom keywords added yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword('custom_keywords');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addKeyword('custom_keywords')}
                  disabled={!newKeyword.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Capture Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <Label className="text-base font-medium">Contact Capture</Label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Enable Contact Capture</Label>
                <p className="text-sm text-muted-foreground">
                  Ask for contact information when conversations are escalated
                </p>
              </div>
              <Switch
                checked={rules.contact_capture_enabled}
                onCheckedChange={(checked) => updateRules({ contact_capture_enabled: checked })}
              />
            </div>

            {rules.contact_capture_enabled && (
              <div className="space-y-2">
                <Label htmlFor="capture-message">Contact Capture Message</Label>
                <Textarea
                  id="capture-message"
                  value={rules.contact_capture_message}
                  onChange={(e) => updateRules({ contact_capture_message: e.target.value })}
                  placeholder="Message to display when asking for contact information..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  This message will be shown to users when your Sim requests their contact information
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
