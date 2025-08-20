
import { useState } from 'react';
import { advisorRemovalService } from '@/services/advisorRemovalService';
import { AgentType } from '@/types/agent';
import { toast } from '@/components/ui/use-toast';

export const useAdvisorRemoval = (
  selectedPublicAdvisors: AgentType[],
  setSelectedPublicAdvisors: (advisors: AgentType[]) => void,
  selectedPublicAdvisorId: string | null,
  onSelectPublicAdvisor: (advisorId: string | null) => void
) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const removeAdvisor = async (advisorId: string) => {
    if (isRemoving) return;
    
    setIsRemoving(true);
    
    try {
      console.log('Starting advisor removal process for:', advisorId);
      
      const success = await advisorRemovalService.removeAdvisor(advisorId);
      
      if (success) {
        // Remove from the local state
        const updatedAdvisors = selectedPublicAdvisors.filter(advisor => advisor.id !== advisorId);
        setSelectedPublicAdvisors(updatedAdvisors);
        
        // If the removed advisor was selected, clear the selection
        if (selectedPublicAdvisorId === advisorId) {
          onSelectPublicAdvisor(null);
        }
        
        toast({
          title: "Advisor removed",
          description: "The advisor and all chat history have been removed successfully.",
        });
        
        console.log('Advisor removal completed successfully');
      } else {
        toast({
          title: "Error",
          description: "Failed to remove advisor. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in removeAdvisor:', error);
      toast({
        title: "Error",
        description: "An error occurred while removing the advisor.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    removeAdvisor,
    isRemoving
  };
};
