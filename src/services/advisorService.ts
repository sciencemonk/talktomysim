import { supabase } from "@/integrations/supabase/client";
import { Advisor } from "@/pages/Admin";

export const fetchAdvisors = async (): Promise<Advisor[]> => {
  console.log("Fetching advisors from database...");
  
  // Explicitly exclude edit_code from public queries for security
  const { data: advisors, error } = await supabase
    .from('advisors')
    .select('id, name, title, description, prompt, sim_category, x402_wallet, auto_description, full_description, avatar_url, response_length, conversation_style, personality_type, website_url, created_at, updated_at, is_verified, date_of_birth, years_experience, interests, skills, sample_scenarios, completion_status, is_public, user_id, is_active, is_official, price, integrations, social_links, x402_price, x402_enabled, expertise_areas, target_audience, background_image_url, marketplace_category, background_content, knowledge_summary, url, full_name, professional_title, location, crypto_wallet, twitter_url, sim_type, owner_welcome_message, education, current_profession, areas_of_expertise, writing_sample, additional_background, custom_url, welcome_message, edit_code')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching advisors:", error);
    throw new Error(`Failed to fetch advisors: ${error.message}`);
  }

  console.log("Fetched advisors:", advisors);
  return advisors || [];
};

export const createAdvisor = async (advisorData: Omit<Advisor, 'id' | 'created_at' | 'updated_at'>): Promise<Advisor> => {
  console.log("Creating advisor:", advisorData);
  
  const { data: advisor, error } = await supabase
    .from('advisors')
    .insert(advisorData)
    .select()
    .single();

  if (error) {
    console.error("Error creating advisor:", error);
    throw new Error(`Failed to create advisor: ${error.message}`);
  }

  console.log("Created advisor:", advisor);
  return advisor;
};

export const updateAdvisor = async (id: string, advisorData: Partial<Omit<Advisor, 'id' | 'created_at' | 'updated_at'>>): Promise<Advisor> => {
  console.log("Updating advisor:", id, advisorData);
  
  const { data: advisor, error } = await supabase
    .from('advisors')
    .update(advisorData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating advisor:", error);
    throw new Error(`Failed to update advisor: ${error.message}`);
  }

  console.log("Updated advisor:", advisor);
  return advisor;
};

export const deleteAdvisor = async (id: string): Promise<void> => {
  console.log("Deleting advisor:", id);
  
  const { error } = await supabase
    .from('advisors')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting advisor:", error);
    throw new Error(`Failed to delete advisor: ${error.message}`);
  }

  console.log("Deleted advisor:", id);
};

export const removeAdvisor = async (advisorId: string) => {
  const { error } = await supabase
    .from('user_advisors')
    .delete()
    .eq('advisor_id', advisorId);

  if (error) {
    console.error('Error removing advisor:', error);
    throw new Error('Failed to remove advisor');
  }
};
