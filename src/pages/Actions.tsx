
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, MessageSquare, Settings, BarChart3 } from 'lucide-react';
import { GatekeeperSettings } from '@/components/GatekeeperSettings';
import { ConversationsDashboard } from '@/components/ConversationsDashboard';
import { useAgentDetails } from '@/hooks/useAgentDetails';
import AgentConfigSidebar from '@/components/AgentConfigSidebar';

const Actions = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { agent, isLoading } = useAgentDetails(agentId!);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AgentConfigSidebar />
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex min-h-screen bg-background">
        <AgentConfigSidebar />
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-foreground">Agent not found</h2>
                <p className="text-muted-foreground">The requested agent could not be found.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AgentConfigSidebar />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Actions & Intelligence</h1>
            <p className="text-muted-foreground">
              Configure smart escalation rules and monitor conversations for {agent.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Smart Gatekeeper Active</span>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="gatekeeper" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gatekeeper" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Smart Gatekeeper
            </TabsTrigger>
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gatekeeper" className="space-y-6">
            <GatekeeperSettings advisorId={agent.id} />
          </TabsContent>

          <TabsContent value="conversations" className="space-y-6">
            <ConversationsDashboard advisorId={agent.id} />
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
      </div>
    </div>
  );
};

export default Actions;
