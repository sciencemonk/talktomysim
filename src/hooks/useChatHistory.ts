
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
      console.log('Loading messages for conversation:', conversationId);
      
      const fetchedMessages = await conversationService.getMessages(conversationId);
      console.log('Fetched messages:', fetchedMessages);
      
      // Filter out any messages with null or undefined content
      const validMessages = fetchedMessages.filter(msg => 
        msg && 
        msg.content && 
        typeof msg.content === 'string' && 
        msg.content.trim().length > 0
      );
      
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
    loadMessages();
  }, [loadMessages]);

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
