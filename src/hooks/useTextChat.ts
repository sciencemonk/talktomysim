
import { useState, useEffect, useRef, useCallback } from 'react';
import { AgentType } from '@/types/agent';

interface UseTextChatProps {
  agent: AgentType;
  onUserMessage: (message: string) => void;
  onAiMessageStart: () => string;
  onAiTextDelta: (delta: string) => void;
  onAiMessageComplete: () => void;
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
    
    // Start AI message
    const aiMessageId = onAiMessageStart();
    
    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/functions/v1/chat-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          agent: {
            name: agent.name,
            type: agent.type,
            subject: agent.subject,
            description: agent.description,
            prompt: agent.prompt
          }
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onAiMessageComplete();
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                onAiTextDelta(parsed.choices[0].delta.content);
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      console.error('Error sending message:', error);
      onAiTextDelta('Sorry, I encountered an error. Please try again.');
      onAiMessageComplete();
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [agent, isProcessing, onUserMessage, onAiMessageStart, onAiTextDelta, onAiMessageComplete]);

  return {
    sendMessage,
    connectionStatus,
    isProcessing
  };
};
