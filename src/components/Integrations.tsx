
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Linkedin, 
  Mail, 
  Twitter,
  ExternalLink,
  Clock
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}

const integrations: Integration[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Import your professional experience and network to enhance your Sim\'s knowledge about your career and expertise.',
    icon: Linkedin,
    features: [
      'Import professional experience',
      'Sync job history and skills',
      'Network insights',
      'Content recommendations'
    ]
  },
  {
    id: 'gmail',
    name: 'Google/Gmail',
    description: 'Connect your Gmail to help your Sim understand your communication style and important contacts.',
    icon: Mail,
    features: [
      'Email communication patterns',
      'Contact information',
      'Writing style analysis',
      'Calendar integration'
    ]
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    description: 'Sync your X profile to incorporate your public thoughts, interests, and social interactions.',
    icon: Twitter,
    features: [
      'Tweet history analysis',
      'Interest mapping',
      'Social interaction patterns',
      'Content preferences'
    ]
  }
];

const Integrations = () => {
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

        {/* Integration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            
            return (
              <Card 
                key={integration.id} 
                className="transition-all duration-200 hover:shadow-md"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-bgMuted p-2 rounded-lg">
                        <Icon className="h-6 w-6 text-fg" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                      </div>
                    </div>
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled 
                      className="w-full opacity-60"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info Section */}
        <div className="mt-12 grid grid-cols-1 gap-6">
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
