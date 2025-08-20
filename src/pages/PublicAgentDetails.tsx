
import React from 'react';
import { useParams } from 'react-router-dom';
import AdvisorSearchModal from '@/components/AdvisorSearchModal';

const PublicAgentDetails = () => {
  const { agentId } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Advisor Directory</h1>
        <AdvisorSearchModal />
      </div>
    </div>
  );
};

export default PublicAgentDetails;
