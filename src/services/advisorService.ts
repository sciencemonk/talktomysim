
import { supabase } from '@/integrations/supabase/client';

export const removeAdvisor = async (advisorId: string) => {
  const { error } = await supabase
    .from('user_advisors')
    .delete()
    .eq('advisor_id', advisorId);
  
  if (error) {
    console.error('Error removing advisor:', error);
    throw error;
  }
};
