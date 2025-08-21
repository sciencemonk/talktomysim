
import { supabase } from '@/integrations/supabase/client';

export const advisorRemovalService = {
  removeAdvisor: async (advisorId: string): Promise<boolean> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('Removing advisor:', advisorId, 'for user:', user.id);

      // Get conversations to delete - explicitly type the response to avoid deep inference
      const conversationsResponse = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('advisor_id', advisorId) as { data: { id: string }[] | null; error: any };

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
