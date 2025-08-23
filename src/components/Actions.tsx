import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { GatekeeperSettings } from '@/components/GatekeeperSettings';
import { useSim } from '@/hooks/useSim';
import { cn } from '@/lib/utils';

const Actions = () => {
  const { sim, isLoading } = useSim();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // For Actions page, we'll track changes via the GatekeeperSettings component
  // This is a placeholder implementation - the actual change tracking would need to be
  // implemented within GatekeeperSettings and communicated up via props
  const handleSave = async () => {
    // This would trigger save in the GatekeeperSettings component
    // For now, we'll just mark as saved
    setHasUnsavedChanges(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sim) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">No Sim Found</h2>
              <p className="text-muted-foreground">Please complete your Sim setup first.</p>
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Actions
            </CardTitle>
            <Button 
              onClick={handleSave} 
              variant={hasUnsavedChanges ? "default" : "outline"}
              className={cn(
                "relative",
                hasUnsavedChanges && "pr-6"
              )}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
              {hasUnsavedChanges && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Configure smart escalation rules and monitor conversations for your Sim. Set up automatic detection of high-value conversations and important interactions.
          </p>

          {/* Smart Gatekeeper Settings */}
          <GatekeeperSettings 
            advisorId={sim.id} 
            onSettingsChange={(hasChanges) => setHasUnsavedChanges(hasChanges)}
          />
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Smart Actions</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Set appropriate thresholds to catch important conversations without too many false positives</li>
            <li>• Use specific keywords that relate to your business or expertise area</li>
            <li>• Regularly review captured conversations to refine your escalation rules</li>
            <li>• Enable contact capture to ensure you can follow up on high-value interactions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Actions;
