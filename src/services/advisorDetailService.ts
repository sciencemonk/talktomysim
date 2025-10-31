
import { supabase } from "@/integrations/supabase/client";
import { AgentType } from "@/types/agent";

export const fetchAdvisorById = async (id: string): Promise<AgentType> => {
  console.log("Fetching advisor by ID:", id);
  
  // Explicitly exclude edit_code from public queries for security
  const { data: advisor, error } = await supabase
    .from('advisors')
    .select('id, name, title, description, prompt, sim_category, x402_wallet, auto_description, full_description, avatar_url, response_length, conversation_style, personality_type, website_url, created_at, updated_at, is_verified, date_of_birth, years_experience, interests, skills, sample_scenarios, completion_status, is_public, user_id, is_active, is_official, price, integrations, social_links, x402_price, x402_enabled, expertise_areas, target_audience, background_image_url, marketplace_category, background_content, knowledge_summary, url, full_name, professional_title, location, crypto_wallet, twitter_url, sim_type, owner_welcome_message, education, current_profession, areas_of_expertise, writing_sample, additional_background, custom_url, welcome_message')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching advisor:", error);
    throw new Error(`Failed to fetch advisor: ${error.message}`);
  }

  if (!advisor) {
    throw new Error("Advisor not found");
  }

  console.log("Fetched advisor:", advisor);

  // Transform the advisor data to match AgentType interface
  return {
    id: advisor.id,
    name: advisor.name,
    description: advisor.description || '',
    type: 'General Tutor' as any, // Default type for advisors
    status: 'active' as any,
    createdAt: advisor.created_at,
    updatedAt: advisor.updated_at,
    avatar: advisor.avatar_url,
    prompt: advisor.prompt,
    subject: advisor.marketplace_category || 'General',
    title: advisor.title, // Include the title field from advisors table
    welcome_message: advisor.welcome_message,
    is_featured: false, // Default to false since advisors table doesn't have this field yet
    // Social links from JSON field - cast to SocialLinks
    social_links: advisor.social_links as any,
    background_image_url: advisor.background_image_url,
    custom_url: advisor.custom_url,
    auto_description: advisor.auto_description,
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
  };
};
