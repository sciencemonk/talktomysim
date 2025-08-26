import { supabase } from '@/integrations/supabase/client';

export interface Conversation {
  id: string;
  user_id: string;
  tutor_id?: string;
  advisor_id?: string;
  title?: string;
  created_at: string;
  updated_at: string;
  is_anonymous?: boolean;
  message_count?: number;
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
    console.log(`Scanning localStorage for public conversations with advisor ${advisorId}`);
    const publicConversations = [];
    
    // Iterate through localStorage to find public conversation IDs
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('public_conversation_') && key.includes(advisorId)) {
        const conversationId = localStorage.getItem(key);
        if (conversationId && conversationId.startsWith('public_')) {
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
            user_id: userId,
            tutor_id: advisorId,
            advisor_id: advisorId,
            title: 'Public Chat',
            is_anonymous: userId === 'anonymous',
            created_at: messages.length > 0 ? messages[0].created_at : new Date().toISOString(),
            updated_at: messages.length > 0 ? messages[messages.length - 1].created_at : new Date().toISOString(),
            message_count: messages.length,
            latest_message: messages.length > 0 ? messages[messages.length - 1].content : null
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
      
      // Use memory approach for caching but still save to database
      const publicCacheKey = `public_conversation_${user?.id || 'anonymous'}_${advisorId}`;
      const publicConversationId = localStorage.getItem(publicCacheKey);
      
      // If we have a cached ID, try to use it
      if (publicConversationId) {
        console.log(`Checking cached public conversation ID: ${publicConversationId}`);
        
        // If it's a UUID (database conversation), try to fetch from database
        if (!publicConversationId.startsWith('public_')) {
          try {
            const { data: existingConversation, error } = await supabase
              .from('conversations')
              .select('*')
              .eq('id', publicConversationId)
              .maybeSingle();
            
            if (existingConversation && !error) {
              console.log(`Found existing database conversation: ${publicConversationId}`);
              return existingConversation;
            }
          } catch (dbError) {
            console.log(`Database lookup failed:`, dbError);
          }
        } else {
          // It's a localStorage-only conversation (public_ prefix)
          console.log(`Using cached localStorage conversation: ${publicConversationId}`);
          return {
            id: publicConversationId,
            user_id: user?.id || null,
            tutor_id: advisorId,
            advisor_id: advisorId,
            title: 'Public Chat',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        
        console.log(`Cached conversation not found or invalid, creating new one`);
        // Clear the invalid cache
        localStorage.removeItem(publicCacheKey);
      }
      
      // Create UUIDs for database but keep public display ID for localStorage
      const databaseId = crypto.randomUUID();
      const publicDisplayId = `public_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      const conversationData = {
        id: databaseId,
        user_id: user?.id || null,
        tutor_id: advisorId,
        advisor_id: advisorId,
        title: 'Public Chat'
      };
      
      // Try to save to database with UUID
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating public conversation in database:', createError);
        console.log('Falling back to localStorage-only conversation');
        
        // Fall back to localStorage-only conversation with public ID
        const fallbackConversation = {
          id: publicDisplayId,
          user_id: user?.id || null,
          tutor_id: advisorId,
          advisor_id: advisorId,
          title: 'Public Chat',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Cache the fallback conversation ID
        localStorage.setItem(publicCacheKey, publicDisplayId);
        console.log(`Created fallback localStorage conversation: ${publicDisplayId}`);
        
        return fallbackConversation;
      }
      
      // Success - cache the database UUID (not the public display ID)
      localStorage.setItem(publicCacheKey, databaseId);
      console.log(`Created new public conversation in database: ${databaseId}`);
      
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  },

  // Explicit owner conversation getter to guarantee a single persistent thread
  async getOrCreateOwnerConversation(advisorId: string): Promise<Conversation | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Use a consistent key format for localStorage
      const cacheKey = `owner_conversation_${user.id}_${advisorId}`;
      
      // MEMORY-ONLY APPROACH:
      // Generate a consistent ID based on user and advisor IDs
      // This avoids database issues while maintaining persistence through localStorage
      console.log('Using memory-only approach for owner conversation');
      
      // Get or create a stable ID
      let conversationId = localStorage.getItem(cacheKey);
      if (!conversationId) {
        // Create a deterministic ID by combining user and advisor IDs
        // This ensures we get the same ID for the same user-advisor pair
        conversationId = `memory_${user.id.substring(0, 8)}_${advisorId.substring(0, 8)}_${Date.now()}`;
        localStorage.setItem(cacheKey, conversationId);
        console.log(`Created new memory conversation ID: ${conversationId}`);
      } else {
        console.log(`Using existing memory conversation ID: ${conversationId}`);
      }
      
      // Return a memory-only conversation object
      return {
        id: conversationId,
        user_id: user.id,
        tutor_id: advisorId,
        advisor_id: advisorId,
        title: 'Owner Chat',
        is_anonymous: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (e) {
      console.error('Error in getOrCreateOwnerConversation:', e);
      return null;
    }
  },

  // Get messages for a conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      if (!conversationId) {
        console.log('getMessages: No conversation ID provided');
        return [];
      }
      
      console.log(`getMessages: Fetching messages for conversation: ${conversationId}`);
      
      // Check if this is a memory-only conversation (memory_ or public_)
      if (conversationId.startsWith('memory_') || conversationId.startsWith('public_')) {
        console.log('This is a memory conversation, retrieving from localStorage');
        const messagesJson = localStorage.getItem(`messages_${conversationId}`);
        if (messagesJson) {
          try {
            const messages = JSON.parse(messagesJson);
            console.log(`Retrieved ${messages.length} messages from localStorage`);
            return messages;
          } catch (e) {
            console.error('Error parsing messages from localStorage:', e);
            return [];
          }
        }
        console.log('No messages found in localStorage');
        return [];
      }
      
      // Try regular database lookup first
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
  
        if (error) {
          throw error;
        }
        
        console.log(`getMessages: Found ${data?.length || 0} messages for conversation ${conversationId}`);
        
        // Check if we also have fallback messages
        const fallbackKey = `fallback_messages_${conversationId}`;
        const fallbackJson = localStorage.getItem(fallbackKey);
        let combinedMessages = [...(data || [])];
        
        if (fallbackJson) {
          try {
            const fallbackMessages = JSON.parse(fallbackJson);
            console.log(`Found ${fallbackMessages.length} fallback messages in localStorage`);
            combinedMessages = [...combinedMessages, ...fallbackMessages];
            
            // Sort by created_at
            combinedMessages.sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          } catch (e) {
            console.error('Error parsing fallback messages:', e);
          }
        }
        
        // Type cast the role field to ensure it matches our Message interface
        return combinedMessages.map(msg => ({
          ...msg,
          role: msg.role as 'user' | 'system'
        }));
      } catch (dbError) {
        console.error('Database error fetching messages:', dbError);
        
        // Try fallback messages if database fails
        const fallbackKey = `fallback_messages_${conversationId}`;
        const fallbackJson = localStorage.getItem(fallbackKey);
        
        if (fallbackJson) {
          try {
            const fallbackMessages = JSON.parse(fallbackJson);
            console.log(`Retrieved ${fallbackMessages.length} fallback messages from localStorage`);
            return fallbackMessages;
          } catch (e) {
            console.error('Error parsing fallback messages:', e);
          }
        }
        
        console.log('No messages found in database or localStorage');
        return [];
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  // Get a specific conversation by ID
  async getConversationById(conversationId: string): Promise<Conversation | null> {
    try {
      if (!conversationId) {
        console.error('getConversationById: No conversation ID provided');
        return null;
      }

      console.log(`getConversationById: Looking for conversation: ${conversationId}`);

      // First check if it's a public localStorage conversation
      if (conversationId.startsWith('public_')) {
        console.log(`Getting localStorage conversation: ${conversationId}`);
        
        // Find localStorage entry for this conversation
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('public_conversation_')) {
            const storedId = localStorage.getItem(key);
            if (storedId === conversationId) {
              // Extract advisor ID from key
              const advisorId = key.replace('public_conversation_', '');
              console.log(`Found localStorage conversation for advisor: ${advisorId}`);
              
              return {
                id: conversationId,
                user_id: '',
                advisor_id: advisorId,
                title: 'Public Chat',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_anonymous: true
              };
            }
          }
        }
        
        console.error(`Public conversation ${conversationId} not found in localStorage`);
        return null;
      }

      // Otherwise, fetch from database
      console.log(`Querying database for conversation: ${conversationId}`);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId);

      if (error) {
        console.error('Error fetching conversation from database:', {
          error,
          conversationId,
          errorCode: error.code,
          errorMessage: error.message
        });
        return null;
      }

      console.log(`Database query result:`, {
        conversationId,
        found: data?.length || 0,
        data: data?.[0] || null
      });

      // Check if conversation exists
      if (!data || data.length === 0) {
        console.warn(`Conversation ${conversationId} not found in database. This might be a stale reference from embeddings.`);
        return null;
      }

      return data[0];
    } catch (error) {
      console.error('Error getting conversation by ID:', {
        error,
        conversationId,
        stack: error.stack
      });
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
      
      // Check if this is a memory-only conversation (memory_ or public_)
      if (conversationId.startsWith('memory_') || conversationId.startsWith('public_')) {
        console.log('This is a memory conversation, storing in localStorage');
        
        // Get existing messages or initialize empty array
        const messagesJson = localStorage.getItem(`messages_${conversationId}`);
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
          created_at: new Date().toISOString()
        };
        
        // Add new message and save back to localStorage
        messages.push(newMessage);
        localStorage.setItem(`messages_${conversationId}`, JSON.stringify(messages));
        
        console.log(`Added message to localStorage, now ${messages.length} messages`);
        return newMessage;
      }
      
      // Try database insert first
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
  
        if (error) {
          throw error;
        }
        
        console.log(`addMessage: Successfully added message ${data.id} to conversation ${conversationId}`);
        
        // Type cast the role field to ensure it matches our Message interface
        return {
          ...data,
          role: data.role as 'user' | 'system'
        };
      } catch (dbError) {
        console.error('Database error adding message:', dbError);
        
        // Fallback to localStorage if database fails
        console.log('Falling back to localStorage for message storage');
        
        // Create a new message
        const fallbackMessage = {
          id: `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
          conversation_id: conversationId,
          role,
          content,
          created_at: new Date().toISOString()
        };
        
        // Get existing messages or initialize empty array
        const messagesKey = `fallback_messages_${conversationId}`;
        const messagesJson = localStorage.getItem(messagesKey);
        let messages = [];
        
        if (messagesJson) {
          try {
            messages = JSON.parse(messagesJson);
          } catch (e) {
            console.error('Error parsing fallback messages from localStorage:', e);
          }
        }
        
        // Add new message and save back to localStorage
        messages.push(fallbackMessage);
        localStorage.setItem(messagesKey, JSON.stringify(messages));
        
        console.log(`Added fallback message to localStorage, now ${messages.length} messages`);
        return fallbackMessage;
      }
    } catch (error) {
      console.error('Error adding message:', error);
      
      // Last resort - create an in-memory message that won't be persisted
      console.log('Creating non-persisted message as last resort');
      return {
        id: `error_${Date.now()}`,
        conversation_id: conversationId,
        role,
        content,
        created_at: new Date().toISOString()
      };
    }
  },

  // Get conversations for an advisor. By default includes ALL conversations.
  // Pass { excludeOwner: true } to hide the owner's own conversations with their Sim.
  async getAdvisorConversations(advisorId: string, options?: { excludeOwner?: boolean }): Promise<any[]> {
    try {
      console.log('Fetching ALL conversations for advisor:', advisorId);
      const { data: authUserResult } = await supabase.auth.getUser();
      const ownerUserId = authUserResult?.user?.id || null;
      console.log('Current user ID:', ownerUserId);
      
      // MEMORY-BASED APPROACH: Find all localStorage keys for public conversations with this advisor
      console.log('Looking for memory-based public conversations in localStorage');
      const publicConversations = [];
      
      // Iterate through localStorage to find public conversation IDs
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('public_conversation_') && key.includes(advisorId)) {
          const conversationId = localStorage.getItem(key);
          if (conversationId && conversationId.startsWith('public_')) {
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
            
            // Skip if this is the owner's conversation and we're excluding owner
            if (options?.excludeOwner && userId === ownerUserId) {
              console.log(`Skipping owner conversation: ${conversationId}`);
              continue;
            }
            
            // Create a conversation object
            publicConversations.push({
              id: conversationId,
              user_id: userId,
              tutor_id: advisorId,
              advisor_id: advisorId,
              title: 'Public Chat',
              is_anonymous: userId === 'anonymous',
              created_at: messages.length > 0 ? messages[0].created_at : new Date().toISOString(),
              updated_at: messages.length > 0 ? messages[messages.length - 1].created_at : new Date().toISOString(),
              message_count: messages.length,
              latest_message: messages.length > 0 ? messages[messages.length - 1].content : null
            });
          }
        }
      }
      
      console.log(`Found ${publicConversations.length} memory-based public conversations`);
      
      // If we found memory-based conversations, return them
      if (publicConversations.length > 0) {
        return publicConversations;
      }
      
      // DIRECT DEBUGGING QUERY - get all conversations to see what's in the database
      console.log('PERFORMING DIRECT QUERY to see all conversations');
      const { data: allConvs, error: allError } = await supabase
        .from('conversations')
        .select('*')
        .limit(100);
      
      console.log(`Found ${allConvs?.length || 0} total conversations in database`);
      if (allConvs && allConvs.length > 0) {
        allConvs.forEach((c, i) => {
          console.log(`DB Conv ${i}: id=${c.id}, user_id=${c.user_id || 'null'}, tutor_id=${c.tutor_id || 'null'}, advisor_id=${c.advisor_id || 'null'}, is_anonymous=${c.is_anonymous}`);
        });
      }
      
      // Try a simpler approach - let's just get all conversations and filter in code
      console.log('DIRECT DEBUG: Getting all conversations and filtering in code');
      try {
        const { data: allConvs, error: allError } = await supabase
          .from('conversations')
          .select('*')
          .limit(100);
        
        if (allError) {
          console.error('Error fetching all conversations:', allError);
        } else {
          console.log(`Found ${allConvs?.length || 0} total conversations`);
          
          // Filter for this advisor's conversations - use string comparison for safety
          const filteredConvs = allConvs?.filter(c => {
            console.log(`Comparing: tutor_id=${c.tutor_id} vs ${advisorId}, advisor_id=${c.advisor_id} vs ${advisorId}`);
            return (
              (c.tutor_id && c.tutor_id.toString() === advisorId.toString()) || 
              (c.advisor_id && c.advisor_id.toString() === advisorId.toString())
            );
          }) || [];
          
          // Filter out owner conversations if requested
          const finalFilteredConvs = options?.excludeOwner && ownerUserId 
            ? filteredConvs.filter(c => c.user_id !== ownerUserId)
            : filteredConvs;
          
          console.log(`After filtering: ${finalFilteredConvs.length} conversations for advisor ${advisorId}`);
          
          // Log the filtered conversations
          finalFilteredConvs.forEach((c, i) => {
            console.log(`Filtered Conv ${i}: id=${c.id}, user_id=${c.user_id || 'null'}, tutor_id=${c.tutor_id || 'null'}, advisor_id=${c.advisor_id || 'null'}`);
          });
          
          // Return these conversations directly if we found any
          if (finalFilteredConvs.length > 0) {
            // Process conversations to add message counts
            const conversations = await Promise.all(finalFilteredConvs.map(async (conv) => {
              // Get messages for this conversation
              const { data: messages } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: true });
              
              return {
                ...conv,
                message_count: messages?.length || 0,
                latest_message: messages?.length > 0 ? messages[messages.length - 1].content : null,
                messages: undefined
              };
            }));
            
            console.log(`Processed ${conversations.length} conversations with message counts`);
            return conversations;
          }
        }
      } catch (err) {
        console.error('Error in direct debug query:', err);
      }
      
      // If we already found conversations with the direct approach, return them
      // Otherwise, return an empty array
      console.log('No conversations found for advisor', advisorId);
      return [];
    } catch (error) {
      console.error('Error in getAdvisorConversations:', error);
      return [];
    }
  },

  // Delete a conversation and all its messages
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      // Check if this is a localStorage-based conversation (public_ prefix)
      if (conversationId.startsWith('public_')) {
        console.log(`Deleting localStorage-based conversation: ${conversationId}`);
        
        // Find and remove the conversation reference in localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('public_conversation_')) {
            const storedId = localStorage.getItem(key);
            if (storedId === conversationId) {
              console.log(`Removing conversation reference: ${key}`);
              localStorage.removeItem(key);
            }
          }
        }
        
        // Remove the messages for this conversation
        const messagesKey = `messages_${conversationId}`;
        localStorage.removeItem(messagesKey);
        console.log(`Removed messages for conversation: ${messagesKey}`);
        
        return true;
      }
      
      // For database-stored conversations, proceed with normal deletion
      // First delete any conversation captures (if they exist)
      try {
        const { error: capturesError } = await supabase
          .from('conversation_captures')
          .delete()
          .eq('conversation_id', conversationId);
          
        if (capturesError) {
          console.warn('Error deleting conversation captures:', capturesError);
        }
      } catch (e) {
        console.warn('Failed to delete conversation captures:', e);
        // Continue with conversation deletion even if captures deletion fails
      }

      // Now delete the conversation (which will cascade delete messages)
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) {
        console.error('Error deleting conversation:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      return false;
    }
  },

  // Delete multiple conversations
  async deleteConversations(conversationIds: string[]): Promise<boolean> {
    try {
      if (!conversationIds.length) return true;
      
      // Separate localStorage-based conversations from database conversations
      const localStorageConversations = conversationIds.filter(id => id.startsWith('public_'));
      const databaseConversations = conversationIds.filter(id => !id.startsWith('public_'));
      
      console.log(`Deleting ${localStorageConversations.length} localStorage conversations and ${databaseConversations.length} database conversations`);
      
      // Handle localStorage-based conversations
      for (const conversationId of localStorageConversations) {
        // Find and remove the conversation reference in localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('public_conversation_')) {
            const storedId = localStorage.getItem(key);
            if (storedId === conversationId) {
              console.log(`Removing conversation reference: ${key}`);
              localStorage.removeItem(key);
            }
          }
        }
        
        // Remove the messages for this conversation
        const messagesKey = `messages_${conversationId}`;
        localStorage.removeItem(messagesKey);
        console.log(`Removed messages for conversation: ${messagesKey}`);
      }
      
      // If there are no database conversations, we're done
      if (databaseConversations.length === 0) {
        return true;
      }
      
      // Handle database conversations
      // First delete any conversation captures
      try {
        const { error: capturesError } = await supabase
          .from('conversation_captures')
          .delete()
          .in('conversation_id', databaseConversations);
          
        if (capturesError) {
          console.warn('Error deleting conversation captures:', capturesError);
        }
      } catch (e) {
        console.warn('Failed to delete conversation captures:', e);
      }

      // Now delete the conversations
      const { error } = await supabase
        .from('conversations')
        .delete()
        .in('id', databaseConversations);

      if (error) {
        console.error('Error deleting conversations:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete conversations:', error);
      return false;
    }
  }
};