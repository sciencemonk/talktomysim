

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
    
    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Use Supabase client to call the enhanced chat edge function
      const { data, error } = await supabase.functions.invoke('enhanced-chat', {
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

      console.log('Edge function response:', { data, error });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Edge function error: ${error.message || JSON.stringify(error)}`);
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
  }, [agent, isProcessing, conversationHistory, onUserMessage, onAiMessageStart, onAiTextDelta, onAiMessageComplete]);

  return {
    sendMessage,
    connectionStatus,
    isProcessing
  };
};
