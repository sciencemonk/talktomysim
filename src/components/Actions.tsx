import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { GatekeeperSettings } from '@/components/GatekeeperSettings';
import { useSim } from '@/hooks/useSim';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';


const Actions = () => {
  const { sim, isLoading, makeSimPublic, toggleSimActive } = useSim();
  const [isPublic, setIsPublic] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Load sim data
  useEffect(() => {
    if (sim) {
      setIsPublic(sim.is_public || false);
      setIsActive(sim.is_active !== false); // Default to true if not specified
    }
  }, [sim]);

  const handlePublicToggle = async (checked: boolean) => {
    try {
      await makeSimPublic(checked);
      setIsPublic(checked);
    } catch (error) {
      console.error('Error toggling public status:', error);
      // Reset the toggle to its previous state
      setIsPublic(!checked);
    }
  };

  const handleActiveToggle = async (checked: boolean) => {
    try {
      await toggleSimActive(checked);
      setIsActive(checked);
    } catch (error) {
      console.error('Error toggling active status:', error);
      // Reset the toggle to its previous state
      setIsActive(!checked);
    }
  };
  
  // For Actions page, we'll track changes via the GatekeeperSettings component


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
          <CardTitle>
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Configure smart escalation rules and monitor conversations for your Sim. Set up automatic detection of high-value conversations and important interactions.
          </p>

          {/* Visibility Settings */}
          <Card className="border-blue-100">
            <CardHeader className="pb-2">
              <h3 className="text-lg font-medium">Visibility Settings</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Public Sim
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, your Sim will be visible on the public landing page
                  </p>
                </div>
                <Switch 
                  checked={isPublic}
                  onCheckedChange={handlePublicToggle}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                                  <Label className="text-base font-medium flex items-center gap-2">
                  Active Sim
                </Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, your Sim is available for conversations
                  </p>
                </div>
                <Switch 
                  checked={isActive}
                  onCheckedChange={handleActiveToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Smart Gatekeeper Settings */}
          {/* Public/Private Toggle */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Public Visibility</h3>
                  <p className="text-sm text-blue-700">
                    Make your Sim visible on the public landing page
                  </p>
                </div>
              </div>
              <Button
                variant={isPublic ? "outline" : "default"}
                onClick={() => handlePublicToggle(!isPublic)}
                className={isPublic ? "border-blue-200 text-blue-700" : ""}
              >
                {isPublic ? "Make Private" : "Make Public"}
              </Button>
            </div>
          </div>

          <GatekeeperSettings 
            advisorId={sim.id}
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
