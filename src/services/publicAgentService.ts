
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
  const tutorData = tutor as any;
  return {
    id: tutorData.id,
    name: tutorData.name,
    description: tutorData.description || '',
    type: tutorData.type as any,
    status: tutorData.status as any,
    createdAt: tutorData.created_at,
    updatedAt: tutorData.updated_at,
    model: tutorData.model,
    voice: tutorData.voice,
    voiceProvider: tutorData.voice_provider,
    customVoiceId: tutorData.custom_voice_id,
    voiceTraits: isVoiceTraitArray(tutorData.voice_traits) ? tutorData.voice_traits : [],
    interactions: tutorData.interactions || 0,
    studentsSaved: tutorData.students_saved || 0,
    helpfulnessScore: tutorData.helpfulness_score || 0,
    avmScore: tutorData.avm_score || 0,
    csat: tutorData.csat || 0,
    performance: tutorData.performance || 0,
    channels: isStringArray(tutorData.channels) ? tutorData.channels : [],
    channelConfigs: isChannelConfigsRecord(tutorData.channel_configs) ? tutorData.channel_configs : {},
    isPersonal: tutorData.is_personal,
    phone: tutorData.phone,
    email: tutorData.email,
    avatar: tutorData.avatar,
    purpose: tutorData.purpose,
    prompt: tutorData.prompt,
    subject: tutorData.subject,
    gradeLevel: tutorData.grade_level,
    teachingStyle: tutorData.teaching_style,
    customSubject: tutorData.custom_subject,
    learningObjective: tutorData.learning_objective,
    welcome_message: tutorData.welcome_message
  };
};
