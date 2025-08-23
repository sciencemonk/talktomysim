
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, MessageSquare, BarChart3 } from 'lucide-react';
import { GatekeeperSettings } from '@/components/GatekeeperSettings';
import { ConversationsDashboard } from '@/components/ConversationsDashboard';
import { useSim } from '@/hooks/useSim';

const Actions = () => {
  const { sim, isLoading } = useSim();

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
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Configure smart escalation rules and monitor conversations for your Sim. Set up automatic detection of high-value conversations and important interactions.
          </p>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="gatekeeper" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Smart Gatekeeper
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Tabs defaultValue="conversations" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="conversations" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Conversations
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="conversations" className="space-y-6">
                  <ConversationsDashboard advisorId={sim.id} />
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  <div className="grid gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Coming Soon</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Advanced analytics and insights will be available here
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-12">
                          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Dashboard</h3>
                          <p className="text-muted-foreground">
                            Detailed conversation analytics, conversion rates, and performance metrics coming soon
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="gatekeeper" className="space-y-6">
              <GatekeeperSettings advisorId={sim.id} />
            </TabsContent>
          </Tabs>
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
