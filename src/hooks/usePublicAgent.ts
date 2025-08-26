
import { useState, useEffect } from 'react';
import { publicAgentService } from '@/services/publicAgentService';
import { AgentType } from '@/types/agent';

export const usePublicAgent = (agentId: string | undefined) => {
  const [agent, setAgent] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) {
      setError("Agent ID is required");
      setIsLoading(false);
      return;
    }

    const loadAgentDetails = async () => {
      setIsLoading(true);
      try {
        const data = await publicAgentService.fetchPublicAgentById(agentId);
        setAgent(data);
        setError(null);
      } catch (err: any) {
        console.error("Error loading public tutor details:", err);
        setError(err.message || "Failed to load tutor details");
      } finally {
        setIsLoading(false);
      }
    };

    loadAgentDetails();
  }, [agentId]);

  return { agent, isLoading, error };
};
