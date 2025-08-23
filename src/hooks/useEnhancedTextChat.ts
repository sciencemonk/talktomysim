
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AgentType } from '@/types/agent';

interface ChatMessage {
  id: string;
  role: 'user' | 'system';
  content: string;
  isComplete: boolean;
}

export const useEnhancedTextChat = (agent: AgentType | null) => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (
    message: string,
    conversationId: string,
    onMessageStart: () => string,
    onMessageDelta: (messageId: string, delta: string) => void,
    onMessageComplete: (messageId: string) => void
  ) => {
    if (!agent?.id || !message.trim()) return;

    setIsLoading(true);
    
    try {
      console.log('Sending enhanced message to advisor:', agent.name);
      
      // Call the enhanced chat completion function
      const { data, error } = await supabase.functions.invoke('enhanced-chat-completion', {
        body: {
          advisorId: agent.id,
          message: message.trim(),
          conversationId: conversationId
        }
      });

      if (error) {
        console.error('Enhanced chat error:', error);
        throw new Error(error.message || 'Failed to get response');
      }

      if (!data?.message) {
        console.error('No message in enhanced chat response:', data);
        throw new Error('No content in response');
      }

      console.log('Enhanced chat response received:', {
        messageLength: data.message.length,
        escalated: data.escalated,
        analysis: data.analysis
      });

      // Start the AI message
      const messageId = onMessageStart();
      
      // Add the complete message content
      onMessageDelta(messageId, data.message);
      
      // Complete the message
      onMessageComplete(messageId);

    } catch (error) {
      console.error('Error sending enhanced message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [agent]);

  return {
    sendMessage,
    isLoading
  };
};
