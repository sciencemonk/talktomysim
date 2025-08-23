import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
  id: string;
  user_id: string;
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
  // Create a conversation for anonymous users (no auth required)
  async getOrCreateConversation(advisorId: string): Promise<Conversation | null> {
    try {
      console.log('Creating anonymous conversation for advisor:', advisorId);

      // First verify the advisor exists using the public API
      const { data: advisor, error: advisorError } = await supabase
        .from('advisors')
        .select('id')
        .eq('id', advisorId)
        .single();

      if (advisorError || !advisor) {
        console.error('Advisor not found:', advisorId, advisorError);
        return null;
      }

      // Create new conversation for anonymous user
      const conversationData = {
        user_id: 'anonymous',
        tutor_id: advisorId,
        title: null
      };

      console.log('Inserting conversation with data:', conversationData);

      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select()
        .single();

      if (error) {
        console.error('Error creating anonymous conversation:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return null;
      }

      console.log('Created anonymous conversation:', newConversation.id);
      return newConversation;
      
    } catch (error) {
      console.error('Error creating anonymous conversation:', error);
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
      
      return {
        ...data,
        role: data.role as 'user' | 'system'
      };
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  },

  // Get conversations for an advisor (for dashboard)
  async getAdvisorConversations(advisorId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages (
            id,
            content,
            role,
            created_at,
            score,
            intent,
            urgency_level
          )
        `)
        .eq('tutor_id', advisorId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match what the dashboard expects
      return (data || []).map(conversation => {
        const messages = conversation.messages || [];
        const userMessages = messages.filter(m => m.role === 'user');
        const latestMessage = messages[messages.length - 1];
        const scores = userMessages.map(m => m.score || 0).filter(s => s > 0);
        
        return {
          id: conversation.id,
          created_at: conversation.created_at,
          updated_at: conversation.updated_at,
          message_count: messages.length,
          latest_message: latestMessage?.content || 'No messages',
          avg_score: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
          highest_score: scores.length > 0 ? Math.max(...scores) : 0,
          intents: [...new Set(userMessages.map(m => m.intent).filter(Boolean))],
          escalated: scores.some(s => s >= 7) || messages.length >= 5,
          is_anonymous: conversation.user_id === 'anonymous'
        };
      });
    } catch (error) {
      console.error('Error fetching advisor conversations:', error);
      return [];
    }
  }
};
