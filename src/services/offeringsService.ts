import { supabase } from "@/integrations/supabase/client";

export interface Offering {
  id: string;
  agent_id: string;
  title: string;
  description: string;
  price: number;
  offering_type: string;
  delivery_method: string;
  media_url?: string;
  agent_avatar_url?: string;
  is_active: boolean;
  created_at: string;
  price_per_conversation?: number;
  digital_file_url?: string;
  agent_name?: string;
  agent_description?: string;
}

export const fetchAllOfferings = async (): Promise<Offering[]> => {
  const { data, error } = await supabase
    .from('x_agent_offerings')
    .select(`
      *,
      advisors:agent_id (
        name,
        description
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching offerings:', error);
    throw error;
  }

  return (data || []).map(offering => ({
    ...offering,
    agent_name: offering.advisors?.name,
    agent_description: offering.advisors?.description,
  }));
};
