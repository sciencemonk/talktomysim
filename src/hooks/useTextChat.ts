
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTextChat = (
  prompt: string,
  onUserMessage: (message: string) => void,
  onAiMessageStart: () => string,
  onAiTextDelta: (messageId: string, delta: string) => void,
  onAiMessageComplete: (messageId: string) => void
) => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Simulate connection for text chat (no actual persistent connection needed)
    setConnectionStatus('connected');
  }, [prompt]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isProcessing) return;

    console.log('Sending message:', message);
    
    setIsProcessing(true);
    
    // Add user message immediately
    onUserMessage(message);
    
    // Update conversation history
    const newHistory = [...conversationHistory, { role: 'user', content: message }];
    setConversationHistory(newHistory);
    
    // Start AI message and get the message ID
    const aiMessageId = onAiMessageStart();
    console.log('Started AI message with ID:', aiMessageId);
    
    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      // Use Supabase client to call the edge function
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: newHistory,
          agent: {
            prompt: prompt
          }
        }
      });

      console.log('Response data:', data);
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.content) {
        console.log('Adding AI response to message ID:', aiMessageId);
        // Add the AI response as a single message
        onAiTextDelta(aiMessageId, data.content);
        
        // Update conversation history with AI response
        setConversationHistory(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        throw new Error('No content in response');
      }

      onAiMessageComplete(aiMessageId);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      console.error('Error sending message:', error);
      onAiTextDelta(aiMessageId, 'Sorry, I encountered an error. Please try again.');
      onAiMessageComplete(aiMessageId);
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [prompt, isProcessing, conversationHistory, onUserMessage, onAiMessageStart, onAiTextDelta, onAiMessageComplete]);

  return {
    sendMessage,
    connectionStatus,
    isProcessing
  };
};
