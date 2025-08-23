
import { useState, useEffect, useRef, useCallback } from 'react';
import { AgentType } from '@/types/agent';
import { supabase } from '@/integrations/supabase/client';

interface UseEnhancedTextChatProps {
  agent: AgentType;
  onUserMessage: (message: string) => void;
  onAiMessageStart: () => string;
  onAiTextDelta: (messageId: string, delta: string) => void;
  onAiMessageComplete: (messageId: string) => void;
}

export const useEnhancedTextChat = ({
  agent,
  onUserMessage,
  onAiMessageStart,
  onAiTextDelta,
  onAiMessageComplete
}: UseEnhancedTextChatProps) => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const [lastSearchMetrics, setLastSearchMetrics] = useState<any>(null);
  const [lastSources, setLastSources] = useState<any[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Simulate connection for text chat (no actual persistent connection needed)
    setConnectionStatus('connected');
  }, [agent]);

  const sendMessage = useCallback(async (message: string, searchFilters?: any) => {
    if (!message.trim() || isProcessing) return;

    console.log('Sending enhanced message to', agent.name, ':', message);
    
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
      
      // Use enhanced chat completion with search filters
      const requestBody = {
        messages: newHistory,
        advisorId: agent.id,
        searchFilters: {
          minSimilarity: 0.7,
          maxResults: 5,
          ...searchFilters
        }
      };

      const { data, error } = await supabase.functions.invoke('enhanced-chat-completion', {
        body: requestBody
      });

      console.log('Enhanced response data:', data);
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.content) {
        console.log('Adding enhanced AI response to message ID:', aiMessageId);
        console.log('Context was used:', data.contextUsed);
        console.log('Sources found:', data.sources?.length || 0);
        console.log('Search metrics:', data.searchMetrics);
        
        // Store search metrics and sources for potential display
        setLastSearchMetrics(data.searchMetrics);
        setLastSources(data.sources || []);
        
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
      
      console.error('Error sending enhanced message:', error);
      onAiTextDelta(aiMessageId, 'Sorry, I encountered an error. Please try again.');
      onAiMessageComplete(aiMessageId);
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [agent, isProcessing, conversationHistory, onUserMessage, onAiMessageStart, onAiTextDelta, onAiMessageComplete]);

  const sendMessageWithFilters = useCallback((message: string, filters: any) => {
    return sendMessage(message, filters);
  }, [sendMessage]);

  return {
    sendMessage,
    sendMessageWithFilters,
    connectionStatus,
    isProcessing,
    lastSearchMetrics,
    lastSources
  };
};
