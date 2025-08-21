
import { useState, useEffect, useCallback } from 'react';
import { fetchAgents } from '@/services/agentService';
import { AgentType } from '@/types/agent';
import { useAuth } from './useAuth';

export const useAgents = (filter: string = 'all-agents') => {
  const [agents, setAgents] = useState<AgentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  const loadAgents = useCallback(async () => {
    // Don't try to fetch if auth is still loading
    if (authLoading) {
      return;
    }

    // If no user is authenticated, clear agents and stop loading
    if (!user) {
      setAgents([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Loading thinking partners for user:", user.id);
      const data = await fetchAgents(filter);
      setAgents(data);
      setError(null);
      console.log("Loaded thinking partners:", data);
    } catch (err: any) {
      setError(err.message || "Failed to load thinking partners");
      console.error("Error loading thinking partners:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filter, user, authLoading]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  return { agents, isLoading, error, refetch: loadAgents };
};
