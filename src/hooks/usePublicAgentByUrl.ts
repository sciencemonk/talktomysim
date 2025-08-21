
import { useState, useEffect } from 'react';
import { fetchPublicAgentByUrl } from '@/services/publicUrlService';
import { AgentType } from '@/types/agent';

export const usePublicAgentByUrl = (url: string | undefined) => {
  const [agent, setAgent] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setError("URL is required");
      setIsLoading(false);
      return;
    }

    const loadAgentDetails = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPublicAgentByUrl(url);
        setAgent(data);
        setError(null);
      } catch (err: any) {
        console.error("Error loading public tutor by URL:", err);
        setError(err.message || "Failed to load tutor details");
      } finally {
        setIsLoading(false);
      }
    };

    loadAgentDetails();
  }, [url]);

  return { agent, isLoading, error };
};
