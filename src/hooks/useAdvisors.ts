
import { useState, useEffect } from 'react';
import { fetchActiveAdvisors } from '@/services/advisorService';
import { Advisor } from '@/types/advisor';

export const useAdvisors = () => {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAdvisors = async () => {
      setIsLoading(true);
      try {
        const data = await fetchActiveAdvisors();
        setAdvisors(data);
        setError(null);
      } catch (err: any) {
        console.error("Error loading advisors:", err);
        setError(err.message || "Failed to load advisors");
      } finally {
        setIsLoading(false);
      }
    };

    loadAdvisors();
  }, []);

  return { advisors, isLoading, error, refetch: () => loadAdvisors() };
};
