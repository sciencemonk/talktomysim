
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, ExternalLink, Settings, Plus } from 'lucide-react';

const Integrations = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-fg">Integrations</h1>
          </div>
          <p className="text-fgMuted">
            Connect your Sim with external services and platforms to enhance its capabilities.
          </p>
        </div>

        {/* Integration Categories */}
        <div className="space-y-8">
          {/* Communication */}
          <section>
            <h2 className="text-xl font-semibold text-fg mb-4">Communication</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Slack
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Connect your Sim to Slack channels for team communication.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Discord
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Integrate with Discord servers and channels.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          {/* Learning Management */}
          <section>
            <h2 className="text-xl font-semibold text-fg mb-4">Learning Management</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Google Classroom
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Sync with Google Classroom for assignments and student data.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Canvas
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Integrate with Canvas LMS for course management.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          {/* Productivity */}
          <section>
            <h2 className="text-xl font-semibold text-fg mb-4">Productivity</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Google Drive
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Access and share files from Google Drive.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Notion
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Sync with Notion databases and pages.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          {/* Analytics */}
          <section>
            <h2 className="text-xl font-semibold text-fg mb-4">Analytics</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Google Analytics
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Track user interactions and engagement metrics.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Mixpanel
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Advanced analytics for user behavior tracking.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>
        </div>

        {/* Help Section */}
        <div className="mt-12 p-6 bg-bgMuted rounded-lg">
          <h3 className="text-lg font-semibold text-fg mb-2">Need Help?</h3>
          <p className="text-fgMuted mb-4">
            Learn more about setting up integrations and connecting your Sim to external services.
          </p>
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Documentation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
