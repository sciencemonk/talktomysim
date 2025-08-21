
import { supabase } from "@/integrations/supabase/client";
import { AgentType } from "@/types/agent";

export interface UserAdvisor {
  id: string;
  user_id: string;
  advisor_id: string;
  name: string;
  title?: string;
  description?: string;
  prompt: string;
  avatar_url?: string;
  category?: string;
  background_content?: string;
  knowledge_summary?: string;
  created_at: string;
  updated_at: string;
}

export const addUserAdvisor = async (advisor: AgentType): Promise<UserAdvisor> => {
  console.log("Adding advisor to user's list:", advisor);
  
  const { data, error } = await supabase
    .from('user_advisors')
    .insert({
      advisor_id: advisor.id,
      name: advisor.name,
      title: advisor.title || advisor.subject,
      description: advisor.description,
      prompt: advisor.prompt || '',
      avatar_url: advisor.avatar,
      category: advisor.subject,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding user advisor:", error);
    throw new Error(`Failed to add advisor: ${error.message}`);
  }

  console.log("Added user advisor:", data);
  return data;
};

export const fetchUserAdvisors = async (): Promise<UserAdvisor[]> => {
  console.log("Fetching user advisors...");
  
  const { data, error } = await supabase
    .from('user_advisors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching user advisors:", error);
    throw new Error(`Failed to fetch user advisors: ${error.message}`);
  }

  console.log("Fetched user advisors:", data);
  return data || [];
};

export const removeUserAdvisor = async (advisorId: string): Promise<void> => {
  console.log("Removing user advisor:", advisorId);
  
  const { error } = await supabase
    .from('user_advisors')
    .delete()
    .eq('advisor_id', advisorId);

  if (error) {
    console.error("Error removing user advisor:", error);
    throw new Error(`Failed to remove advisor: ${error.message}`);
  }

  console.log("Removed user advisor:", advisorId);
};
