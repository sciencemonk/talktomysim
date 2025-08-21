
import { useState } from 'react';
import { advisorRemovalService } from '@/services/advisorRemovalService';
import { AgentType } from '@/types/agent';
import { toast } from '@/components/ui/use-toast';

export const useAdvisorRemoval = (
  selectedPublicAdvisors: AgentType[],
  setSelectedPublicAdvisors: (advisors: AgentType[]) => void,
  selectedPublicAdvisorId: string | null,
  onSelectPublicAdvisor: (advisorId: string | null) => void,
  onShowAdvisorDirectory?: () => void
) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const removeAdvisor = async (advisorId: string) => {
    if (isRemoving) return;
    
    setIsRemoving(true);
    
    try {
      console.log('Starting advisor removal process for:', advisorId);
      
      // Immediately update UI - remove from sidebar
      const updatedAdvisors = selectedPublicAdvisors.filter(advisor => advisor.id !== advisorId);
      setSelectedPublicAdvisors(updatedAdvisors);
      
      // If the removed advisor was currently selected, handle navigation
      if (selectedPublicAdvisorId === advisorId) {
        // Clear the selection first
        onSelectPublicAdvisor(null);
        
        // If there are other advisors, select the first one
        if (updatedAdvisors.length > 0) {
          onSelectPublicAdvisor(updatedAdvisors[0].id, updatedAdvisors[0]);
        } else {
          // No more advisors, redirect to advisor directory
          onShowAdvisorDirectory?.();
        }
      }
      
      // Now perform the actual removal from backend
      const success = await advisorRemovalService.removeAdvisor(advisorId);
      
      if (success) {
        toast({
          title: "Advisor removed",
          description: "The advisor and all chat history have been removed successfully.",
        });
        
        console.log('Advisor removal completed successfully');
      } else {
        // If backend removal failed, revert the UI changes
        setSelectedPublicAdvisors(selectedPublicAdvisors);
        if (selectedPublicAdvisorId === advisorId) {
          onSelectPublicAdvisor(advisorId);
        }
        
        toast({
          title: "Error",
          description: "Failed to remove advisor. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in removeAdvisor:', error);
      
      // If error occurred, revert the UI changes
      setSelectedPublicAdvisors(selectedPublicAdvisors);
      if (selectedPublicAdvisorId === advisorId) {
        onSelectPublicAdvisor(advisorId);
      }
      
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
