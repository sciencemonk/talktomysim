
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Linkedin, 
  Mail, 
  Twitter,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'connected' | 'available' | 'coming-soon';
  features: string[];
  category: string;
}

const integrations: Integration[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Import your professional experience and network to enhance your Sim\'s knowledge about your career and expertise.',
    icon: Linkedin,
    status: 'available',
    features: [
      'Import professional experience',
      'Sync job history and skills',
      'Network insights',
      'Content recommendations'
    ],
    category: 'Professional'
  },
  {
    id: 'gmail',
    name: 'Google/Gmail',
    description: 'Connect your Gmail to help your Sim understand your communication style and important contacts.',
    icon: Mail,
    status: 'available',
    features: [
      'Email communication patterns',
      'Contact information',
      'Writing style analysis',
      'Calendar integration'
    ],
    category: 'Communication'
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    description: 'Sync your X profile to incorporate your public thoughts, interests, and social interactions.',
    icon: Twitter,
    status: 'coming-soon',
    features: [
      'Tweet history analysis',
      'Interest mapping',
      'Social interaction patterns',
      'Content preferences'
    ],
    category: 'Social'
  }
];

const Integrations = () => {
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set());
  
  const handleConnect = (integrationId: string) => {
    // This would typically handle the OAuth flow
    console.log(`Connecting to ${integrationId}`);
    setConnectedIntegrations(prev => new Set([...prev, integrationId]));
  };

  const handleDisconnect = (integrationId: string) => {
    console.log(`Disconnecting from ${integrationId}`);
    setConnectedIntegrations(prev => {
      const newSet = new Set(prev);
      newSet.delete(integrationId);
      return newSet;
    });
  };

  const getStatusBadge = (status: Integration['status'], integrationId: string) => {
    const isConnected = connectedIntegrations.has(integrationId);
    
    if (isConnected) {
      return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="w-3 h-3 mr-1" />
        Connected
      </Badge>;
    }
    
    switch (status) {
      case 'available':
        return <Badge variant="outline" className="text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800">
          Available
        </Badge>;
      case 'coming-soon':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
          <Clock className="w-3 h-3 mr-1" />
          Coming Soon
        </Badge>;
      case 'connected':
        return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="w-3 h-3 mr-1" />
          Connected
        </Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fg mb-2">Integrations</h1>
          <p className="text-fgMuted text-lg">
            Connect your Sim with external services to enhance its knowledge and capabilities.
          </p>
        </div>

        {/* Coming Soon Banner */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-fg">Beta Feature</h3>
                <p className="text-sm text-fgMuted">
                  Integrations are currently in development. Connect with us to get early access.
                </p>
              </div>
            </div>
            <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20">
              Request Access
            </Button>
          </CardContent>
        </Card>

        {/* Integration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            const isConnected = connectedIntegrations.has(integration.id);
            const isAvailable = integration.status === 'available';
            
            return (
              <Card 
                key={integration.id} 
                className={cn(
                  "transition-all duration-200 hover:shadow-md",
                  isConnected && "ring-2 ring-green-200 dark:ring-green-800"
                )}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-bgMuted p-2 rounded-lg">
                        <Icon className="h-6 w-6 text-fg" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {integration.category}
                        </Badge>
                      </div>
                    </div>
                    {getStatusBadge(integration.status, integration.id)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm">
                    {integration.description}
                  </CardDescription>
                  
                  {/* Features List */}
                  <div>
                    <h4 className="font-medium text-sm text-fg mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {integration.features.map((feature, index) => (
                        <li key={index} className="text-xs text-fgMuted flex items-center">
                          <div className="w-1 h-1 bg-fgMuted rounded-full mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Connection Controls */}
                  <div className="pt-2 border-t border-border">
                    {isAvailable ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-fgMuted">
                          {isConnected ? 'Connected' : 'Connect'}
                        </span>
                        <Switch
                          checked={isConnected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleConnect(integration.id);
                            } else {
                              handleDisconnect(integration.id);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled 
                        className="w-full opacity-60"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-fgMuted">
                <li>• All data is encrypted in transit and at rest</li>
                <li>• You control what information is shared</li>
                <li>• Disconnect integrations at any time</li>
                <li>• Regular security audits and compliance checks</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ExternalLink className="h-5 w-5 mr-2 text-blue-600" />
                Need More Integrations?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-fgMuted mb-4">
                Don't see the service you need? We're constantly adding new integrations based on user feedback.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Request Integration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
