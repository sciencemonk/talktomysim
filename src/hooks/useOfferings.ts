import { useState, useEffect } from 'react';
import { fetchAllOfferings, Offering } from '@/services/offeringsService';

export const useOfferings = () => {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOfferings = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllOfferings();
        setOfferings(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load offerings");
        console.error("Error loading offerings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOfferings();
  }, []);

  return { offerings, isLoading, error };
};
