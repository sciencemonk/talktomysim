
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
    console.log('Completing AI message. Current content:', currentAiMessage);
    setIsAiSpeaking(false);
    
    // Only complete if there's actual content
    if (currentAiMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString() + '_ai',
        role: 'system',
        content: currentAiMessage.trim(),
        timestamp: new Date(),
        isComplete: true
      };
      
      console.log('Adding completed AI message to permanent messages:', newMessage);
      setMessages(prev => {
        const updated = [...prev, newMessage];
        console.log('Updated messages array:', updated);
        return updated;
      });
      
      // Clear current message after adding to permanent messages
      setCurrentAiMessage('');
    } else {
      console.log('No content to complete, just clearing current message');
      setCurrentAiMessage('');
    }
  }, [currentAiMessage]);

  const resetMessages = useCallback(() => {
    console.log('Resetting all messages');
    setMessages([]);
    setCurrentAiMessage('');
    setIsAiSpeaking(false);
  }, []);

  // Get all messages including current partial ones
  const getAllMessages = useCallback((): Message[] => {
    const allMessages = [...messages];
    
    // Add current AI message if it has content and we're actively streaming
    if (currentAiMessage.trim() && isAiSpeaking) {
      allMessages.push({
        id: 'current_ai',
        role: 'system',
        content: currentAiMessage,
        timestamp: new Date(),
        isComplete: false
      });
    }
    
    console.log('getAllMessages returning:', allMessages.length, 'messages');
    console.log('Permanent messages:', messages.length);
    console.log('Current AI message length:', currentAiMessage.length);
    console.log('Is AI speaking:', isAiSpeaking);
    return allMessages;
  }, [messages, currentAiMessage, isAiSpeaking]);

  return {
    messages: getAllMessages(),
    addUserMessage,
    startAiMessage,
    addAiTextDelta,
    completeAiMessage,
    resetMessages
  };
};
