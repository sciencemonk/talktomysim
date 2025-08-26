import { supabase } from '@/integrations/supabase/client';

export interface Conversation {
  id: string;
  user_id: string | null;
  tutor_id: string;
  advisor_id?: string;
  title?: string;
  created_at: string;
  updated_at: string;
  is_anonymous?: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'system';
  content: string;
  created_at: string;
}

export const conversationService = {
  // Scan localStorage for public conversations with a specific advisor
  async scanLocalStorageForPublicConversations(advisorId: string): Promise<any[]> {
    
    const publicConversations = [];
    
    // Iterate through localStorage to find public conversation IDs
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('public_conversation_') && key.includes(advisorId)) {
        const conversationId = localStorage.getItem(key);
        if (conversationId) {
          console.log(`Found public conversation in localStorage: ${conversationId}`);
          
          // Get messages for this conversation
          const messagesKey = `messages_${conversationId}`;
          const messagesJson = localStorage.getItem(messagesKey);
          let messages = [];
          
          if (messagesJson) {
            try {
              messages = JSON.parse(messagesJson);
            } catch (e) {
              console.error('Error parsing messages from localStorage:', e);
            }
          }
          
          // Extract user ID from the key (format: public_conversation_USER_ID_ADVISOR_ID)
          const keyParts = key.split('_');
          const userId = keyParts.length > 2 ? keyParts[2] : 'anonymous';
          
          // Create a conversation object
          publicConversations.push({
            id: conversationId,
            user_id: userId !== 'anonymous' ? userId : null,
            tutor_id: advisorId,
            advisor_id: advisorId,
            title: 'Public Chat',
            created_at: messages.length > 0 ? messages[0].created_at : new Date().toISOString(),
            updated_at: messages.length > 0 ? messages[messages.length - 1].created_at : new Date().toISOString(),
            message_count: messages.length,
            is_anonymous: userId === 'anonymous'
          });
        }
      }
    }
    
    console.log(`Found ${publicConversations.length} public conversations in localStorage`);
    return publicConversations;
  },
  
  // Get or create a conversation for public use
  async getOrCreateConversation(advisorId: string): Promise<Conversation | null> {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log(`Creating public conversation for advisor ${advisorId}, user: ${user?.id || 'anonymous'}`);
      
      // Use localStorage only for caching the conversation ID, not for storing the actual conversation
      const publicCacheKey = `public_conversation_${user?.id || 'anonymous'}_${advisorId}`;
      const cachedConversationId = localStorage.getItem(publicCacheKey);
      
      // If we have a cached ID, try to use it
      if (cachedConversationId) {
        console.log(`Checking cached conversation ID: ${cachedConversationId}`);
        
        try {
          const { data: existingConversation, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', cachedConversationId)
            .maybeSingle();
          
          if (existingConversation && !error) {
            console.log(`Found existing database conversation: ${cachedConversationId}`);
            return existingConversation;
          } else {
            console.log(`Cached conversation not found or invalid, creating new one`);
            // Clear the invalid cache
            localStorage.removeItem(publicCacheKey);
          }
        } catch (dbError) {
          console.log(`Database lookup failed:`, dbError);
          localStorage.removeItem(publicCacheKey);
        }
      }
      
      // Create a new conversation in the database
      const databaseId = crypto.randomUUID();
      
      const conversationData = {
        id: databaseId,
        user_id: user?.id || null, // null for anonymous users
        tutor_id: advisorId,
        advisor_id: advisorId,
        title: 'Public Chat',
        is_anonymous: user?.id ? false : true // Mark as anonymous if no user_id
      };
      
      // Always try to save to database first
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating conversation in database:', createError);
        
        // If we still can't create in the database, only then fall back to a temporary ID
        // This should be rare with the new RLS policies
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        console.log(`Using temporary conversation ID: ${tempId}`);
        
        // Return a temporary conversation object
        return {
          id: tempId,
          user_id: user?.id || null,
          tutor_id: advisorId,
          advisor_id: advisorId,
          title: 'Public Chat',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_anonymous: user?.id ? false : true
        };
      }
      
      // Success - cache the database UUID
      localStorage.setItem(publicCacheKey, databaseId);
      console.log(`Created new conversation in database: ${databaseId}`);
      
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  },

  // Get or create a conversation for owner use
  async getOrCreateOwnerConversation(advisorId: string): Promise<Conversation | null> {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('Cannot create owner conversation: User not authenticated');
        return null;
      }
      
      console.log(`Creating owner conversation for user ${user.id} and advisor ${advisorId}`);
      
      // Check for existing cached conversation ID
      const ownerCacheKey = `owner_conversation_${user.id}_${advisorId}`;
      const cachedConversationId = localStorage.getItem(ownerCacheKey);
      
      if (cachedConversationId) {
        console.log(`Checking cached owner conversation ID: ${cachedConversationId}`);
        
        // Try to fetch from database
        try {
          const { data: existingConversation, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', cachedConversationId)
            .eq('user_id', user.id)
            .eq('tutor_id', advisorId)
            .maybeSingle();
          
          if (existingConversation && !error) {
            console.log(`Found existing owner conversation: ${cachedConversationId}`);
            return existingConversation;
          }
        } catch (dbError) {
          console.log(`Database lookup failed:`, dbError);
        }
        
        console.log(`Cached owner conversation not found or invalid, creating new one`);
        localStorage.removeItem(ownerCacheKey);
      }
      
      // Create a new owner conversation
      const databaseId = crypto.randomUUID();
      
      const conversationData = {
        id: databaseId,
        user_id: user.id,
        tutor_id: advisorId,
        advisor_id: advisorId,
        title: 'Owner Chat',
        is_anonymous: false
      };
      
      // Save to database
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating owner conversation in database:', createError);
        return null;
      }
      
      // Cache the conversation ID
      localStorage.setItem(ownerCacheKey, databaseId);
      console.log(`Created new owner conversation in database: ${databaseId}`);
      
      return newConversation;
    } catch (error) {
      console.error('Error creating owner conversation:', error);
      return null;
    }
  },

  // Add a message to a conversation
  async addMessage(conversationId: string, role: 'user' | 'system', content: string): Promise<Message | null> {
    try {
      if (!conversationId) {
        console.error('addMessage: No conversation ID provided');
        return null;
      }
      
      if (!content.trim()) {
        console.error('addMessage: Empty content provided');
        return null;
      }
      
      console.log(`addMessage: Adding ${role} message to conversation ${conversationId}`);
      
      // Always try to save to database first, regardless of conversation ID format
      const messageId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      
      const messageData = {
        id: messageId,
        conversation_id: conversationId,
        role,
        content,
        created_at: timestamp
      };
      
      // Try to save to database
      const { data: savedMessage, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();
      
      if (error) {
        console.log('Database save failed, using localStorage as fallback:', error);
        
        // Fall back to localStorage for temporary conversations
        const messagesKey = `messages_${conversationId}`;
        const messagesJson = localStorage.getItem(messagesKey);
        let messages = [];
        
        if (messagesJson) {
          try {
            messages = JSON.parse(messagesJson);
          } catch (e) {
            console.error('Error parsing messages from localStorage:', e);
          }
        }
        
        // Check for duplicate content within the last 10 seconds to prevent double-saving
        const now = new Date();
        const recentMessages = messages.filter(msg => {
          const msgTime = new Date(msg.created_at);
          return now.getTime() - msgTime.getTime() < 10000; // 10 seconds
        });
        
        const isDuplicate = recentMessages.some(msg => 
          msg.role === role && 
          msg.content.trim() === content.trim()
        );
        
        if (isDuplicate) {
          console.log('Duplicate message detected, skipping save');
          return recentMessages.find(msg => 
            msg.role === role && 
            msg.content.trim() === content.trim()
          ) || null;
        }
        
        // Create a new message
        const newMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
          conversation_id: conversationId,
          role,
          content,
          created_at: timestamp
        };
        
        // Add to messages array
        messages.push(newMessage);
        
        // Save back to localStorage
        localStorage.setItem(messagesKey, JSON.stringify(messages));
        console.log(`Added message to localStorage, now ${messages.length} messages`);
        
        return newMessage;
      }
      
      return savedMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  },

  // Get messages for a conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      console.log('getMessages: Fetching messages for conversation:', conversationId);
      
      // Always try database first, regardless of conversation ID format
      const { data: dbMessages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (!error && dbMessages && dbMessages.length > 0) {
        console.log(`Found ${dbMessages.length} messages in database for conversation ${conversationId}`);
        return dbMessages;
      }
      
      // If database lookup failed or returned no results, check localStorage
      console.log('This is a memory conversation, retrieving from localStorage');
      const messagesKey = `messages_${conversationId}`;
      const messagesJson = localStorage.getItem(messagesKey);
      
      if (messagesJson) {
        try {
          const messages = JSON.parse(messagesJson);
          console.log(`Found ${messages.length} messages in localStorage for conversation ${conversationId}`);
          return messages;
        } catch (e) {
          console.error('Error parsing messages from localStorage:', e);
        }
      }
      
      console.log('No messages found in localStorage');
      return [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  },

  // Get a conversation by ID
  async getConversationById(conversationId: string): Promise<Conversation | null> {
    try {
      console.log(`getConversationById: Fetching conversation ${conversationId}`);
      
      // Always try database first, regardless of conversation ID format
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .maybeSingle();
      
      if (!error && conversation) {
        console.log(`Found conversation in database: ${conversationId}`);
        return conversation;
      }
      
      // If it's a localStorage-only conversation (public_ or temp_ prefix)
      if (conversationId.startsWith('public_') || conversationId.startsWith('temp_')) {
        console.log(`Looking for localStorage conversation: ${conversationId}`);
        
        // Get messages to determine creation/update times
        const messagesKey = `messages_${conversationId}`;
        const messagesJson = localStorage.getItem(messagesKey);
        let messages = [];
        
        if (messagesJson) {
          try {
            messages = JSON.parse(messagesJson);
          } catch (e) {
            console.error('Error parsing messages from localStorage:', e);
          }
        }
        
        // Try to extract advisor ID from conversation ID or from localStorage keys
        let advisorId = '';
        let userId = null;
        
        // Check all localStorage keys for this conversation ID
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('public_conversation_') && localStorage.getItem(key) === conversationId) {
            // Extract from key (format: public_conversation_USER_ID_ADVISOR_ID)
            const keyParts = key.split('_');
            if (keyParts.length > 3) {
              userId = keyParts[2] !== 'anonymous' ? keyParts[2] : null;
              advisorId = keyParts[3];
              break;
            }
          }
        }
        
        if (advisorId) {
          return {
            id: conversationId,
            user_id: userId,
            tutor_id: advisorId,
            advisor_id: advisorId,
            title: 'Public Chat',
            created_at: messages.length > 0 ? messages[0].created_at : new Date().toISOString(),
            updated_at: messages.length > 0 ? messages[messages.length - 1].created_at : new Date().toISOString(),
            is_anonymous: !userId
          };
        }
      }
      
      console.log(`Conversation not found: ${conversationId}`);
      return null;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  },

  // Get conversations for an advisor
  async getAdvisorConversations(advisorId: string): Promise<any[]> {
    try {
      console.log(`Getting conversations for advisor ${advisorId}`);
      
      // Get conversations from database
      const { data: dbConversations, error } = await supabase
        .from('conversations')
        .select(`
          id,
          user_id,
          tutor_id,
          advisor_id,
          title,
          created_at,
          updated_at,
          is_anonymous
        `)
        .eq('advisor_id', advisorId)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching advisor conversations:', error);
        return [];
      }
      
      // Get conversation counts and metadata
      const enhancedConversations = await Promise.all((dbConversations || []).map(async (conv) => {
        // Get message count
        const { count: messageCount, error: countError } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id);
        
        if (countError) {
          console.error(`Error getting message count for conversation ${conv.id}:`, countError);
        }
        
        return {
          ...conv,
          message_count: messageCount || 0
        };
      }));
      
      // Also get conversations from localStorage
      const localConversations = await this.scanLocalStorageForPublicConversations(advisorId);
      
      // Combine and deduplicate (prefer database versions)
      const dbIds = new Set(enhancedConversations.map(c => c.id));
      const uniqueLocalConversations = localConversations.filter(c => !dbIds.has(c.id));
      
      return [...enhancedConversations, ...uniqueLocalConversations];
    } catch (error) {
      console.error('Error getting advisor conversations:', error);
      return [];
    }
  }
};
