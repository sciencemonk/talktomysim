
import { useState, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  timestamp: Date;
  isComplete: boolean;
}

export const useSimpleMessageAccumulator = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserMessage, setCurrentUserMessage] = useState('');
  const [currentAiMessage, setCurrentAiMessage] = useState('');

  const addUserMessage = useCallback((content: string) => {
    console.log('Adding complete user message:', content);
    if (content.trim()) {
      const newMessage: Message = {
        id: Date.now().toString() + '_user',
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        isComplete: true
      };
      setMessages(prev => [...prev, newMessage]);
    }
  }, []);

  const addAiMessage = useCallback((content: string) => {
    console.log('Adding complete AI message:', content);
    if (content.trim()) {
      const newMessage: Message = {
        id: Date.now().toString() + '_ai',
        role: 'system',
        content: content.trim(),
        timestamp: new Date(),
        isComplete: true
      };
      setMessages(prev => [...prev, newMessage]);
    }
  }, []);

  const updateCurrentUserMessage = useCallback((fragment: string) => {
    setCurrentUserMessage(prev => prev + fragment);
  }, []);

  const updateCurrentAiMessage = useCallback((fragment: string) => {
    setCurrentAiMessage(prev => prev + fragment);
  }, []);

  const completeCurrentUserMessage = useCallback(() => {
    if (currentUserMessage.trim()) {
      addUserMessage(currentUserMessage);
      setCurrentUserMessage('');
    }
  }, [currentUserMessage, addUserMessage]);

  const completeCurrentAiMessage = useCallback(() => {
    if (currentAiMessage.trim()) {
      addAiMessage(currentAiMessage);
      setCurrentAiMessage('');
    }
  }, [currentAiMessage, addAiMessage]);

  const resetMessages = useCallback(() => {
    console.log('Resetting all messages');
    setMessages([]);
    setCurrentUserMessage('');
    setCurrentAiMessage('');
  }, []);

  // Get all messages including current partial ones
  const getAllMessages = useCallback((): Message[] => {
    const allMessages = [...messages];
    
    if (currentUserMessage.trim()) {
      allMessages.push({
        id: 'current_user',
        role: 'user',
        content: currentUserMessage,
        timestamp: new Date(),
        isComplete: false
      });
    }
    
    if (currentAiMessage.trim()) {
      allMessages.push({
        id: 'current_ai',
        role: 'system',
        content: currentAiMessage,
        timestamp: new Date(),
        isComplete: false
      });
    }
    
    return allMessages;
  }, [messages, currentUserMessage, currentAiMessage]);

  return {
    messages: getAllMessages(),
    addUserMessage,
    addAiMessage,
    updateCurrentUserMessage,
    updateCurrentAiMessage,
    completeCurrentUserMessage,
    completeCurrentAiMessage,
    resetMessages
  };
};
