
import { useState, useEffect } from 'react';
import { userAdvisorService, UserAdvisor } from '@/services/userAdvisorService';
import { Advisor } from '@/types/advisor';

export const useUserAdvisors = () => {
  const [userAdvisors, setUserAdvisors] = useState<UserAdvisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserAdvisors = async () => {
    setIsLoading(true);
    try {
      const data = await userAdvisorService.getUserAdvisors();
      setUserAdvisors(data);
      setError(null);
    } catch (err: any) {
      console.error("Error loading user advisors:", err);
      setError(err.message || "Failed to load advisors");
    } finally {
      setIsLoading(false);
    }
  };

  const addAdvisor = async (advisor: Advisor) => {
    try {
      const result = await userAdvisorService.addAdvisorToUser(advisor);
      if (result) {
        setUserAdvisors(prev => [result, ...prev.filter(a => a.advisor_id !== advisor.id)]);
        return result;
      }
      return null;
    } catch (err: any) {
      console.error("Error adding advisor:", err);
      setError(err.message || "Failed to add advisor");
      return null;
    }
  };

  const removeAdvisor = async (advisorId: string) => {
    try {
      const success = await userAdvisorService.removeAdvisorFromUser(advisorId);
      if (success) {
        setUserAdvisors(prev => prev.filter(a => a.advisor_id !== advisorId));
      }
      return success;
    } catch (err: any) {
      console.error("Error removing advisor:", err);
      setError(err.message || "Failed to remove advisor");
      return false;
    }
  };

  useEffect(() => {
    loadUserAdvisors();
  }, []);

  return { 
    userAdvisors, 
    isLoading, 
    error, 
    addAdvisor, 
    removeAdvisor, 
    refetch: loadUserAdvisors 
  };
};
