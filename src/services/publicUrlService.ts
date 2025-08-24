
import { supabase } from "@/integrations/supabase/client";
import { AgentType } from "@/types/agent";

export const fetchPublicAgentByUrl = async (url: string): Promise<AgentType> => {
  console.log("Fetching public advisor by URL:", url);
  
  // First, get the basic public info from the secure view
  const { data: publicAdvisor, error: publicError } = await supabase
    .from('public_advisors')
    .select('*')
    .eq('custom_url', url)
    .maybeSingle();

  if (publicError) {
    console.error("Error fetching public advisor by URL:", publicError);
    throw new Error(`Failed to fetch advisor: ${publicError.message}`);
  }

  if (!publicAdvisor) {
    throw new Error("Advisor not found");
  }

  // Then, fetch the welcome message from the full advisors table (only this specific field)
  const { data: advisorWelcomeData, error: welcomeError } = await supabase
    .from('advisors')
    .select('welcome_message')
    .eq('id', publicAdvisor.id)
    .eq('is_public', true)  // Additional security check
    .eq('is_active', true)  // Additional security check
    .maybeSingle();

  console.log("Fetched public advisor by URL:", publicAdvisor);

  // Use the welcome message from the advisors table, or fall back to default
  const welcomeMessage = advisorWelcomeData?.welcome_message || 
    `Hello! I'm ${publicAdvisor.name}'s Sim. I'm here to help and answer questions just as ${publicAdvisor.name} would. What can I do for you?`;

  // Transform the advisor data to match AgentType interface
  return {
    id: publicAdvisor.id,
    name: publicAdvisor.name,
    description: publicAdvisor.description || '',
    type: 'General Tutor' as any,
    status: 'active' as any,
    createdAt: publicAdvisor.created_at,
    updatedAt: publicAdvisor.updated_at,
    avatar: publicAdvisor.avatar_url,
    prompt: '', // Prompts not exposed in public view for security
    title: publicAdvisor.title,
    url: '', // URL not exposed in public view for security
    custom_url: publicAdvisor.custom_url, // Safe field from public_advisors view
    welcomeMessage: welcomeMessage, // Welcome message from interaction model
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
