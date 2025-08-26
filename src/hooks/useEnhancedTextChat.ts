
import { useState, useCallback } from 'react';
import { AgentType } from '@/types/agent';
import { supabase } from '@/integrations/supabase/client';

interface UseEnhancedTextChatProps {
  agent: AgentType;
  onUserMessage: (message: string) => Promise<void>;
  onAiMessageStart: () => string;
  onAiTextDelta: (delta: string) => void;
  onAiMessageComplete: (finalContent: string) => Promise<void>;
  isOwner?: boolean;
  conversationId?: string;
  conversationHistory?: Array<{role: 'user' | 'system', content: string}>;
}

export const useEnhancedTextChat = ({
  agent,
  onUserMessage,
  onAiMessageStart,
  onAiTextDelta,
  onAiMessageComplete,
  isOwner = false,
  conversationId,
  conversationHistory = []
}: UseEnhancedTextChatProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = useCallback(async (message: string) => {
    if (!agent?.id || isProcessing) return;

    try {
      setIsProcessing(true);
      
      // Add user message
      await onUserMessage(message);
      
      // Start AI message
      const aiMessageId = onAiMessageStart();
      
      // Prepare messages for the API with conversation context
      // For owner sessions, we need to be more careful about preserving context
      // We'll keep more history and be less aggressive with filtering
      
      // Take more recent conversation history for owner sessions to maintain better context
      const historyLimit = isOwner ? 30 : 20;
      const recentHistory = conversationHistory.slice(-historyLimit);
      
      // For owner sessions, we need to ensure we're preserving the full conversation context
      // especially for follow-up requests like "plan a date night" after initial greeting
      let uniqueMessages;
      
      if (isOwner) {
        // For owner sessions, preserve more context with minimal filtering
        // Only filter out exact duplicate messages or generic welcome messages
        
        // First, ensure all user messages are preserved
        const userMessages = recentHistory.filter(msg => msg.role === 'user');
        
        // For system messages, only filter out exact duplicates and generic intros
        const systemMessages = recentHistory.filter(msg => msg.role === 'system');
        const filteredSystemMessages = [];
        const seenExactContents = new Set();
        
        // Only filter exact duplicates and generic welcome messages
        for (const msg of systemMessages) {
          // Check if this is a generic intro message with no specific content
          const genericIntroPatterns = [
            'Hi! I\'m your Sim and personal assistant.',
            'I can help you reflect on recent public conversations',
            'What would you like to do?'
          ];
          
          const isGenericIntro = genericIntroPatterns.some(pattern => 
            msg.content.includes(pattern)
          );
          
          // Skip only the most generic intro messages
          if (isGenericIntro && msg.content.length < 150) {
            continue;
          }
          
          // For all other messages, only filter exact duplicates
          if (!seenExactContents.has(msg.content)) {
            seenExactContents.add(msg.content);
            filteredSystemMessages.push(msg);
          }
        }
        
        // Recombine and maintain chronological order
        uniqueMessages = [...userMessages, ...filteredSystemMessages].sort((a, b) => {
          const aTime = a.timestamp || 0;
          const bTime = b.timestamp || 0;
          return aTime - bTime;
        });
        
      } else {
        // For public sessions, use the original more aggressive filtering
        // First, ensure all user messages are preserved
        const userMessages = recentHistory.filter(msg => msg.role === 'user');
        
        // Then, process only the system messages to remove duplicates
        const systemMessages = recentHistory.filter(msg => msg.role === 'system');
        
        // Only filter system messages that are welcome/intro messages or duplicates
        const filteredSystemMessages = [];
        const seenSystemContents = new Set();
        
        // Process system messages to remove duplicates and intros
        for (const msg of systemMessages) {
          // Check if this is an intro/welcome message we should filter
          const introPatterns = [
            'Hello! I\'m', 
            'I\'m a Sim of', 
            'I\'m here to help', 
            'I\'m Jesus Christ\'s Sim',
            'What can I help you with today',
            'What\'s on your heart today',
            'Peace be with you'
          ];
          
          const isIntroMessage = introPatterns.some(pattern => 
            msg.content.includes(pattern)
          );
          
          // If it's an intro message, we might want to filter it
          if (isIntroMessage) {
            // Only keep the most recent intro message if it exists
            if (systemMessages.indexOf(msg) === systemMessages.length - 1) {
              filteredSystemMessages.push(msg);
            }
            // Otherwise skip this intro message
            continue;
          }
          
          // For non-intro messages, check for duplicates
          const simplifiedContent = msg.content
            .toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .replace(/\s+/g, ' ')    // Normalize whitespace
            .trim();
          
          // Check if we've seen a similar message
          let isDuplicate = false;
          for (const seenContent of seenSystemContents) {
            // For very short messages, require exact match
            if (simplifiedContent.length < 20) {
              isDuplicate = (simplifiedContent === seenContent);
            } else {
              // For longer messages, check word similarity
              const contentWords = simplifiedContent.split(' ');
              const seenWords = seenContent.split(' ');
              const commonWords = contentWords.filter(word => seenWords.includes(word));
              
              // Higher threshold (80%) to avoid false positives
              if (commonWords.length > 0.8 * Math.min(contentWords.length, seenWords.length)) {
                isDuplicate = true;
                break;
              }
            }
          }
          
          if (!isDuplicate) {
            seenSystemContents.add(simplifiedContent);
            filteredSystemMessages.push(msg);
          }
        }
        
        // Recombine user and filtered system messages in chronological order
        uniqueMessages = [...userMessages, ...filteredSystemMessages].sort((a, b) => {
          const aTime = a.timestamp || 0;
          const bTime = b.timestamp || 0;
          return aTime - bTime;
        });
      }
      
      // Convert message format for OpenAI API (system -> assistant)
      const contextMessages = uniqueMessages.map(msg => ({
        role: msg.role === 'system' ? 'assistant' : msg.role,
        content: msg.content
      }));
      
      // The current message is already included in uniqueMessages, so we don't need to add it again
      const messages = contextMessages;

      console.log('Sending enhanced chat request:', { advisorId: agent.id, isOwner, messages });

      // Call the enhanced chat completion function
      const { data, error } = await supabase.functions.invoke('enhanced-chat-completion', {
        body: {
          messages,
          advisorId: agent.id,
          isOwner,
          conversationId,
          saveToDatabase: true,
          searchFilters: {
            minSimilarity: 0.7,
            maxResults: 5
          }
        }
      });

      if (error) {
        console.error('Enhanced chat error:', error);
        throw error;
      }

      console.log('Enhanced chat response:', data);

      if (data?.content) {
        // Add the complete AI response at once
        onAiTextDelta(data.content);
        
        // Complete the AI message with the final content
        await onAiMessageComplete(data.content);
      } else {
        console.error('No content in enhanced chat response');
        throw new Error('No response content received');
      }

    } catch (error) {
      console.error('Error in enhanced text chat:', error);
      
      // Add error message
      const errorMessage = 'Sorry, I encountered an error. Please try again.';
      onAiTextDelta(errorMessage);
      await onAiMessageComplete(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [agent?.id, isProcessing, onUserMessage, onAiMessageStart, onAiTextDelta, onAiMessageComplete, conversationId, conversationHistory]);

  return {
    sendMessage,
    isProcessing
  };
};
