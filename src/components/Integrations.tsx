
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Clock, Bell } from 'lucide-react';

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

        {/* Coming Soon Card */}
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md w-full text-center">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Clock className="h-16 w-16 text-primary" />
                  <div className="absolute -top-1 -right-1">
                    <Bell className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl text-fg">Coming Soon</CardTitle>
              <CardDescription className="text-base">
                We're working hard to bring you powerful integrations with your favorite tools and platforms.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                <div className="text-sm text-fgMuted">
                  Get notified when integrations are available
                </div>
                <Button className="w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  Notify Me
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview of upcoming integrations */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-fg mb-6 text-center">What's Coming</h3>
          <div className="grid gap-4 md:grid-cols-4 opacity-50">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-bgMuted rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-lg font-semibold text-fgMuted">S</span>
              </div>
              <p className="text-sm text-fgMuted">Slack</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-bgMuted rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-lg font-semibold text-fgMuted">G</span>
              </div>
              <p className="text-sm text-fgMuted">Google Drive</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-bgMuted rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-lg font-semibold text-fgMuted">N</span>
              </div>
              <p className="text-sm text-fgMuted">Notion</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-bgMuted rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-lg font-semibold text-fgMuted">+</span>
              </div>
              <p className="text-sm text-fgMuted">More</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
