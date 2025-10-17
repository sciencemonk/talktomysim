

import { useState, useEffect, useRef, useCallback } from 'react';
import { AgentType } from '@/types/agent';
import { supabase } from '@/integrations/supabase/client';

interface UseTextChatProps {
  agent: AgentType;
  onUserMessage: (message: string) => void;
  onAiMessageStart: () => string;
  onAiTextDelta: (messageId: string, delta: string) => void;
  onAiMessageComplete: (messageId: string) => void;
}

export const useTextChat = ({
  agent,
  onUserMessage,
  onAiMessageStart,
  onAiTextDelta,
  onAiMessageComplete
}: UseTextChatProps) => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Simulate connection for text chat (no actual persistent connection needed)
    setConnectionStatus('connected');
  }, [agent]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isProcessing) return;

    console.log('Sending message to', agent.name, ':', message);
    
    setIsProcessing(true);
    
    // Add user message immediately
    onUserMessage(message);
    
    // Update conversation history
    const newHistory = [...conversationHistory, { role: 'user', content: message }];
    setConversationHistory(newHistory);
    
    // Start AI message and get the message ID
    const aiMessageId = onAiMessageStart();
    console.log('Started AI message with ID:', aiMessageId);
    
    let hasContent = false;
    
    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Use Supabase client to call the enhanced chat edge function
      const invokePromise = supabase.functions.invoke('enhanced-chat', {
        body: {
          messages: newHistory,
          agent: {
            id: agent.id,
            name: agent.name,
            type: agent.type,
            subject: agent.subject,
            description: agent.description,
            prompt: agent.prompt,
            gradeLevel: agent.gradeLevel,
            learningObjective: agent.learningObjective
          },
          userId: user?.id
        }
      });
      
      // Add timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
      });

      const result = await Promise.race([invokePromise, timeoutPromise]);
      const { data, error } = result as any;

      console.log('Edge function response:', { data, error });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Edge function error: ${error.message || JSON.stringify(error)}`);
      }

      if (data?.content) {
        console.log('Adding AI response to message ID:', aiMessageId);
        // Add the AI response
        onAiTextDelta(aiMessageId, data.content);
        hasContent = true;
        
        // Update conversation history with AI response
        setConversationHistory(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        throw new Error('No content in response');
      }
    } catch (error: any) {
      console.error('Error in sendMessage:', error);
      
      // Always add error text to ensure there's content to save
      if (!hasContent) {
        const errorMessage = error.name === 'AbortError' 
          ? 'Request was cancelled.' 
          : 'Sorry, I encountered an error. Please try again.';
        
        console.log('Adding error message:', errorMessage);
        onAiTextDelta(aiMessageId, errorMessage);
        hasContent = true;
      }
    } finally {
      // Always complete the message, whether success or error
      try {
        console.log('Completing message:', aiMessageId, 'hasContent:', hasContent);
        await onAiMessageComplete(aiMessageId);
      } catch (completeError) {
        console.error('Error completing message:', completeError);
      }
      
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [agent, isProcessing, conversationHistory, onUserMessage, onAiMessageStart, onAiTextDelta, onAiMessageComplete]);

  return {
    sendMessage,
    connectionStatus,
    isProcessing
  };
};
