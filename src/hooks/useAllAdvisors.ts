
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AgentType } from '@/types/agent';

export const useAllAdvisors = () => {
  const [agents, setAgents] = useState<AgentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllAdvisors = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch only from advisors table
        const { data: advisors, error: advisorsError } = await supabase
          .from('advisors')
          .select('*');

        if (advisorsError) {
          throw advisorsError;
        }

        // Transform advisors to AgentType format
        const transformedAdvisors: AgentType[] = (advisors || []).map(advisor => ({
          id: advisor.id,
          name: advisor.name,
          description: advisor.description || '',
          type: 'General Tutor' as any, // Default type for advisors
          status: 'active' as any,
          createdAt: advisor.created_at,
          updatedAt: advisor.updated_at,
          avatar: advisor.avatar_url,
          prompt: advisor.prompt,
          subject: advisor.category || 'General',
          // Set default values for tutor-specific fields
          model: 'GPT-4',
          interactions: 0,
          studentsSaved: 0,
          helpfulnessScore: 0,
          avmScore: 0,
          csat: 0,
          performance: 0,
          channels: [],
          channelConfigs: {},
          isPersonal: false,
          voiceTraits: []
        }));

        setAgents(transformedAdvisors);

      } catch (err: any) {
        console.error('Error fetching advisors:', err);
        setError(err.message || 'Failed to fetch advisors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllAdvisors();
  }, []);

  return { agents, isLoading, error };
};
