
import { supabase } from "@/integrations/supabase/client";
import { AgentType, VoiceTrait, AgentChannelConfig } from "@/types/agent";

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

export const fetchPublicAgentById = async (id: string): Promise<AgentType> => {
  console.log("Fetching public tutor by ID:", id);
  
  const { data: tutor, error } = await supabase
    .from('tutors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching public tutor:", error);
    throw new Error(`Failed to fetch tutor: ${error.message}`);
  }

  if (!tutor) {
    throw new Error("Tutor not found");
  }

  console.log("Fetched public tutor:", tutor);

  // Transform the data to match AgentType interface with proper type handling
  return {
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
  };
};
