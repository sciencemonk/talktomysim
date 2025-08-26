import { useState, useEffect } from 'react';
import { fetchAllPublicAdvisors } from '@/services/publicAdvisorService';
import { AgentType } from '@/types/agent';

export const usePublicAdvisors = () => {
  const [advisors, setAdvisors] = useState<AgentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPublicAdvisors = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllPublicAdvisors();
        setAdvisors(data);
        setError(null);
      } catch (err: any) {
        console.error("Error loading public advisors:", err);
        setError(err.message || "Failed to load advisors");
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicAdvisors();
  }, []);

  return { advisors, isLoading, error };
};
