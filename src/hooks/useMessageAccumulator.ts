
import { useState, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  timestamp: Date;
  isComplete: boolean;
}

export const useMessageAccumulator = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<{
    role: 'user' | 'system';
    content: string;
  } | null>(null);

  const addMessageFragment = useCallback((fragment: string, isFromUser: boolean) => {
    const role = isFromUser ? 'user' : 'system';
    
    console.log(`Adding ${role} fragment:`, fragment);
    
    if (!currentMessage || currentMessage.role !== role) {
      // Start a new message
      console.log(`Starting new ${role} message`);
      setCurrentMessage({
        role,
        content: fragment
      });
    } else {
      // Append to current message
      console.log(`Appending to current ${role} message`);
      setCurrentMessage(prev => prev ? {
        ...prev,
        content: prev.content + fragment
      } : null);
    }
  }, [currentMessage]);

  const completeCurrentMessage = useCallback(() => {
    if (currentMessage && currentMessage.content.trim()) {
      console.log('Completing current message:', currentMessage);
      const newMessage: Message = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        role: currentMessage.role,
        content: currentMessage.content.trim(),
        timestamp: new Date(),
        isComplete: true
      };
      
      setMessages(prev => [...prev, newMessage]);
      setCurrentMessage(null);
    }
  }, [currentMessage]);

  const getCurrentMessage = useCallback((): Message | null => {
    if (!currentMessage || !currentMessage.content.trim()) return null;
    
    return {
      id: 'current',
      role: currentMessage.role,
      content: currentMessage.content,
      timestamp: new Date(),
      isComplete: false
    };
  }, [currentMessage]);

  const getAllMessages = useCallback((): Message[] => {
    const current = getCurrentMessage();
    return current ? [...messages, current] : messages;
  }, [messages, getCurrentMessage]);

  const resetMessages = useCallback(() => {
    console.log('Resetting all messages');
    setMessages([]);
    setCurrentMessage(null);
  }, []);

  return {
    messages: getAllMessages(),
    addMessageFragment,
    completeCurrentMessage,
    resetMessages
  };
};
