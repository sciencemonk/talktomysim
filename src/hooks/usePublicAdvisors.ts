
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublicAdvisor {
  id: string;
  name: string;
  title?: string;
  description?: string;
  avatar_url?: string;
  category?: string;
  url?: string;
}

export const usePublicAdvisors = () => {
  const [advisors, setAdvisors] = useState<PublicAdvisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicAdvisors = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching advisors from database...");
        
        const { data: advisors, error } = await supabase
          .from('advisors')
          .select('id, name, title, description, avatar_url, category, url')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching advisors:", error);
          throw new Error(`Failed to fetch advisors: ${error.message}`);
        }

        console.log("Fetched advisors:", advisors);
        setAdvisors(advisors || []);
        setError(null);
      } catch (err: any) {
        console.error("Error loading advisors:", err);
        setError(err.message || "Failed to load advisors");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicAdvisors();
  }, []);

  return { advisors, isLoading, error };
};
