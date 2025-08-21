
import { supabase } from '@/integrations/supabase/client';

export const advisorRemovalService = {
  removeAdvisor: async (advisorId: string): Promise<boolean> => {
    try {
      // Break up nested destructuring to avoid deep type inference
      const authResponse = await supabase.auth.getUser();
      const user = authResponse.data.user;
      const authError = authResponse.error;

      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('Removing advisor:', advisorId, 'for user:', user.id);

      // Use explicit generic typing to avoid deep inference
      const conversationsResponse = await supabase
        .from<{ id: string }>('conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('advisor_id', advisorId);

      if (conversationsResponse.error) {
        console.error('Error fetching conversations:', conversationsResponse.error);
        throw conversationsResponse.error;
      }

      const conversations = conversationsResponse.data;

      if (conversations && conversations.length > 0) {
        // Delete all messages for these conversations
        const conversationIds = conversations.map((c) => c.id);
        
        const messagesDelete = await supabase
          .from('messages')
          .delete()
          .in('conversation_id', conversationIds);

        if (messagesDelete.error) {
          console.error('Error deleting messages:', messagesDelete.error);
          throw messagesDelete.error;
        }

        // Delete the conversations
        const conversationsDelete = await supabase
          .from('conversations')
          .delete()
          .eq('user_id', user.id)
          .eq('advisor_id', advisorId);

        if (conversationsDelete.error) {
          console.error('Error deleting conversations:', conversationsDelete.error);
          throw conversationsDelete.error;
        }

        console.log(`Deleted ${conversations.length} conversations and their messages for advisor ${advisorId}`);
      }

      console.log('Successfully removed advisor:', advisorId);
      return true;
    } catch (error) {
      console.error('Error removing advisor:', error);
      return false;
    }
  }
};
