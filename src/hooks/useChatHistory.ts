
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

export const useChatHistory = (agent: AgentType, isCreatorChat: boolean = false, forceNew: boolean = false, conversationId?: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationId || null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingConversationId, setPendingConversationId] = useState<string | null>(null);

  // Load conversation and messages when agent changes or forceNew changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!agent?.id) return;
      
      setIsLoading(true);
      console.log('Loading chat history for agent:', agent.name, 'forceNew:', forceNew, 'conversationId:', conversationId);

      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (forceNew) {
          // Start completely fresh - clear and show empty
          setActiveConversationId(null);
          setMessages([]);
          console.log('Starting fresh conversation');
          setIsLoading(false);
          return;
        }
        
        // If we have a specific conversation ID to load, fetch it directly
        if (conversationId) {
          console.log('Loading specific conversation:', conversationId);
          const { data: conversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .single();
          
          if (conversation) {
            // Load messages for this conversation
            const existingMessages = await conversationService.getMessages(conversation.id);
            const chatMessages: ChatMessage[] = existingMessages.map((msg: Message) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              isComplete: true
            }));

            setActiveConversationId(conversation.id);
            setMessages(chatMessages);
            console.log(`Loaded ${chatMessages.length} messages for conversation ${conversationId}`);
          } else {
            console.error('Conversation not found:', conversationId);
            setMessages([]);
            setActiveConversationId(null);
          }
          setIsLoading(false);
          return;
        }
        
        // Create or get conversation for both authenticated and anonymous users
        const conversation = await conversationService.getOrCreateConversation(agent.id, isCreatorChat);
        if (!conversation) {
          console.error('Failed to get or create conversation');
          setIsLoading(false);
          return;
        }

        console.log('Conversation initialized:', conversation.id, 'User:', user ? 'authenticated' : 'anonymous');

        // Load existing messages only for authenticated users
        if (user) {
          const existingMessages = await conversationService.getMessages(conversation.id);
          
          const chatMessages: ChatMessage[] = existingMessages.map((msg: Message) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            isComplete: true
          }));

          setActiveConversationId(conversation.id);
          setMessages(chatMessages);
          console.log(`Loaded ${chatMessages.length} messages for ${agent.name}:`, chatMessages);
        } else {
          console.log('Anonymous user - starting with empty chat');
          setActiveConversationId(conversation.id);
          setMessages([]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        setMessages([]);
        setActiveConversationId(null);
      }
      
      setIsLoading(false);
    };

    loadChatHistory();
  }, [agent?.id, forceNew, conversationId]);

  // Add user message
  const addUserMessage = useCallback(async (content: string) => {
    const tempMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content,
      isComplete: true
    };

    setMessages(prev => [...prev, tempMessage]);

    // Create conversation on first message if not exists
    let currentConversationId = activeConversationId;
    if (!currentConversationId && agent?.id) {
      console.log('Creating new conversation with isCreatorChat:', isCreatorChat);
      const conversation = await conversationService.getOrCreateConversation(agent.id, isCreatorChat);
      if (conversation) {
        currentConversationId = conversation.id;
        setActiveConversationId(conversation.id);
        console.log('Conversation created:', {
          id: conversation.id,
          user_id: conversation.user_id,
          tutor_id: conversation.tutor_id,
          is_creator_conversation: (conversation as any).is_creator_conversation
        });
      }
    }

    // Save to database whether authenticated or anonymous
    if (currentConversationId) {
      const savedMessage = await conversationService.addMessage(currentConversationId, 'user', content);
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
  }, [activeConversationId, agent?.id, isCreatorChat]);

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
    // First, get the current message content from state
    let messageContent = '';
    setMessages(prev => {
      const currentMessage = prev.find(msg => msg.id === messageId);
      if (currentMessage?.content.trim()) {
        messageContent = currentMessage.content;
      }
      return prev;
    });

    // If no content found, exit early
    if (!messageContent) {
      console.error('No message content found for ID:', messageId);
      return;
    }

    console.log('Completing AI message:', messageContent.substring(0, 100) + '...');

    // Save to database whether authenticated or anonymous
    if (activeConversationId) {
      try {
        const savedMessage = await conversationService.addMessage(
          activeConversationId,
          'system',
          messageContent
        );

        if (savedMessage) {
          console.log('AI message saved to database:', savedMessage.id);
          // Update message with database ID and mark as complete
          setMessages(prev =>
            prev.map(msg =>
              msg.id === messageId
                ? { ...msg, id: savedMessage.id, isComplete: true }
                : msg
            )
          );
        } else {
          console.error('Failed to save AI message to database');
          // Still mark as complete even if save failed
          setMessages(prev =>
            prev.map(msg =>
              msg.id === messageId
                ? { ...msg, isComplete: true }
                : msg
            )
          );
        }
      } catch (error) {
        console.error('Error saving AI message:', error);
        // Still mark as complete even if save failed
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? { ...msg, isComplete: true }
              : msg
          )
        );
      }
    } else {
      // No conversation ID, just mark as complete
      console.warn('No activeConversationId when completing AI message');
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, isComplete: true }
            : msg
        )
      );
    }
  }, [activeConversationId]);

  return {
    messages,
    isLoading,
    addUserMessage,
    startAiMessage,
    addAiTextDelta,
    completeAiMessage
  };
};
