
import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
  id: string;
  user_id: string | null;
  advisor_id: string | null;
  tutor_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'system';
  content: string;
  created_at: string;
}

export const conversationService = {
  // Get or create a conversation for a user and advisor
  async getOrCreateConversation(advisorId: string): Promise<Conversation | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // For authenticated users, reuse existing conversation
      if (user) {
        // Try to get existing conversation
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .eq('tutor_id', advisorId)
          .maybeSingle();

        if (existingConversation) {
          console.log('Found existing conversation:', existingConversation.id);
          return existingConversation;
        }
      }

      // Create new conversation for first time chats
      if (user) {
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            tutor_id: advisorId,
            title: null,
            is_anonymous: false,
            is_creator_conversation: false
          })
          .select()
          .single();

        if (error) throw error;
        console.log('Created new conversation:', newConversation.id);
        return newConversation;
      }
      
      // For anonymous users - always create a new conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          user_id: null,
          tutor_id: advisorId,
          title: null,
          is_anonymous: true,
          is_creator_conversation: false
        })
        .select()
        .single();

      if (error) throw error;
      return newConversation;
    } catch (error) {
      console.error('Error getting or creating conversation:', error);
      return null;
    }
  },

  // Get messages for a conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Type cast the role field to ensure it matches our Message interface
      return (data || []).map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'system'
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  // Add a message to a conversation
  async addMessage(conversationId: string, role: 'user' | 'system', content: string): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role,
          content
        })
        .select()
        .single();

      if (error) throw error;
      
      // Type cast the role field to ensure it matches our Message interface
      return {
        ...data,
        role: data.role as 'user' | 'system'
      };
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  }
};
