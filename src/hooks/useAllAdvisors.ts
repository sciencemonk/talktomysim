
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AgentType, VoiceTrait } from '@/types/agent';

export const useAllAdvisors = () => {
  const [agents, setAgents] = useState<AgentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllAdvisors = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch tutors
        const { data: tutors, error: tutorsError } = await supabase
          .from('tutors')
          .select('*')
          .eq('is_personal', false);

        if (tutorsError) {
          throw tutorsError;
        }

        // Fetch advisors
        const { data: advisors, error: advisorsError } = await supabase
          .from('advisors')
          .select('*');

        if (advisorsError) {
          throw advisorsError;
        }

        // Transform tutors to AgentType format
        const transformedTutors: AgentType[] = (tutors || []).map(tutor => ({
          id: tutor.id,
          name: tutor.name,
          description: tutor.description || '',
          type: tutor.type as any,
          status: tutor.status as any,
          createdAt: tutor.created_at,
          updatedAt: tutor.updated_at,
          model: tutor.model,
          voice: tutor.voice,
          voiceProvider: tutor.voice_provider,
          customVoiceId: tutor.custom_voice_id,
          voiceTraits: Array.isArray(tutor.voice_traits) ? tutor.voice_traits as VoiceTrait[] : [],
          interactions: tutor.interactions || 0,
          studentsSaved: tutor.students_saved || 0,
          helpfulnessScore: tutor.helpfulness_score || 0,
          avmScore: tutor.avm_score || 0,
          csat: tutor.csat || 0,
          performance: tutor.performance || 0,
          channels: Array.isArray(tutor.channels) ? tutor.channels : [],
          channelConfigs: typeof tutor.channel_configs === 'object' ? tutor.channel_configs : {},
          isPersonal: tutor.is_personal,
          phone: tutor.phone,
          email: tutor.email,
          avatar: tutor.avatar,
          purpose: tutor.purpose,
          prompt: tutor.prompt,
          subject: tutor.subject,
          gradeLevel: tutor.grade_level,
          teachingStyle: tutor.teaching_style,
          customSubject: tutor.custom_subject,
          learningObjective: tutor.learning_objective
        }));

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

        // Combine both arrays
        const combinedAgents = [...transformedTutors, ...transformedAdvisors];
        setAgents(combinedAgents);

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
