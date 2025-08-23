
import { useState, useCallback } from 'react';
import { AgentType } from '@/types/agent';
import { supabase } from '@/integrations/supabase/client';

interface UseEnhancedTextChatProps {
  agent: AgentType;
  onUserMessage: (message: string) => Promise<void>;
  onAiMessageStart: () => string;
  onAiTextDelta: (delta: string) => void;
  onAiMessageComplete: (finalContent: string) => Promise<void>;
}

export const useEnhancedTextChat = ({
  agent,
  onUserMessage,
  onAiMessageStart,
  onAiTextDelta,
  onAiMessageComplete
}: UseEnhancedTextChatProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = useCallback(async (message: string) => {
    if (!agent?.id || isProcessing) return;

    try {
      setIsProcessing(true);
      
      // Add user message
      await onUserMessage(message);
      
      // Start AI message
      const aiMessageId = onAiMessageStart();
      
      // Prepare messages for the API
      const messages = [
        { role: 'user', content: message }
      ];

      console.log('Sending enhanced chat request:', { advisorId: agent.id, messages });

      // Call the enhanced chat completion function
      const { data, error } = await supabase.functions.invoke('enhanced-chat-completion', {
        body: {
          messages,
          advisorId: agent.id,
          searchFilters: {
            minSimilarity: 0.7,
            maxResults: 5
          }
        }
      });

      if (error) {
        console.error('Enhanced chat error:', error);
        throw error;
      }

      console.log('Enhanced chat response:', data);

      if (data?.content) {
        // Add the complete AI response at once
        onAiTextDelta(data.content);
        
        // Complete the AI message with the final content
        await onAiMessageComplete(data.content);
      } else {
        console.error('No content in enhanced chat response');
        throw new Error('No response content received');
      }

    } catch (error) {
      console.error('Error in enhanced text chat:', error);
      
      // Add error message
      const errorMessage = 'Sorry, I encountered an error. Please try again.';
      onAiTextDelta(errorMessage);
      await onAiMessageComplete(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [agent?.id, isProcessing, onUserMessage, onAiMessageStart, onAiTextDelta, onAiMessageComplete]);

  return {
    sendMessage,
    isProcessing
  };
};
