
import { supabase } from '@/integrations/supabase/client';

export const advisorRemovalService = {
  removeAdvisor: async (advisorId: string) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('Removing advisor:', advisorId, 'for user:', user.id);

      // Get conversations to delete - using a simpler query structure
      const conversationsResult = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('advisor_id', advisorId);

      const conversations = conversationsResult.data;
      const conversationsError = conversationsResult.error;

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        throw conversationsError;
      }

      if (conversations && conversations.length > 0) {
        // Delete all messages for these conversations
        const conversationIds = conversations.map((c: { id: string }) => c.id);
        
        const messagesResult = await supabase
          .from('messages')
          .delete()
          .in('conversation_id', conversationIds);

        if (messagesResult.error) {
          console.error('Error deleting messages:', messagesResult.error);
          throw messagesResult.error;
        }

        // Delete the conversations
        const deleteConversationsResult = await supabase
          .from('conversations')
          .delete()
          .eq('user_id', user.id)
          .eq('advisor_id', advisorId);

        if (deleteConversationsResult.error) {
          console.error('Error deleting conversations:', deleteConversationsResult.error);
          throw deleteConversationsResult.error;
        }

        console.log(`Deleted ${conversations.length} conversations and their messages for advisor ${advisorId}`);
      }

      console.log('Successfully removed advisor:', advisorId);
      return true;
    } catch (error) {
      console.error('Error removing advisor:', error);
      throw error;
    }
  }
};
