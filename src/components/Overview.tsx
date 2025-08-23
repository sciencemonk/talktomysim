
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { ConversationsDashboard } from '@/components/ConversationsDashboard';
import { useSim } from '@/hooks/useSim';

const Overview = () => {
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Top Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Monitor your Sim's conversations and performance analytics. Get insights into user interactions and engagement patterns.
          </p>
        </CardContent>
      </Card>

      {/* Conversations Section */}
      <ConversationsDashboard advisorId={sim?.id || 'demo'} />

      {/* Analytics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
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
  );
};

export default Overview;
