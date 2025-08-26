import { supabase } from "@/integrations/supabase/client";
import { AgentType } from "@/types/agent";

export const fetchAllPublicAdvisors = async (): Promise<AgentType[]> => {
  console.log("Fetching all advisors regardless of status");
  
  try {
    // Query directly from advisors table (RLS policies now allow anonymous access)
    console.log("Querying from advisors table with RLS policies");
    const { data: advisors, error } = await supabase
      .from('advisors')
      .select('id, name, title, professional_title, avatar_url, custom_url, url, created_at, updated_at, is_active');

    if (error) {
      console.error("Error fetching advisors:", error);
      return [];
    }

    console.log(`Found ${advisors?.length || 0} advisors`);
    
    // Log detailed info about each advisor to debug visibility issues
    console.log("Advisor details:", advisors?.map(a => ({
      id: a.id,
      name: a.name,
      is_active: a.is_active
    })));
    
    // Count how many are active
    const activeCount = advisors?.filter(a => a.is_active === true).length || 0;
    
    console.log(`Stats: ${activeCount} active advisors out of ${advisors?.length || 0} total`);
    
    // Filter to only show active advisors, but don't check is_public
    const visibleAdvisors = advisors?.filter(advisor => advisor.is_active === true) || [];
    console.log(`Showing ${visibleAdvisors.length} active advisors (ignoring is_public flag)`);
    
    // Transform the advisor data to match AgentType interface with only needed fields
    return visibleAdvisors.map(advisor => ({
      id: advisor.id,
      name: advisor.name,
      createdAt: advisor.created_at,
      updatedAt: advisor.updated_at,
      // There is no avatar field, only avatar_url
      avatar: null, // This is needed for the AgentType but doesn't exist in the database
      avatar_url: advisor.avatar_url,
      title: advisor.title || advisor.professional_title,
      url: advisor.url,
      custom_url: advisor.custom_url,
      // Minimal required fields for AgentType
      description: '',
      type: 'General Tutor' as any,
      status: 'active' as any
    }));
  } catch (e) {
    console.error("UNEXPECTED ERROR:", e);
    return [];
  }
}
