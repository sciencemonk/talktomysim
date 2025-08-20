
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AgentType, VoiceTrait, AgentChannelConfig } from '@/types/agent';

// Type guard functions for safe JSON conversion
const isVoiceTraitArray = (value: any): value is VoiceTrait[] => {
  return Array.isArray(value) && value.every(item => 
    typeof item === 'object' && item !== null && typeof item.name === 'string'
  );
};

const isStringArray = (value: any): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

const isChannelConfigsRecord = (value: any): value is Record<string, AgentChannelConfig> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const usePublicAgents = () => {
  const [agents, setAgents] = useState<AgentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicAgents = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching public tutors...");
        
        const { data: tutors, error } = await supabase
          .from('tutors')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching public tutors:", error);
          throw new Error(`Failed to fetch tutors: ${error.message}`);
        }

        console.log("Fetched public tutors:", tutors);

        // Transform the data to match AgentType interface with proper type handling
        const transformedAgents = tutors?.map(tutor => ({
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
          voiceTraits: isVoiceTraitArray(tutor.voice_traits) ? tutor.voice_traits : [],
          interactions: tutor.interactions || 0,
          studentsSaved: tutor.students_saved || 0,
          helpfulnessScore: tutor.helpfulness_score || 0,
          avmScore: tutor.avm_score || 0,
          csat: tutor.csat || 0,
          performance: tutor.performance || 0,
          channels: isStringArray(tutor.channels) ? tutor.channels : [],
          channelConfigs: isChannelConfigsRecord(tutor.channel_configs) ? tutor.channel_configs : {},
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
        })) || [];

        setAgents(transformedAgents);
        setError(null);
      } catch (err: any) {
        console.error("Error loading public tutors:", err);
        setError(err.message || "Failed to load tutors");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicAgents();
  }, []);

  return { agents, isLoading, error };
};
