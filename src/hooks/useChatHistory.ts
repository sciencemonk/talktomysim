
import { useState, useEffect, useCallback } from 'react';
import { AgentType } from '@/types/agent';
import { conversationService, Message } from '@/services/conversationService';
import { supabase } from '@/integrations/supabase/client';

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

  // Load conversation and messages when agent changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!agent?.id) return;
      
      setIsLoading(true);
      console.log('Loading chat history for agent:', agent.name);

      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        // Create or get conversation for both authenticated and anonymous users
        const conversation = await conversationService.getOrCreateConversation(agent.id);
        if (!conversation) {
          console.error('Failed to get or create conversation');
          setIsLoading(false);
          return;
        }

        setConversationId(conversation.id);
        console.log('Conversation initialized:', conversation.id, 'User:', user ? 'authenticated' : 'anonymous');

        // Load existing messages only for authenticated users
        // Anonymous users always start fresh
        if (user) {
          const existingMessages = await conversationService.getMessages(conversation.id);
          
          const chatMessages: ChatMessage[] = existingMessages.map((msg: Message) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            isComplete: true
          }));

          setMessages(chatMessages);
          console.log(`Loaded ${chatMessages.length} messages for ${agent.name}:`, chatMessages);
        } else {
          console.log('Anonymous user - starting with empty chat');
          setMessages([]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        // Fallback to empty messages if anything fails
        setMessages([]);
        setConversationId(null);
      }
      
      setIsLoading(false);
    };

    // Reset messages when switching agents
    setMessages([]);
    setConversationId(null);
    loadChatHistory();
  }, [agent?.id]);

  // Add user message
  const addUserMessage = useCallback(async (content: string) => {
    const tempMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content,
      isComplete: true
    };

    setMessages(prev => [...prev, tempMessage]);

    // Save to database whether authenticated or anonymous
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

      // Save to database whether authenticated or anonymous
      if (conversationId) {
        // Save to database in the background
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
    addUserMessage,
    startAiMessage,
    addAiTextDelta,
    completeAiMessage
  };
};
