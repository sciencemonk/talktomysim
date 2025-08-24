
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

        console.log('Fetching advisors from Supabase...');

        // Fetch from secure public_advisors view (protects sensitive prompts and business logic)
        const { data: advisors, error: advisorsError } = await supabase
          .from('public_advisors')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('Supabase response - advisors:', advisors);
        console.log('Supabase response - error:', advisorsError);

        if (advisorsError) {
          console.error('Supabase error:', advisorsError);
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
          prompt: '', // Prompts not exposed in public view for security
          subject: advisor.category || 'General',
          title: advisor.title, // Safe field from public_advisors view
          url: '', // URL not exposed in public view for security
          custom_url: advisor.custom_url, // Safe field from public_advisors view
          is_featured: false, // Default to false since advisors table doesn't have this field yet
          isActive: advisor.is_active !== false, // Map the is_active field properly
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

        console.log('Transformed advisors:', transformedAdvisors);
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
