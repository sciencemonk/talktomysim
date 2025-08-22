
import React from 'react';
import { Zap } from 'lucide-react';

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
            Connect your Sim with external services and platforms.
          </p>
        </div>

        {/* Simple Coming Soon Message */}
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <p className="text-lg text-fgMuted mb-2">Coming Soon</p>
            <p className="text-sm text-fgMuted">
              We're working on integrations with popular platforms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
