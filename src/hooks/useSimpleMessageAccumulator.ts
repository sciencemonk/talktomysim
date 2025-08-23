
import { useState, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  isComplete: boolean;
}

export const useSimpleMessageAccumulator = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAiMessage, setCurrentAiMessage] = useState<Message | null>(null);

  const addUserMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      isComplete: true
    };
    
    setMessages(prev => [...prev, userMessage]);
  }, []);

  const startAiMessage = useCallback(() => {
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      role: 'system',
      content: '',
      isComplete: false
    };
    
    setCurrentAiMessage(aiMessage);
    setMessages(prev => [...prev, aiMessage]);
    
    // Return the message ID
    return aiMessage.id;
  }, []);

  const addAiTextDelta = useCallback((delta: string) => {
    if (!currentAiMessage) return;
    
    setMessages(prev => 
      prev.map(msg => 
        msg.id === currentAiMessage.id 
          ? { ...msg, content: msg.content + delta }
          : msg
      )
    );
    
    setCurrentAiMessage(prev => 
      prev ? { ...prev, content: prev.content + delta } : null
    );
  }, [currentAiMessage]);

  const completeAiMessage = useCallback(() => {
    if (!currentAiMessage) return;
    
    setMessages(prev => 
      prev.map(msg => 
        msg.id === currentAiMessage.id 
          ? { ...msg, isComplete: true }
          : msg
      )
    );
    
    setCurrentAiMessage(null);
  }, [currentAiMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentAiMessage(null);
  }, []);

  return {
    messages,
    addUserMessage,
    startAiMessage,
    addAiTextDelta,
    completeAiMessage,
    clearMessages
  };
};
