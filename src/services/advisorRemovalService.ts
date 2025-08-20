
import { supabase } from "@/integrations/supabase/client";

export const advisorRemovalService = {
  // Remove advisor and all associated data
  async removeAdvisor(advisorId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Removing advisor:', advisorId, 'for user:', user.id);

      // Delete all conversations and their messages for this advisor and user
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('id')
        .eq('tutor_id', advisorId)
        .eq('user_id', user.id);

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        throw conversationsError;
      }

      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map(c => c.id);
        
        // Delete messages first (due to foreign key constraints)
        const { error: messagesError } = await supabase
          .from('messages')
          .delete()
          .in('conversation_id', conversationIds);

        if (messagesError) {
          console.error('Error deleting messages:', messagesError);
          throw messagesError;
        }

        // Delete conversations
        const { error: deleteConversationsError } = await supabase
          .from('conversations')
          .delete()
          .in('id', conversationIds);

        if (deleteConversationsError) {
          console.error('Error deleting conversations:', deleteConversationsError);
          throw deleteConversationsError;
        }

        console.log(`Deleted ${conversations.length} conversations and their messages for advisor ${advisorId}`);
      }

      // Remove from user_advisors table if it exists
      const { error: userAdvisorsError } = await supabase
        .from('user_advisors')
        .delete()
        .eq('advisor_id', advisorId)
        .eq('user_id', user.id);

      if (userAdvisorsError && userAdvisorsError.code !== '42P01') { // Ignore table doesn't exist error
        console.error('Error removing from user_advisors:', userAdvisorsError);
        throw userAdvisorsError;
      }

      console.log('Successfully removed advisor:', advisorId);
      return true;
    } catch (error) {
      console.error('Error removing advisor:', error);
      return false;
    }
  }
};
