
import { supabase } from "@/integrations/supabase/client";
import { Advisor } from "@/types/advisor";

export const fetchActiveAdvisors = async (): Promise<Advisor[]> => {
  console.log("Fetching active advisors from database");
  
  try {
    // Use any type cast to bypass TypeScript checking for the new table
    const query = supabase
      .from('advisors' as any)
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    const { data: advisors, error } = await query;

    if (error) {
      console.error("Error fetching advisors:", error);
      throw new Error(`Failed to fetch advisors: ${error.message}`);
    }

    console.log("Fetched advisors:", advisors);
    
    // Map the raw data to ensure it matches our Advisor type
    return (advisors || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      title: item.title || undefined,
      description: item.description || undefined,
      prompt: item.prompt,
      avatar_url: item.avatar_url || undefined,
      category: item.category || undefined,
      is_active: item.is_active,
      background_content: item.background_content || undefined,
      knowledge_summary: item.knowledge_summary || undefined,
      created_at: item.created_at,
      updated_at: item.updated_at
    } as Advisor));
  } catch (err) {
    console.error("Service error:", err);
    throw err;
  }
};

export const fetchAdvisorById = async (id: string): Promise<Advisor | null> => {
  console.log("Fetching advisor by ID:", id);
  
  try {
    const { data: advisor, error } = await supabase
      .from('advisors' as any)
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error("Error fetching advisor:", error);
      return null;
    }

    if (!advisor) {
      console.log("No advisor found with ID:", id);
      return null;
    }

    console.log("Fetched advisor:", advisor);
    
    return {
      id: advisor.id,
      name: advisor.name,
      title: advisor.title || undefined,
      description: advisor.description || undefined,
      prompt: advisor.prompt,
      avatar_url: advisor.avatar_url || undefined,
      category: advisor.category || undefined,
      is_active: advisor.is_active,
      background_content: advisor.background_content || undefined,
      knowledge_summary: advisor.knowledge_summary || undefined,
      created_at: advisor.created_at,
      updated_at: advisor.updated_at
    } as Advisor;
  } catch (err) {
    console.error("Service error:", err);
    return null;
  }
};
