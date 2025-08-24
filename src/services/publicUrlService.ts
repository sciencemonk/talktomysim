
import { supabase } from "@/integrations/supabase/client";
import { AgentType } from "@/types/agent";

export const fetchPublicAgentByUrl = async (url: string): Promise<AgentType> => {
  console.log("Fetching public advisor by URL:", url);
  
  // Use the secure public_advisors view instead of direct advisors table access
  const { data: advisor, error } = await supabase
    .from('public_advisors')
    .select('*')
    .eq('custom_url', url)
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
    prompt: '', // Prompts not exposed in public view for security
    title: advisor.title,
    url: '', // URL not exposed in public view for security
    custom_url: advisor.custom_url, // Safe field from public_advisors view
    welcomeMessage: '', // Welcome message not exposed in public view for security
    // Default values for fields that don't exist in public_advisors view
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
};
