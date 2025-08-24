
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
  // Get or create a conversation - handles both user sims and public advisors
  async getOrCreateConversation(agentId: string, isUserSim: boolean = false): Promise<Conversation | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && isUserSim) {
        // Signed-in user talking to their own sim - use advisors table
        console.log('Creating conversation for user sim:', agentId);
        
        // First try to get existing conversation for this advisor (user's own sim)
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .eq('advisor_id', agentId)
          .eq('tutor_id', agentId)
          .maybeSingle();

        if (existingConversation) {
          return existingConversation;
        }

        // Create new conversation for user sim
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            tutor_id: agentId,
            advisor_id: agentId,
            title: 'My Sim Chat'
          })
          .select()
          .single();

        if (error) throw error;
        return newConversation;
        
      } else if (user && !isUserSim) {
        // Signed-in user talking to a public advisor - use advisors table
        console.log('Creating conversation for signed-in user with public advisor:', agentId);
        
        // First try to get existing conversation for this advisor
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .eq('advisor_id', agentId)
          .eq('tutor_id', agentId)
          .maybeSingle();

        if (existingConversation) {
          return existingConversation;
        }

        // Create new conversation with public advisor
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            advisor_id: agentId,
            tutor_id: agentId,
            title: null
          })
          .select()
          .single();

        if (error) throw error;
        return newConversation;
        
      } else {
        // Anonymous user on public advisor page
        console.log('Creating anonymous conversation for public advisor:', agentId);
        
        // For anonymous users, create a single conversation per session
        const sessionKey = `anon_conversation_${agentId}`;
        const existingConversationId = localStorage.getItem(sessionKey);
        
        if (existingConversationId) {
          // Try to fetch the existing conversation
          const { data: existingConversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', existingConversationId)
            .eq('tutor_id', agentId)
            .is('user_id', null)
            .maybeSingle();
            
          if (existingConversation) {
            console.log('Reusing existing anonymous conversation:', existingConversation.id);
            return existingConversation;
          } else {
            // Conversation no longer exists, clear from localStorage
            localStorage.removeItem(sessionKey);
          }
        }

        // Create new anonymous conversation with public advisor
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({
            user_id: null,
            advisor_id: null,
            tutor_id: agentId, // For anonymous users, store advisor ID in tutor_id field
            title: 'Anonymous Chat'
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating anonymous conversation:', error);
          return null;
        }
        
        // Store the conversation ID in localStorage for this session
        localStorage.setItem(sessionKey, newConversation.id);
        console.log('Created and stored anonymous conversation:', newConversation.id);
        return newConversation;
      }
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
  },

  // Get conversations for an advisor (for dashboard) - includes ALL conversations regardless of user type
  async getAdvisorConversations(advisorId: string): Promise<any[]> {
    try {
      console.log('Fetching ALL conversations for advisor:', advisorId);
      
      // Fetch ALL conversations for this advisor, regardless of user type
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

      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} conversations for advisor ${advisorId}`);
      
      // Transform the data to match what the dashboard expects
      return (data || []).map(conversation => {
        const messages = conversation.messages || [];
        const userMessages = messages.filter(m => m.role === 'user');
        const latestMessage = messages[messages.length - 1];
        const scores = userMessages.map(m => m.score || 0).filter(s => s > 0);
        
        // Check if this is an anonymous user (user_id is null)
        const isAnonymous = conversation.user_id === null;
        
        console.log(`Conversation ${conversation.id}: user_id=${conversation.user_id}, is_anonymous=${isAnonymous}, messages=${messages.length}`);
        
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
          is_anonymous: isAnonymous,
          user_id: conversation.user_id
        };
      });
    } catch (error) {
      console.error('Error fetching advisor conversations:', error);
      return [];
    }
  }
};
