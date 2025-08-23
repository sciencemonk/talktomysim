
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BarChart3, ExternalLink, Globe } from 'lucide-react';
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
      {/* Compact Header Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={sim?.avatar_url} alt={sim?.name || "Sim Avatar"} />
                <AvatarFallback>
                  {sim?.name?.charAt(0)?.toUpperCase() || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">
                  {sim?.name || "Unnamed Sim"}
                </h3>
                {sim?.professional_title && (
                  <p className="text-sm text-muted-foreground truncate">{sim.professional_title}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default" className="text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" asChild size="sm" className="w-full sm:w-auto flex-shrink-0">
              <a href={`/${sim?.custom_url || sim?.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Talk to Your Sim
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

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
