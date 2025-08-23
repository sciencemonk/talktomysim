import { useState, useEffect, useCallback } from 'react';
import { AgentType } from '@/types/agent';
import { conversationService, Message } from '@/services/conversationService';

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
  const [isPublicChat, setIsPublicChat] = useState(false);
  const [welcomeMessageSent, setWelcomeMessageSent] = useState(false);

  // Load conversation and messages when agent changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!agent?.id) return;
      
      setIsLoading(true);
      setWelcomeMessageSent(false);
      console.log('Loading chat history for agent:', agent.name);

      try {
        // Always try to create a conversation (works for both authenticated and anonymous users)
        const conversation = await conversationService.getOrCreateConversation(agent.id);
        
        if (!conversation) {
          // Fallback to in-memory chat if conversation creation fails
          console.log('No conversation created - using in-memory chat');
          setIsPublicChat(true);
          setConversationId(null);
          setMessages([]);
          
          // Add welcome message for fallback case if it exists
          if (agent.welcomeMessage && agent.welcomeMessage.trim()) {
            const welcomeMessage: ChatMessage = {
              id: `welcome-${Date.now()}`,
              role: 'system',
              content: agent.welcomeMessage,
              isComplete: true
            };
            setMessages([welcomeMessage]);
            setWelcomeMessageSent(true);
          }
          
          setIsLoading(false);
          return;
        }

        // Set conversation type based on whether user_id starts with 'anonymous_'
        setIsPublicChat(conversation.user_id.startsWith('anonymous_'));
        setConversationId(conversation.id);

        // Load existing messages
        const existingMessages = await conversationService.getMessages(conversation.id);
        
        const chatMessages: ChatMessage[] = existingMessages.map((msg: Message) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          isComplete: true
        }));

        setMessages(chatMessages);
        console.log(`Loaded ${chatMessages.length} messages for ${agent.name}:`, chatMessages);

        // Add welcome message if no existing messages and welcome message exists
        if (chatMessages.length === 0 && agent.welcomeMessage && agent.welcomeMessage.trim()) {
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
        // Fallback to in-memory chat
        setIsPublicChat(true);
        setConversationId(null);
        
        // Add welcome message for fallback case if it exists
        if (agent.welcomeMessage && agent.welcomeMessage.trim()) {
          const welcomeMessage: ChatMessage = {
            id: `welcome-${Date.now()}`,
            role: 'system',
            content: agent.welcomeMessage,
            isComplete: true
          };
          setMessages([welcomeMessage]);
          setWelcomeMessageSent(true);
        } else {
          setMessages([]);
        }
      }
      
      setIsLoading(false);
    };

    // Reset messages when switching agents
    setMessages([]);
    setConversationId(null);
    setIsPublicChat(false);
    setWelcomeMessageSent(false);
    loadChatHistory();
  }, [agent?.id, agent?.welcomeMessage]);

  // Add user message
  const addUserMessage = useCallback(async (content: string) => {
    const tempMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content,
      isComplete: true
    };

    setMessages(prev => [...prev, tempMessage]);

    // Save to database if we have a conversation
    if (conversationId) {
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
    }
  }, [conversationId]);

  // Start AI message
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

  // Add text delta to AI message
  const addAiTextDelta = useCallback((messageId: string, delta: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: msg.content + delta }
          : msg
      )
    );
  }, []);

  // Complete AI message
  const completeAiMessage = useCallback(async (messageId: string) => {
    // Use a function to get the current message content
    setMessages(prev => {
      const currentMessage = prev.find(msg => msg.id === messageId);
      if (!currentMessage || !currentMessage.content.trim()) {
        console.error('No message content found for ID:', messageId);
        return prev;
      }

      console.log('Completing AI message:', currentMessage.content);

      // Save to database if we have a conversation
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
            // Still mark as complete even if save failed
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
          // Still mark as complete even if save failed
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === messageId 
                ? { ...msg, isComplete: true }
                : msg
            )
          );
        });
      }

      // Mark as complete immediately in the UI
      return prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isComplete: true }
          : msg
      );
    });
  }, [conversationId]);

  return {
    messages,
    isLoading,
    isPublicChat,
    welcomeMessageSent,
    addUserMessage,
    startAiMessage,
    addAiTextDelta,
    completeAiMessage
  };
};
