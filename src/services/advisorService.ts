
import { supabase } from "@/integrations/supabase/client";
import { Advisor } from "@/types/advisor";

export const fetchActiveAdvisors = async (): Promise<Advisor[]> => {
  console.log("Fetching active advisors from database");
  
  const { data: advisors, error } = await supabase
    .from('advisors')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching advisors:", error);
    throw new Error(`Failed to fetch advisors: ${error.message}`);
  }

  console.log("Fetched advisors:", advisors);
  return advisors || [];
};

export const fetchAdvisorById = async (id: string): Promise<Advisor | null> => {
  console.log("Fetching advisor by ID:", id);
  
  const { data: advisor, error } = await supabase
    .from('advisors')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error("Error fetching advisor:", error);
    return null;
  }

  console.log("Fetched advisor:", advisor);
  return advisor;
};
