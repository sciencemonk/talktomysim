
import React from 'react';

const Integrations = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Simple Coming Soon Message */}
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <p className="text-lg text-fgMuted mb-2">Coming Soon</p>
            <p className="text-sm text-fgMuted">
              Connect your Sim with external services and apps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
