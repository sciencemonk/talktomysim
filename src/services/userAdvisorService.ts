
import { supabase } from "@/integrations/supabase/client";
import { Advisor } from "@/types/advisor";

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

export const userAdvisorService = {
  // Get user's saved advisors
  async getUserAdvisors(): Promise<UserAdvisor[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_advisors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user advisors:', error);
      return [];
    }
  },

  // Add advisor to user's collection
  async addAdvisorToUser(advisor: Advisor): Promise<UserAdvisor | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_advisors')
        .insert({
          user_id: user.id,
          advisor_id: advisor.id,
          name: advisor.name,
          title: advisor.title,
          description: advisor.description,
          prompt: advisor.prompt,
          avatar_url: advisor.avatar_url,
          category: advisor.category,
          background_content: advisor.background_content,
          knowledge_summary: advisor.knowledge_summary
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log('Advisor already exists in user collection');
          // Return existing advisor
          const { data: existing } = await supabase
            .from('user_advisors')
            .select('*')
            .eq('user_id', user.id)
            .eq('advisor_id', advisor.id)
            .single();
          return existing;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error adding advisor to user:', error);
      return null;
    }
  },

  // Remove advisor from user's collection
  async removeAdvisorFromUser(advisorId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_advisors')
        .delete()
        .eq('user_id', user.id)
        .eq('advisor_id', advisorId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing advisor from user:', error);
      return false;
    }
  }
};
