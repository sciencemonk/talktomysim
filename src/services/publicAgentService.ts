
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

class PublicAgentService {
  async fetchPublicAgentById(id: string): Promise<AgentType> {
  console.log("Fetching public advisor by ID:", id);
  
  const { data: advisor, error } = await supabase
    .from('advisors')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching public advisor:", error);
    throw new Error(`Failed to fetch advisor: ${error.message}`);
  }

  if (!advisor) {
    throw new Error("Advisor not found");
  }

  console.log("Fetched public advisor:", advisor);

  // Transform the advisor data to match AgentType interface
  return {
    id: advisor.id,
    name: advisor.name,
    description: advisor.description || '',
    type: 'General Tutor' as any, // Default type since advisors don't have this field
    status: 'active' as any, // Default status
    createdAt: advisor.created_at,
    updatedAt: advisor.updated_at,
    avatar: advisor.avatar,
    avatar_url: advisor.avatar_url,
    prompt: advisor.prompt,
    title: advisor.title,
    url: advisor.url, // Include the url field from advisors table
    custom_url: advisor.custom_url, // Include the custom_url field from advisors table
    welcomeMessage: advisor.welcome_message, // Include welcome message
    // Default values for fields that don't exist in advisors table
    model: 'gpt-4',
    voice: 'default',
    voiceProvider: 'openai',
    customVoiceId: null,
    voiceTraits: [],
    interactions: 0,
    studentsSaved: 0,
    helpfulnessScore: 0,
    avmScore: 0,
    csat: 0,
    performance: 0,
    channels: [],
    channelConfigs: {},
    isPersonal: false,
    phone: null,
    email: null,
    purpose: null,
    subject: null,
    gradeLevel: null,
    teachingStyle: null,
    customSubject: null,
    learningObjective: null,
    is_featured: false
  };
  }
}

export const publicAgentService = new PublicAgentService();
