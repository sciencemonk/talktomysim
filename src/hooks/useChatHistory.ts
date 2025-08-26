
import { useState, useEffect, useCallback } from 'react';
import { conversationService, Message } from '@/services/conversationService';

export const useChatHistory = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Use a retry mechanism to ensure we get the messages
      let attempts = 0;
      const maxAttempts = 3;
      let fetchedMessages: Message[] = [];
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`Loading messages for conversation ${conversationId} (attempt ${attempts}/${maxAttempts})`);
        
        fetchedMessages = await conversationService.getMessages(conversationId);
        
        if (fetchedMessages.length > 0) {
          console.log(`Found ${fetchedMessages.length} messages on attempt ${attempts}`);
          break;
        }
        
        // Wait a bit before retrying
        if (attempts < maxAttempts) {
          console.log(`No messages found, waiting before retry ${attempts}/${maxAttempts}`);
          await new Promise(resolve => setTimeout(resolve, 500 * attempts));
        }
      }
      
      // Filter out any messages with null or undefined content
      const validMessages = fetchedMessages.filter(msg => 
        msg && 
        msg.content && 
        typeof msg.content === 'string' && 
        msg.content.trim().length > 0
      );
      
      console.log(`Final result: ${validMessages.length} valid messages for conversation ${conversationId}`);
      setMessages(validMessages);
    } catch (err: any) {
      console.error('Error loading chat history:', err);
      setError(err.message || 'Failed to load chat history');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      console.log(`useChatHistory: Loading messages for conversation ${conversationId}`);
      // Clear messages first to avoid showing stale data
      setMessages([]);
      // Load new messages
      loadMessages();
    } else {
      console.log('useChatHistory: No conversation ID provided, skipping message load');
      setMessages([]);
    }
  }, [conversationId, loadMessages]);

  const addMessage = useCallback((message: Message) => {
    // Validate message before adding
    if (message && message.content && typeof message.content === 'string') {
      setMessages(prev => [...prev, message]);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    loadMessages,
    addMessage,
    clearMessages
  };
};
