import { supabase } from '@/integrations/supabase/client';

export interface ConversationEmbedding {
  id: string;
  conversation_id: string;
  advisor_id: string;
  content_text: string;
  content_type: string;
  participant_type: string;
  message_count: number;
  conversation_date: string;
  metadata: any;
  created_at: string;
}

export const conversationEmbeddingService = {
  /**
   * Process a conversation for embedding after it's completed
   */
  async processConversationEmbedding(conversationId: string, advisorId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Processing conversation embedding:', { conversationId, advisorId });

      // For localStorage conversations (public_ prefix), we need to fetch and pass the messages
      let conversationMessages = null;
      if (conversationId.startsWith('public_')) {
        console.log('Fetching localStorage messages for conversation:', conversationId);
        
        // Get messages from localStorage
        const messagesKey = `messages_${conversationId}`;
        const messagesJson = localStorage.getItem(messagesKey);
        
        if (messagesJson) {
          try {
            const messages = JSON.parse(messagesJson);
            conversationMessages = messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
              created_at: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString()
            }));
            console.log(`Found ${conversationMessages.length} localStorage messages`);
          } catch (parseError) {
            console.error('Error parsing localStorage messages:', parseError);
            return { success: false, error: 'Failed to parse localStorage messages' };
          }
        } else {
          console.log('No localStorage messages found for conversation:', conversationId);
          return { success: false, error: 'No messages found in localStorage' };
        }
      }

      const { data, error } = await supabase.functions.invoke('process-conversation-embedding', {
        body: {
          conversationId,
          advisorId,
          forceReprocess: false,
          messages: conversationMessages // Pass messages for localStorage conversations
        }
      });

      if (error) {
        console.error('Error processing conversation embedding:', error);
        return { success: false, error: error.message };
      }

      console.log('Conversation embedding processed successfully:', data);
      return { success: true };
    } catch (error: any) {
      console.error('Error in processConversationEmbedding:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Search through conversation embeddings
   */
  async searchConversations(
    advisorId: string, 
    query: string, 
    options: {
      similarityThreshold?: number;
      maxResults?: number;
      contentTypes?: string[];
      daysBack?: number;
    } = {}
  ): Promise<ConversationEmbedding[]> {
    try {
      const {
        similarityThreshold = 0.6,
        maxResults = 10,
        contentTypes = ['full'],
        daysBack = 30
      } = options;

      // Generate embedding for the search query
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('generate-embedding', {
        body: { text: query }
      });

      if (embeddingError || !embeddingData?.embedding) {
        console.error('Error generating embedding for search:', embeddingError);
        return [];
      }

      // Calculate date from
      const dateFrom = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

      // Search for relevant conversations
      const { data, error } = await supabase.rpc('search_conversation_embeddings', {
        query_embedding: embeddingData.embedding,
        target_advisor_id: advisorId,
        similarity_threshold: similarityThreshold,
        match_count: maxResults,
        content_types: contentTypes,
        date_from: dateFrom
      });

      if (error) {
        console.error('Error searching conversation embeddings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchConversations:', error);
      return [];
    }
  },

  /**
   * Get conversation insights and analytics
   */
  async getConversationInsights(advisorId: string, daysBack: number = 30): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('get_conversation_insights', {
        target_advisor_id: advisorId,
        days_back: daysBack
      });

      if (error) {
        console.error('Error getting conversation insights:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in getConversationInsights:', error);
      return null;
    }
  },

  /**
   * Check if a conversation has been processed for embedding
   */
  async isConversationProcessed(conversationId: string, advisorId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('conversation_embeddings')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('advisor_id', advisorId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking if conversation is processed:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isConversationProcessed:', error);
      return false;
    }
  },

  /**
   * Process multiple conversations in batch (useful for initial setup)
   */
  async batchProcessConversations(
    advisorId: string, 
    conversationIds: string[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<{ successful: number; failed: number; errors: string[] }> {
    const results = { successful: 0, failed: 0, errors: [] as string[] };

    for (let i = 0; i < conversationIds.length; i++) {
      const conversationId = conversationIds[i];
      
      try {
        // Check if already processed
        const isProcessed = await this.isConversationProcessed(conversationId, advisorId);
        if (isProcessed) {
          console.log(`Conversation ${conversationId} already processed, skipping`);
          results.successful++;
          onProgress?.(i + 1, conversationIds.length);
          continue;
        }

        const result = await this.processConversationEmbedding(conversationId, advisorId);
        
        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push(`${conversationId}: ${result.error}`);
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${conversationId}: ${error.message}`);
      }

      onProgress?.(i + 1, conversationIds.length);

      // Add small delay to avoid overwhelming the API
      if (i < conversationIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return results;
  },

  /**
   * Auto-process conversations that have ended and haven't been processed yet
   */
  async autoProcessRecentConversations(advisorId: string, daysBack: number = 7): Promise<void> {
    try {
      console.log(`Auto-processing recent conversations for advisor ${advisorId}`);

      // Get recent conversations from the database
      const dateFrom = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, updated_at')
        .or(`tutor_id.eq.${advisorId},advisor_id.eq.${advisorId}`)
        .gte('updated_at', dateFrom)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching recent conversations:', error);
        return;
      }

      if (!conversations || conversations.length === 0) {
        console.log('No recent conversations found for processing');
        return;
      }

      console.log(`Found ${conversations.length} recent conversations to check for processing`);

      // Filter out conversations that have already been processed
      const unprocessedConversations = [];
      for (const conv of conversations) {
        const isProcessed = await this.isConversationProcessed(conv.id, advisorId);
        if (!isProcessed) {
          unprocessedConversations.push(conv.id);
        }
      }

      console.log(`${unprocessedConversations.length} conversations need processing`);

      if (unprocessedConversations.length > 0) {
        const results = await this.batchProcessConversations(
          advisorId, 
          unprocessedConversations,
          (processed, total) => {
            console.log(`Processing conversations: ${processed}/${total}`);
          }
        );

        console.log(`Auto-processing completed: ${results.successful} successful, ${results.failed} failed`);
        if (results.errors.length > 0) {
          console.error('Processing errors:', results.errors);
        }
      }
    } catch (error) {
      console.error('Error in autoProcessRecentConversations:', error);
    }
  }
};
