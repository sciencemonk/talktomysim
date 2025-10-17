import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const useLivestreamChat = (simId: string, simName: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isProcessing) return;

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      // Prepare conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Call chat completion function
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: conversationHistory,
          agent: {
            name: simName,
            prompt: `You are a crypto livestream commentator named ${simName}. You're watching a pump.fun token livestream and chatting with viewers. Be energetic, entertaining, and react to the market action. Keep responses SHORT and punchy (1-2 sentences). Use crypto slang when appropriate. Be exciting and engaging!`
          },
          isDebate: false
        }
      });

      if (error) throw error;

      // Add AI response
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Oops! Lost connection for a sec. Try again!',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  }, [messages, isProcessing, simId, simName]);

  const addCommentary = useCallback((commentary: string) => {
    const msg: Message = {
      id: `commentary-${Date.now()}`,
      role: 'assistant',
      content: commentary,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, msg]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isProcessing,
    sendMessage,
    addCommentary,
    clearMessages
  };
};
