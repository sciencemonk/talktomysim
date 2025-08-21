
import { useState } from 'react';
import { removeAdvisor } from '@/services/advisorService';
import { AgentType } from '@/types/agent';

export const useAdvisorRemoval = () => {
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const handleRemoveAdvisor = async (
    advisorId: string,
    selectedPublicAdvisors: AgentType[],
    selectedPublicAdvisorId: string | null,
    onRemovePublicAdvisor: ((advisorId: string) => void) | undefined,
    onSelectPublicAdvisor: ((advisorId: string, advisor?: AgentType) => void) | undefined,
    onShowAdvisorDirectory: (() => void) | undefined
  ) => {
    setIsRemoving(advisorId);
    
    try {
      await removeAdvisor(advisorId);
      
      // Remove from local state
      onRemovePublicAdvisor?.(advisorId);
      
      // If we're currently viewing the removed advisor, show new advisor view
      if (selectedPublicAdvisorId === advisorId) {
        onShowAdvisorDirectory?.();
      }
      
      console.log('Advisor removed successfully:', advisorId);
    } catch (error) {
      console.error('Failed to remove advisor:', error);
    } finally {
      setIsRemoving(null);
    }
  };

  return {
    isRemoving,
    handleRemoveAdvisor
  };
};
