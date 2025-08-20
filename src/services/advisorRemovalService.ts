
import { supabase } from '@/integrations/supabase/client';

export const advisorRemovalService = {
  removeAdvisor: async (advisorId: string) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('Removing advisor:', advisorId, 'for user:', user.id);

      // Delete conversations and their messages
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('agent_id', advisorId);

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        throw conversationsError;
      }

      if (conversations && conversations.length > 0) {
        // Delete all messages for these conversations
        const conversationIds = conversations.map(c => c.id);
        
        const { error: messagesError } = await supabase
          .from('messages')
          .delete()
          .in('conversation_id', conversationIds);

        if (messagesError) {
          console.error('Error deleting messages:', messagesError);
          throw messagesError;
        }

        // Delete the conversations
        const { error: deleteConversationsError } = await supabase
          .from('conversations')
          .delete()
          .eq('user_id', user.id)
          .eq('agent_id', advisorId);

        if (deleteConversationsError) {
          console.error('Error deleting conversations:', deleteConversationsError);
          throw deleteConversationsError;
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
