
import { useState } from 'react';
import { removeAdvisor } from '@/services/advisorService';
import { AgentType } from '@/types/agent';

export const useAdvisorRemoval = (
  selectedPublicAdvisors: AgentType[],
  onRemovePublicAdvisor?: (advisorId: string) => void
) => {
  const [removingAdvisorId, setRemovingAdvisorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemoveAdvisor = async (advisorId: string) => {
    try {
      setRemovingAdvisorId(advisorId);
      setError(null);
      
      await removeAdvisor(advisorId);
      
      // Update the UI immediately
      onRemovePublicAdvisor?.(advisorId);
      
    } catch (err) {
      console.error('Failed to remove advisor:', err);
      setError('Failed to remove advisor. Please try again.');
    } finally {
      setRemovingAdvisorId(null);
    }
  };

  return {
    handleRemoveAdvisor,
    removingAdvisorId,
    error
  };
};
