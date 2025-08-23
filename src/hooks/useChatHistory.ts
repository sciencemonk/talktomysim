
import { useState, useEffect, useCallback } from 'react';
import { AgentType } from '@/types/agent';
import { conversationService, Message } from '@/services/conversationService';
import { useEnhancedTextChat } from './useEnhancedTextChat';

interface ChatMessage {
  id: string;
  role: 'user' | 'system';
  content: string;
  isComplete: boolean;
}

export const useChatHistory = (agent: AgentType) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [welcomeMessageSent, setWelcomeMessageSent] = useState(false);
  
  const { sendMessage: sendEnhancedMessage, isLoading: isSending } = useEnhancedTextChat(agent);

  // Load conversation and messages when agent changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!agent?.id) return;
      
      setIsLoading(true);
      setWelcomeMessageSent(false);
      console.log('Loading chat history for agent:', agent.name);

      try {
        // Create anonymous conversation
        const conversation = await conversationService.getOrCreateConversation(agent.id);
        
        if (!conversation) {
          console.error('Failed to create conversation');
          setMessages([]);
          setConversationId(null);
          setIsLoading(false);
          return;
        }

        setConversationId(conversation.id);

        // Anonymous conversations are always new, so no existing messages to load
        setMessages([]);

        // Add welcome message if it exists
        if (agent.welcomeMessage && agent.welcomeMessage.trim()) {
          const welcomeMessage: ChatMessage = {
            id: `welcome-${Date.now()}`,
            role: 'system',
            content: agent.welcomeMessage,
            isComplete: true
          };
          
          setMessages([welcomeMessage]);
          setWelcomeMessageSent(true);
          
          // Save welcome message to database
          const savedWelcomeMessage = await conversationService.addMessage(
            conversation.id, 
            'system', 
            agent.welcomeMessage
          );
          
          if (savedWelcomeMessage) {
            setMessages([{
              id: savedWelcomeMessage.id,
              role: 'system',
              content: agent.welcomeMessage,
              isComplete: true
            }]);
            console.log('Welcome message saved to database');
          }
        }
        
      } catch (error) {
        console.error('Error loading chat history:', error);
        setMessages([]);
        setConversationId(null);
      }
      
      setIsLoading(false);
    };

    // Reset messages when switching agents
    setMessages([]);
    setConversationId(null);
    setWelcomeMessageSent(false);
    loadChatHistory();
  }, [agent?.id, agent?.welcomeMessage]);

  // Add user message and send to enhanced chat
  const addUserMessage = useCallback(async (content: string) => {
    if (!conversationId) {
      console.error('No conversation ID available - cannot send message');
      return;
    }

    const tempMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content,
      isComplete: true
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      // Save user message
      const savedMessage = await conversationService.addMessage(conversationId, 'user', content);
      if (savedMessage) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, id: savedMessage.id }
              : msg
          )
        );
      }

      // Send message using enhanced chat
      await sendEnhancedMessage(
        content,
        conversationId,
        () => {
          const aiMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: 'system',
            content: '',
            isComplete: false
          };
          setMessages(prev => [...prev, aiMessage]);
          return aiMessage.id;
        },
        (messageId: string, delta: string) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, content: msg.content + delta }
                : msg
            )
          );
        },
        (messageId: string) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, isComplete: true }
                : msg
            )
          );
        }
      );

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      throw error;
    }
  }, [conversationId, sendEnhancedMessage]);

  // Legacy functions for compatibility
  const startAiMessage = useCallback(() => {
    const aiMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: 'system',
      content: '',
      isComplete: false
    };
    setMessages(prev => [...prev, aiMessage]);
    return aiMessage.id;
  }, []);

  const addAiTextDelta = useCallback((messageId: string, delta: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: msg.content + delta }
          : msg
      )
    );
  }, []);

  const completeAiMessage = useCallback(async (messageId: string) => {
    setMessages(prev => {
      const currentMessage = prev.find(msg => msg.id === messageId);
      if (!currentMessage || !currentMessage.content.trim()) {
        console.error('No message content found for ID:', messageId);
        return prev;
      }

      console.log('Completing AI message:', currentMessage.content);

      // Save to database
      if (conversationId) {
        conversationService.addMessage(
          conversationId, 
          'system', 
          currentMessage.content
        ).then(savedMessage => {
          if (savedMessage) {
            console.log('AI message saved to database:', savedMessage);
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === messageId 
                  ? { ...msg, id: savedMessage.id, isComplete: true }
                  : msg
              )
            );
          } else {
            console.error('Failed to save AI message to database');
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === messageId 
                  ? { ...msg, isComplete: true }
                  : msg
              )
            );
          }
        }).catch(error => {
          console.error('Error saving AI message:', error);
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === messageId 
                ? { ...msg, isComplete: true }
                : msg
            )
          );
        });
      }

      return prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isComplete: true }
          : msg
      );
    });
  }, [conversationId]);

  return {
    messages,
    isLoading: isLoading || isSending,
    isPublicChat: true, // All chats are public/anonymous
    welcomeMessageSent,
    addUserMessage,
    startAiMessage,
    addAiTextDelta,
    completeAiMessage
  };
};
