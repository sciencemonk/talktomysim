
import { supabase } from "@/integrations/supabase/client";
import { AgentType } from "@/types/agent";

export const fetchPublicAgentByUrl = async (url: string): Promise<AgentType> => {
  console.log("Fetching public advisor by URL:", url);
  
  const { data: advisor, error } = await supabase
    .from('advisors')
    .select('*')
    .eq('url', url)
    .maybeSingle();

  if (error) {
    console.error("Error fetching public advisor by URL:", error);
    throw new Error(`Failed to fetch advisor: ${error.message}`);
  }

  if (!advisor) {
    throw new Error("Advisor not found");
  }

  console.log("Fetched public advisor by URL:", advisor);

  // Transform the advisor data to match AgentType interface
  return {
    id: advisor.id,
    name: advisor.name,
    description: advisor.description || '',
    type: 'General Tutor' as any,
    status: 'active' as any,
    createdAt: advisor.created_at,
    updatedAt: advisor.updated_at,
    avatar: advisor.avatar_url,
    prompt: advisor.prompt,
    title: advisor.title,
    url: advisor.url,
    is_verified: advisor.is_verified || false, // Include verification status
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
    learningObjective: null
  };
};
