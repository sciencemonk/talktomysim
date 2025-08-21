
import { useState, useEffect } from 'react';
import { fetchAdvisorById } from '@/services/advisorDetailService';
import { AgentType } from '@/types/agent';

export const useAdvisorDetail = (advisorId: string | undefined) => {
  const [advisor, setAdvisor] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!advisorId) {
      setError("Advisor ID is required");
      setIsLoading(false);
      return;
    }

    const loadAdvisorDetails = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAdvisorById(advisorId);
        setAdvisor(data);
        setError(null);
      } catch (err: any) {
        console.error("Error loading advisor details:", err);
        setError(err.message || "Failed to load advisor details");
      } finally {
        setIsLoading(false);
      }
    };

    loadAdvisorDetails();
  }, [advisorId]);

  return { advisor, isLoading, error };
};
