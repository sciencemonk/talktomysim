
import { useState, useEffect, useCallback, useRef } from 'react';
import { AgentType } from '@/types/agent';
import { conversationService, Message } from '@/services/conversationService';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'system';
  content: string;
  isComplete: boolean;
  image?: string; // For generated images
}

export const useChatHistory = (agent: AgentType, forceNew: boolean = false, conversationId?: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationId || null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingConversationId, setPendingConversationId] = useState<string | null>(null);
  
  // Track accumulated content for AI messages to avoid state timing issues
  const aiMessageContentRef = useRef<Map<string, string>>(new Map());

  // Load conversation and messages when agent changes or forceNew changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!agent?.id) return;
      
      setIsLoading(true);
      console.log('🔄 Loading chat history for agent:', agent.name, 'forceNew:', forceNew, 'conversationId:', conversationId);

      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        // If we have a specific conversation ID to load (and not forcing new), fetch it directly
        if (conversationId && !forceNew) {
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
        const conversation = await conversationService.getOrCreateConversation(agent.id);
        if (!conversation) {
          console.error('Failed to get or create conversation');
          setIsLoading(false);
          return;
        }

        console.log('Conversation initialized:', conversation.id, 'User:', user ? 'authenticated' : 'anonymous');

        // If forceNew, CLEAR messages and add only welcome message
        if (forceNew) {
          console.log('🆕 FORCE NEW - Clearing all messages and starting fresh');
          const welcomeMessage = agent.welcome_message || `Hi! I'm ${agent.name}. How can I help you today?`;
          const chatMessages: ChatMessage[] = [{
            id: crypto.randomUUID(),
            role: 'system',
            content: welcomeMessage,
            isComplete: true
          }];
          setActiveConversationId(conversation.id);
          setMessages(chatMessages); // This replaces ALL messages with just the welcome
          setIsLoading(false);
          return;
        }

        // Load existing messages only for authenticated users
        if (user) {
          const existingMessages = await conversationService.getMessages(conversation.id);
          
          // If this is a new conversation with no messages, add the welcome message
          if (existingMessages.length === 0) {
            const welcomeMessage = agent.welcome_message || `Hi! I'm ${agent.name}. How can I help you today?`;
            const savedWelcome = await conversationService.addMessage(conversation.id, 'system', welcomeMessage);
            
            if (savedWelcome) {
              const chatMessages: ChatMessage[] = [{
                id: savedWelcome.id,
                role: savedWelcome.role,
                content: savedWelcome.content,
                isComplete: true
              }];
              setActiveConversationId(conversation.id);
              setMessages(chatMessages);
              console.log('Welcome message added to new conversation');
            }
          } else {
            const chatMessages: ChatMessage[] = existingMessages.map((msg: Message) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              isComplete: true
            }));

            setActiveConversationId(conversation.id);
            setMessages(chatMessages);
            console.log(`Loaded ${chatMessages.length} messages for ${agent.name}:`, chatMessages);
          }
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
      console.log('Creating new conversation');
      const conversation = await conversationService.getOrCreateConversation(agent.id);
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
    
    // Return the conversation ID for use in the calling function
    return currentConversationId;
  }, [activeConversationId, agent?.id]);

  // Start AI message
  const startAiMessage = useCallback(() => {
    const aiMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: 'system',
      content: '',
      isComplete: false
    };

    // Initialize content tracking for this message
    aiMessageContentRef.current.set(aiMessage.id, '');
    
    setMessages(prev => [...prev, aiMessage]);
    return aiMessage.id;
  }, []);

  // Add text delta to AI message
  const addAiTextDelta = useCallback((messageId: string, delta: string) => {
    // Update the ref with accumulated content
    const currentContent = aiMessageContentRef.current.get(messageId) || '';
    const newContent = currentContent + delta;
    aiMessageContentRef.current.set(messageId, newContent);
    
    // Check if there's a generated image
    const generatedImage = (window as any).__lastGeneratedImage;
    
    // Update state for display
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, ...(generatedImage ? { image: generatedImage } : {}) }
          : msg
      )
    );
    
    // Clear the global image after attaching it
    if (generatedImage) {
      delete (window as any).__lastGeneratedImage;
    }
  }, []);

  // Complete AI message
  const completeAiMessage = useCallback(async (messageId: string, conversationIdOverride?: string | null) => {
    // Use the override conversation ID if provided, otherwise use activeConversationId
    const conversationId = conversationIdOverride || activeConversationId;
    
    // Get the accumulated content from the ref
    const messageContent = aiMessageContentRef.current.get(messageId) || '';

    // If no content found, exit early
    if (!messageContent.trim()) {
      console.error('No message content found for ID:', messageId);
      // Clean up the ref
      aiMessageContentRef.current.delete(messageId);
      return;
    }

    console.log('Completing AI message:', messageContent.substring(0, 100) + '...');

    // Save to database whether authenticated or anonymous
    if (conversationId) {
      try {
        const savedMessage = await conversationService.addMessage(
          conversationId,
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
      console.warn('No conversationId when completing AI message');
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, isComplete: true }
            : msg
        )
      );
    }
    
    // Clean up the ref after saving
    aiMessageContentRef.current.delete(messageId);
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
