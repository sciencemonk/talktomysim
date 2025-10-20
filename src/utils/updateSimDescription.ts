import { supabase } from "@/integrations/supabase/client";

export async function updateSimAutoDescription(simId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('update-sim-auto-description', {
      body: { simId }
    });

    if (error) throw error;
    
    console.log('Updated sim with auto description:', data);
    return data;
  } catch (error) {
    console.error('Error updating sim auto description:', error);
    throw error;
  }
}

// Function to update Cheesus specifically
export async function updateCheesusDescription() {
  const cheesusId = '382f827b-54a6-40ce-bc7e-6592266421ab';
  return updateSimAutoDescription(cheesusId);
}
