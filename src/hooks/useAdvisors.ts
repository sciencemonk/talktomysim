
import { useState, useEffect } from 'react';
import { fetchAdvisors } from '@/services/advisorService';
import { Advisor } from '@/pages/Admin';

export const useAdvisors = () => {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching advisors...");
      const data = await fetchAdvisors();
      setAdvisors(data);
      setError(null);
    } catch (err: any) {
      console.error("Error loading advisors:", err);
      setError(err.message || "Failed to load advisors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { advisors, isLoading, error, refetch: fetchData };
};
