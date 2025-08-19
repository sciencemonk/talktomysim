
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
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

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

  const startAiMessage = useCallback(() => {
    console.log('Starting AI message stream');
    setCurrentAiMessage('');
    setIsAiSpeaking(true);
  }, []);

  const addAiTextDelta = useCallback((delta: string) => {
    console.log('Adding AI text delta:', delta);
    setCurrentAiMessage(prev => prev + delta);
  }, []);

  const completeAiMessage = useCallback(() => {
    console.log('Completing AI message:', currentAiMessage);
    if (currentAiMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString() + '_ai',
        role: 'system',
        content: currentAiMessage.trim(),
        timestamp: new Date(),
        isComplete: true
      };
      setMessages(prev => [...prev, newMessage]);
    }
    setCurrentAiMessage('');
    setIsAiSpeaking(false);
  }, [currentAiMessage]);

  const resetMessages = useCallback(() => {
    console.log('Resetting all messages');
    setMessages([]);
    setCurrentUserMessage('');
    setCurrentAiMessage('');
    setIsAiSpeaking(false);
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
    
    if (currentAiMessage.trim() && isAiSpeaking) {
      allMessages.push({
        id: 'current_ai',
        role: 'system',
        content: currentAiMessage,
        timestamp: new Date(),
        isComplete: false
      });
    }
    
    return allMessages;
  }, [messages, currentUserMessage, currentAiMessage, isAiSpeaking]);

  return {
    messages: getAllMessages(),
    addUserMessage,
    startAiMessage,
    addAiTextDelta,
    completeAiMessage,
    resetMessages
  };
};
