
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

  // Load conversation and messages when agent changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!agent?.id) return;
      
      setIsLoading(true);
      console.log('Loading chat history for agent:', agent.name);

      try {
        // Get or create conversation
        const conversation = await conversationService.getOrCreateConversation(agent.id);
        if (!conversation) {
          console.error('Failed to get or create conversation');
          setIsLoading(false);
          return;
        }

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
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
      
      setIsLoading(false);
    };

    loadChatHistory();
  }, [agent?.id]);

  // Add user message
  const addUserMessage = useCallback(async (content: string) => {
    if (!conversationId) return;

    const tempMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content,
      isComplete: true
    };

    setMessages(prev => [...prev, tempMessage]);

    // Save to database
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
    if (!conversationId) return;

    // Find the current message content
    const currentMessages = messages;
    const currentMessage = currentMessages.find(msg => msg.id === messageId);
    if (!currentMessage || !currentMessage.content.trim()) {
      console.error('No message content found for ID:', messageId);
      return;
    }

    console.log('Completing AI message:', currentMessage.content);

    // Mark as complete first
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isComplete: true }
          : msg
      )
    );

    // Save to database
    const savedMessage = await conversationService.addMessage(
      conversationId, 
      'system', 
      currentMessage.content
    );
    
    if (savedMessage) {
      console.log('AI message saved to database:', savedMessage);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, id: savedMessage.id }
            : msg
        )
      );
    } else {
      console.error('Failed to save AI message to database');
    }
  }, [conversationId, messages]);

  return {
    messages,
    isLoading,
    addUserMessage,
    startAiMessage,
    addAiTextDelta,
    completeAiMessage
  };
};
