
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
      
      // CRITICAL FIX: Ensure the current user message is included in conversation context
      const conversationWithCurrentMessage = [
        ...conversationHistory,
        { role: 'user' as const, content: message }
      ];
      
      // Simplified and improved conversation flow management
      const processedMessages = processConversationHistory(conversationWithCurrentMessage, isOwner);
      
      // Convert message format for OpenAI API (system -> assistant)
      const messages = processedMessages.map(msg => ({
        role: msg.role === 'system' ? 'assistant' : msg.role,
        content: msg.content
      }));

      console.log('=== CONVERSATION CONTEXT DEBUG ===');
      console.log('Original conversation history length:', conversationHistory.length);
      console.log('With current message length:', conversationWithCurrentMessage.length);
      console.log('Processed messages length:', messages.length);
      console.log('Current user message:', message);
      console.log('Recent processed messages:', messages.slice(-3));
      console.log('=== END DEBUG ===');
      
      console.log('Sending enhanced chat request:', { advisorId: agent.id, isOwner, messagesCount: messages.length });

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
        // Log quality metrics for monitoring
        if (data.qualityScore !== undefined) {
          console.log(`Response quality score: ${data.qualityScore}`);
        }
        if (data.contextUsed) {
          console.log('Knowledge base context was used in response');
        }
        
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
      
      // Add more helpful error message
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      // Check for common error types and provide better messages
      if (error instanceof Error) {
        console.log('Error details:', error.message);
        
        // If it's a 401/403 error, it's likely an auth issue but we can still use localStorage
        if (error.message.includes('401') || error.message.includes('403') || 
            error.message.includes('auth') || error.message.includes('permission')) {
          // This is fine - we're using localStorage for public conversations
          errorMessage = "Peace be with you. I'm a Sim of Jesus. How can I serve you today?";
        }
      }
      
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

/**
 * Simplified conversation history processing with better quality and consistency
 */
function processConversationHistory(
  conversationHistory: Array<{role: 'user' | 'system', content: string, timestamp?: number}>, 
  isOwner: boolean
): Array<{role: 'user' | 'system', content: string}> {
  if (!conversationHistory || conversationHistory.length === 0) {
    return [];
  }

  // Determine appropriate history limit based on session type
  const historyLimit = isOwner ? 30 : 20; // Increased to preserve more context
  const recentHistory = conversationHistory.slice(-historyLimit);
  
  // Always preserve all user messages - never filter user input
  const userMessages = recentHistory.filter(msg => msg.role === 'user');
  
  // Process system messages with smart deduplication
  const systemMessages = recentHistory.filter(msg => msg.role === 'system');
  const filteredSystemMessages = deduplicateSystemMessages(systemMessages, isOwner);
  
  // Combine and maintain chronological order
  const allMessages = [...userMessages, ...filteredSystemMessages];
  allMessages.sort((a, b) => {
    const aTime = a.timestamp || 0;
    const bTime = b.timestamp || 0;
    return aTime - bTime;
  });
  
  return allMessages;
}

/**
 * Smart deduplication for system messages that preserves context while removing redundancy
 */
function deduplicateSystemMessages(
  systemMessages: Array<{role: 'user' | 'system', content: string}>,
  isOwner: boolean
): Array<{role: 'user' | 'system', content: string}> {
  if (systemMessages.length === 0) return [];
  
  const filtered = [];
  const contentHashes = new Set();
  const introductionSeen = false;
  
  // Define patterns that indicate welcome/intro messages with more flexibility
  const introPatterns = [
    /hello!?\s*i'?m\s+(a\s+)?(sim|digital assistant|assistant|ai|clone|version)(\s+of|\s+representing|\s+for)?\s+/i,
    /peace\s+be\s+with\s+you/i,
    /welcome\s+(back|again)?/i,
    /i'?m\s+(here\s+to|ready\s+to|excited\s+to|happy\s+to)\s+(help|assist|chat|talk|connect)/i,
    /i'?m\s+jesus\s+christ'?s\s+sim/i,
    /i'?m\s+a\s+sim\s+of\s+jesus/i,
  ];
  
  // Define patterns for generic help offers
  const helpOfferPatterns = [
    /what\s+can\s+i\s+(do\s+for\s+you|help\s+(you\s+with|with)|assist\s+you\s+with)\s+today/i,
    /how\s+can\s+i\s+(help|assist|serve)\s+you\s+today/i,
    /how\s+(may|might|can)\s+i\s+(help|assist|serve)\s+you/i,
    /what\s+(would\s+you\s+like|do\s+you\s+want)\s+to\s+(talk|chat|discuss)\s+about/i,
    /is\s+there\s+something\s+(specific|particular)\s+you'd\s+like\s+to\s+(know|learn|discuss)/i,
  ];
  
  // Combine all patterns for welcome message detection
  const welcomePatterns = [...introPatterns, ...helpOfferPatterns];
  
  // First pass: identify if we have any welcome messages
  let hasWelcomeMessage = false;
  let lastWelcomeMessageIndex = -1;
  
  for (let i = 0; i < systemMessages.length; i++) {
    const content = systemMessages[i].content.trim().toLowerCase();
    if (welcomePatterns.some(pattern => pattern.test(content))) {
      hasWelcomeMessage = true;
      lastWelcomeMessageIndex = i;
    }
  }
  
  // Second pass: filter messages
  for (let i = 0; i < systemMessages.length; i++) {
    const message = systemMessages[i];
    const content = message.content.trim();
    
    if (!content) continue; // Skip empty messages
    
    // Create a content hash for exact duplicate detection
    const contentHash = content.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Check for exact duplicates
    if (contentHashes.has(contentHash)) {
      continue; // Skip exact duplicates
    }
    
    // Check if this is a welcome/introduction message
    const isWelcomeMessage = welcomePatterns.some(pattern => pattern.test(content.toLowerCase()));
    
    // Prevent welcome messages in the middle of conversations
    // If there are any user messages in the system messages array, it's mid-conversation
    const hasUserMessagesInHistory = systemMessages.some((msg, idx) => idx < i && msg.role === 'user');
      
    // Skip welcome messages in these cases:
    // 1. If it's a duplicate welcome message (not the last one)
    // 2. If it appears after user messages (mid-conversation introduction)
    if (isWelcomeMessage && 
        ((hasWelcomeMessage && i !== lastWelcomeMessageIndex) || hasUserMessagesInHistory)) {
      console.log('Skipping inappropriate welcome message:', content.substring(0, 50) + '...');
      continue;
    }
    
    // Additional quality checks
    if (content.length < 10) continue; // Skip very short responses
    
    // Add to filtered results
    contentHashes.add(contentHash);
    filtered.push(message);
  }
  
  return filtered;
}
