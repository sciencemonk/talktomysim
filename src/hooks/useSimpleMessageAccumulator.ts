
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
      setMessages(prev => {
        const updated = [...prev, newMessage];
        console.log('Updated messages after adding user message:', updated.length);
        return updated;
      });
    }
  }, []);

  const startAiMessage = useCallback(() => {
    console.log('Starting AI message stream');
    setCurrentAiMessage('');
    setIsAiSpeaking(true);
  }, []);

  const addAiTextDelta = useCallback((delta: string) => {
    console.log('Adding AI text delta:', delta);
    setCurrentAiMessage(prev => {
      const newContent = prev + delta;
      console.log('Updated currentAiMessage to:', newContent.length, 'characters');
      return newContent;
    });
  }, []);

  const completeAiMessage = useCallback(() => {
    console.log('Completing AI message. Current content length:', currentAiMessage.length);
    console.log('Current AI message content:', currentAiMessage);
    setIsAiSpeaking(false);
    
    // Use functional update to ensure we get the latest currentAiMessage value
    setCurrentAiMessage(currentContent => {
      console.log('In functional update, currentContent length:', currentContent.length);
      
      // Only complete if there's actual content
      if (currentContent.trim()) {
        const newMessage: Message = {
          id: Date.now().toString() + '_ai',
          role: 'system',
          content: currentContent.trim(),
          timestamp: new Date(),
          isComplete: true
        };
        
        console.log('Adding completed AI message to permanent messages:', newMessage.content.substring(0, 100) + '...');
        setMessages(prev => {
          const updated = [...prev, newMessage];
          console.log('Updated permanent messages array length:', updated.length);
          console.log('All permanent messages:', updated.map(m => ({ 
            role: m.role, 
            content: m.content.substring(0, 50) + '...', 
            isComplete: m.isComplete 
          })));
          return updated;
        });
        
        // Clear current message after adding to permanent messages
        return '';
      } else {
        console.log('No content to complete, currentContent was empty');
        return '';
      }
    });
  }, [currentAiMessage]);

  const resetMessages = useCallback(() => {
    console.log('Resetting all messages');
    setMessages([]);
    setCurrentAiMessage('');
    setIsAiSpeaking(false);
  }, []);

  // Get all messages including current partial ones
  const getAllMessages = useCallback((): Message[] => {
    // ALWAYS start with all permanent completed messages
    const allMessages = [...messages];
    
    // Add current AI message ONLY if it has content and we're actively streaming
    if (currentAiMessage.trim() && isAiSpeaking) {
      allMessages.push({
        id: 'current_ai',
        role: 'system',
        content: currentAiMessage,
        timestamp: new Date(),
        isComplete: false
      });
      console.log('Added current streaming message to display list, content length:', currentAiMessage.length);
    }
    
    console.log('getAllMessages returning:', allMessages.length, 'total messages');
    console.log('Permanent completed messages:', messages.length);
    console.log('Current streaming AI message length:', currentAiMessage.length);
    console.log('Is AI currently speaking:', isAiSpeaking);
    
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
