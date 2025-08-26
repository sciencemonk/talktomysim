import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Mic, MicOff, User } from 'lucide-react';
import { AgentType } from '@/types/agent';
import { useEnhancedTextChat } from '@/hooks/useEnhancedTextChat';
import { conversationService, Conversation } from '@/services/conversationService';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ChatModal } from '@/components/ChatModal';
import { MessageWithChatLinks } from '@/components/MessageWithChatLinks';

interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  timestamp: number;
}

interface ChatInterfaceProps {
  agent: AgentType;
  onToggleAudio?: () => void;
  isAudioEnabled?: boolean;
  onBack?: () => void;
  onLoginClick?: () => void;
  isUserOwnSim?: boolean;
  hasSidebar?: boolean;
}

export const ChatInterface = ({ 
  agent, 
  onToggleAudio, 
  isAudioEnabled = false, 
  onBack, 
  onLoginClick, 
  isUserOwnSim = false,
  hasSidebar = true
}: ChatInterfaceProps) => {
  const { user, loading: authLoading } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [currentAiMessage, setCurrentAiMessage] = useState<string>('');
  const [hasLoadedInitialMessages, setHasLoadedInitialMessages] = useState(false);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Check if user is near bottom of chat - improved for mobile
  const checkIfNearBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    
    const container = messagesContainerRef.current;
    // Smaller threshold for mobile to be less aggressive
    const threshold = isMobile ? 50 : 150; 
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    
    setIsUserNearBottom(isNearBottom);
    return isNearBottom;
  }, [isMobile]);

  // Smart scroll to bottom - only when appropriate, gentler on mobile (iMessage-like)
  const scrollToBottom = useCallback((force = false) => {
    if (!messagesEndRef.current) return;
    
    // Don't auto-scroll if user is actively scrolling (like iMessage)
    if (isUserScrolling && !force) {
      return;
    }
    
    // On mobile, be more conservative about auto-scrolling
    if (isMobile && !force && !isUserNearBottom) {
      return;
    }
    
    if (force || (shouldAutoScroll && isUserNearBottom)) {
      // Use different behavior for mobile vs desktop
      messagesEndRef.current.scrollIntoView({ 
        behavior: isMobile ? 'auto' : 'smooth',
        block: 'end'
      });
    }
  }, [shouldAutoScroll, isUserNearBottom, isMobile, isUserScrolling]);

  // Handle scroll events to track user position and detect active scrolling
  const handleScroll = useCallback(() => {
    checkIfNearBottom();
    
    // Detect if user is actively scrolling (like iMessage behavior)
    setIsUserScrolling(true);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Reset scrolling state after user stops scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 150);
  }, [checkIfNearBottom]);

  // Only auto-scroll when there's active AI streaming or user sends a message
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, shouldAutoScroll]);

  // Initialize conversation on component mount - with stable conversation management
  useEffect(() => {
    const initConversation = async () => {
      if (!agent?.id) {
        console.log('No agent ID provided, skipping conversation initialization');
        return;
      }
      
      // Check if we already have a stable conversation for this session
      const currentConvId = conversation?.id;
      if (currentConvId && !currentConvId.includes('temp_')) {
        console.log(`Stable conversation already exists: ${currentConvId}, skipping re-initialization`);
        return;
      }
      
      // For owner sessions, ensure auth is ready so we don't accidentally
      // create an anonymous conversation before the user is available.
      if (isUserOwnSim) {
        if (authLoading) {
          console.log('Auth is still loading, waiting before creating owner conversation');
          return; // wait until auth resolves
        }
        
        if (!user) {
          console.log('No user found for owner conversation, skipping');
          return; // user not signed in; don't create anon for owner chat
        }
        
        // Additional stability check - ensure user has been stable for at least 1 second
        // This prevents conversation recreation during token refreshes
        const stableUserKey = `stable_user_${agent.id}`;
        const lastUserTime = sessionStorage.getItem(stableUserKey);
        const currentTime = Date.now();
        
        if (!lastUserTime || (currentTime - parseInt(lastUserTime)) < 1000) {
          sessionStorage.setItem(stableUserKey, currentTime.toString());
          if (lastUserTime) {
            console.log('User state too recent, waiting for stability');
            return;
          }
        }
        
        console.log(`Initializing owner conversation for user ${user.id} and agent:`, agent.id);
        
        try {
          const conv = await conversationService.getOrCreateOwnerConversation(agent.id);
          
          if (conv) {
            console.log(`Owner conversation initialized with ID: ${conv.id}`);
            
            // Only set conversation if it's different from current one
            if (conv.id !== currentConvId) {
              setConversation(conv);
              
              // Force a refresh of the conversation in localStorage to ensure persistence
              localStorage.setItem(`owner_conversation_${user.id}_${agent.id}`, conv.id);
            }
          } else {
            console.error('Failed to create or retrieve owner conversation');
          }
        } catch (error) {
          console.error('Error initializing owner conversation:', error);
        }
      } else {
        // Public conversation
        console.log(`Initializing public conversation for agent:`, agent.id);
        
        try {
          // Force a fresh conversation for public chats to ensure it's properly created
          // This ensures both tutor_id and advisor_id are set correctly
          console.log('Creating fresh public conversation');
          
          // Get current auth state
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          console.log('Current user for public chat:', currentUser?.id || 'anonymous');
          
          const conv = await conversationService.getOrCreateConversation(agent.id);
          
          if (conv) {
            console.log(`Public conversation initialized with ID: ${conv.id}`);
            console.log(`Public conversation details: tutor_id=${conv.tutor_id}, advisor_id=${conv.advisor_id}, user_id=${conv.user_id || 'null'}, is_anonymous=${conv.is_anonymous}`);
            
            // Only set conversation if it's different from current one
            if (conv.id !== currentConvId) {
              setConversation(conv);
            }
          } else {
            console.error('Failed to create or retrieve public conversation');
          }
        } catch (error) {
          console.error('Error initializing public conversation:', error);
        }
      }
    };
    
    initConversation();
  }, [agent?.id, isUserOwnSim]); // Removed authLoading and user?.id to prevent auth-triggered resets

  // Separate effect to handle delayed re-initialization for owner sessions when auth stabilizes
  useEffect(() => {
    if (isUserOwnSim && !authLoading && user && !conversation?.id) {
      console.log('Auth stabilized for owner session, checking if conversation needs initialization');
      const timeoutId = setTimeout(() => {
        // Re-check after delay to ensure conversation is created for authenticated owner sessions
        if (!conversation?.id) {
          console.log('No conversation found after auth stabilization, triggering initialization');
          const initEvent = new CustomEvent('force-conversation-init');
          window.dispatchEvent(initEvent);
        }
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isUserOwnSim, authLoading, user, conversation?.id]);

  const { messages: historyMessages, isLoading, loadMessages } = useChatHistory(conversation?.id || null);

  // Reset message state when conversation changes - but only for genuine conversation changes
  const previousConversationId = useRef<string | null>(null);
  useEffect(() => {
    if (conversation?.id) {
      // Only reset if this is truly a different conversation (not just auth refresh)
      if (previousConversationId.current && previousConversationId.current !== conversation.id) {
        console.log(`Conversation changed from ${previousConversationId.current} to ${conversation.id}, resetting message state`);
        setHasLoadedInitialMessages(false);
        setMessages([]); // Clear messages to avoid showing stale data
      } else if (!previousConversationId.current) {
        console.log(`Initial conversation set: ${conversation.id}`);
        setHasLoadedInitialMessages(false);
        setMessages([]);
      }
      
      previousConversationId.current = conversation.id;
    }
  }, [conversation?.id]);
  
  // Debug effect to log messages
  useEffect(() => {
    console.log(`Current UI messages: ${messages.length}, History messages: ${historyMessages?.length || 0}`);
  }, [messages.length, historyMessages?.length]);

  // Separate effect to handle message loading
  useEffect(() => {
    if (!conversation?.id) {
      return;
    }
    
    if (!historyMessages) {
      console.log(`Waiting for history messages for conversation ${conversation.id}`);
      return;
    }
    
    console.log(`Processing ${historyMessages.length} messages for conversation ${conversation.id}, hasLoadedInitialMessages=${hasLoadedInitialMessages}, current UI messages=${messages.length}`);
    
    // For public conversations, don't overwrite if we already have more messages in the UI
    const isPublicConversation = conversation.id.startsWith('public_');
    const hasMoreMessagesInUI = messages.length > historyMessages.length;
    
    if (isPublicConversation && hasMoreMessagesInUI && hasLoadedInitialMessages) {
      console.log(`Skipping history reload for public conversation - UI has ${messages.length} messages vs history ${historyMessages.length}`);
      return;
    }
    
    // Always load messages if we have them, regardless of hasLoadedInitialMessages state
    if (historyMessages.length > 0) {
      console.log(`Setting ${historyMessages.length} messages from history`);
      
      // Log the first few messages to debug
      historyMessages.slice(0, 3).forEach((msg, i) => {
        console.log(`Message ${i}: ${msg.role} - ${msg.content.substring(0, 30)}...`);
      });
      
      const formattedMessages: Message[] = historyMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at).getTime()
      }));
      
      // Only update if we don't already have more recent messages
      if (!hasMoreMessagesInUI || !hasLoadedInitialMessages) {
        console.log(`Setting UI with ${formattedMessages.length} formatted messages`);
        setMessages([...formattedMessages]);
      }
      
      setHasLoadedInitialMessages(true);
      
      // Only auto-scroll if this is a new conversation or we're on mobile and have just a few messages
      const shouldInitialScroll = historyMessages.length <= 2 || (!isMobile && historyMessages.length <= 5);
      if (shouldInitialScroll) {
        setTimeout(() => {
          setShouldAutoScroll(true);
          setIsUserNearBottom(true);
          scrollToBottom(true);
        }, 100);
      }
    } 
    // Only show welcome message if we haven't loaded messages yet AND there are no existing messages
    else if (!hasLoadedInitialMessages && agent?.welcomeMessage && messages.length === 0) {
      console.log('No messages found, showing welcome message');
      const welcomeMsg: Message = {
        id: 'welcome-message',
        role: 'system',
        content: agent.welcomeMessage,
        timestamp: Date.now()
      };
      setMessages([welcomeMsg]);
      setHasLoadedInitialMessages(true);
      
      // For welcome message, always scroll to show it properly
      setTimeout(() => {
        setShouldAutoScroll(true);
        setIsUserNearBottom(true);
        scrollToBottom(false); // Don't force, let natural scroll happen
      }, 100);
    } else if (messages.length > 0 && !hasLoadedInitialMessages) {
      // If we already have messages but haven't marked as loaded, mark as loaded to prevent welcome message
      console.log('Messages already exist, marking as loaded to prevent welcome message');
      setHasLoadedInitialMessages(true);
    }
  }, [historyMessages, conversation?.id, agent?.welcomeMessage, hasLoadedInitialMessages, scrollToBottom, messages.length]);

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const addUserMessage = useCallback(async (message: string) => {
    if (!message.trim()) {
      console.error('Cannot add user message: Empty content');
      return;
    }
    
    // Create temporary message for UI
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    
    // Auto-scroll when user sends a message - but only if already near bottom or on mobile
    const wasNearBottom = checkIfNearBottom();
    if (wasNearBottom || isMobile) {
      setShouldAutoScroll(true);
      setIsUserNearBottom(true);
    }
    
    // Save to localStorage for public conversations (database conversations are handled by Edge Function)
    if (conversation?.id && conversation.id.startsWith('public_')) {
      console.log(`Saving user message to localStorage conversation ${conversation.id}`);
      
      try {
        const savedMessage = await conversationService.addMessage(conversation.id, 'user', message);
        
        if (savedMessage) {
          console.log(`Successfully saved user message ${savedMessage.id} to localStorage conversation ${conversation.id}`);
        } else {
          console.error('Failed to save user message to localStorage');
        }
      } catch (error) {
        console.error('Error saving user message:', error);
      }
    }
  }, [conversation?.id, isUserOwnSim, user, agent?.id]);

  const startAiMessage = useCallback(() => {
    setCurrentAiMessage('');
    const aiMessageId = `ai-${Date.now()}`;
    
    // Enable auto-scroll when AI starts responding
    setShouldAutoScroll(true);
    
    return aiMessageId;
  }, []);

  const addAiTextDelta = useCallback((delta: string) => {
    setCurrentAiMessage(prev => prev + delta);
    
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.role === 'system' && lastMessage.id.startsWith('ai-')) {
        return prev.map((msg, index) => 
          index === prev.length - 1 && msg.role === 'system' && msg.id.startsWith('ai-')
            ? { ...msg, content: msg.content + delta }
            : msg
        );
      } else {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: 'system',
          content: delta,
          timestamp: Date.now()
        };
        return [...prev, aiMsg];
      }
    });
  }, []);

  const completeAiMessage = useCallback(async (finalContent: string) => {
    if (!conversation?.id) {
      console.error('Cannot save AI message: No conversation ID available');
      return;
    }
    
    if (!finalContent || !finalContent.trim()) {
      console.error('Cannot save AI message: Empty content');
      return;
    }
    
    console.log(`Saving AI message to conversation ${conversation.id}`);
    
    try {
      // Ensure the conversation is persisted in localStorage
      if (isUserOwnSim && user) {
        localStorage.setItem(`owner_conversation_${user.id}_${agent.id}`, conversation.id);
      }
      
      // Save message to database
      const savedMessage = await conversationService.addMessage(conversation.id, 'system', finalContent);
      
      if (savedMessage) {
        console.log(`Successfully saved AI message ${savedMessage.id} to conversation ${conversation.id}`);
      } else {
        console.error('Failed to save AI message to database');
      }
      
      // Update UI
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'system' && lastMessage.id.startsWith('ai-')) {
          return prev.map((msg, index) => 
            index === prev.length - 1 && msg.role === 'system' && msg.id.startsWith('ai-')
              ? { ...msg, content: finalContent, id: savedMessage?.id || `saved-${Date.now()}` }
              : msg
          );
        }
        return prev;
      });
    } catch (error) {
      console.error('Error saving AI message:', error);
    }
    
    setCurrentAiMessage('');
    
    // Disable auto-scroll after AI completes message
    setShouldAutoScroll(false);
  }, [conversation?.id, isUserOwnSim, user, agent?.id]);

  // Combine historical messages with current session messages for conversation context
  const conversationHistory = React.useMemo(() => {
    // Start with persisted messages from database
    const allMessages = [...(historyMessages || [])];
    
    // Add any current session messages that aren't already persisted
    // (This handles the case where messages are added to UI before being saved)
    messages.forEach(msg => {
      const existsInHistory = allMessages.some(histMsg => histMsg.id === msg.id);
      if (!existsInHistory) {
        allMessages.push({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          created_at: new Date(msg.timestamp).toISOString(),
          conversation_id: conversation?.id || ''
        });
      }
    });
    
    // Sort by timestamp and convert to the format expected by useEnhancedTextChat
    return allMessages
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
  }, [historyMessages, messages, conversation?.id]);

  const { sendMessage, isProcessing } = useEnhancedTextChat({
    agent,
    onUserMessage: addUserMessage,
    onAiMessageStart: startAiMessage,
    onAiTextDelta: addAiTextDelta,
    onAiMessageComplete: completeAiMessage,
    isOwner: isUserOwnSim,
    conversationId: conversation?.id,
    conversationHistory
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;
    
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    
    // V1 Owner Insights: If the user is talking to their own Sim and
    // they send a command like "/insights" (optionally with a time window like "7d"),
    // generate a quick analytics summary of public conversations instead of
    // calling the regular AI completion. This keeps behavior explicit and simple.
    if (isUserOwnSim && messageToSend.toLowerCase().startsWith('/insights')) {
      try {
        // Persist the user's command as a message
        await addUserMessage(messageToSend);
        const aiId = startAiMessage();

        // Parse optional time window like "/insights 7d"
        const daysMatch = messageToSend.match(/\b(\d+)d\b/i);
        const daysWindow = daysMatch ? parseInt(daysMatch[1], 10) : undefined;

        // Fetch conversation summaries for this Sim (advisor)
        const summaries = await conversationService.getAdvisorConversations(agent.id);

        // If a time window is provided, filter by updated_at within that window
        const now = Date.now();
        const filtered = Array.isArray(summaries) ? summaries.filter((s: any) => {
          if (!daysWindow) return true;
          const updated = new Date(s.updated_at).getTime();
          return updated >= now - daysWindow * 24 * 60 * 60 * 1000;
        }) : [];

        // Compute basic metrics
        const totalConversations = filtered.length;
        const totalMessages = filtered.reduce((sum: number, c: any) => sum + (Number(c.message_count) || 0), 0);
        const avgMessages = totalConversations > 0 ? (totalMessages / totalConversations) : 0;
        const escalated = filtered.filter((c: any) => !!c.escalated).length;
        const anonymous = filtered.filter((c: any) => c.is_anonymous === true).length;
        const anonPct = totalConversations > 0 ? Math.round((anonymous / totalConversations) * 100) : 0;
        const mostRecent = filtered.reduce((latest: number, c: any) => {
          const t = new Date(c.updated_at).getTime();
          return t > latest ? t : latest;
        }, 0);

        // Aggregate intents
        const intentCounts: Record<string, number> = {};
        filtered.forEach((c: any) => {
          const intents: string[] = Array.isArray(c.intents) ? c.intents : [];
          intents.forEach((i) => {
            if (!i) return;
            const key = String(i);
            intentCounts[key] = (intentCounts[key] || 0) + 1;
          });
        });
        const topIntents = Object.entries(intentCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([k, v]) => `${k} (${v})`)
          .join(', ');

        // Build simple natural language summary
        const windowText = daysWindow ? `last ${daysWindow} day(s)` : 'all time';
        const recentText = mostRecent ? new Date(mostRecent).toLocaleString() : 'N/A';
        const summary = totalConversations === 0
          ? `No conversations found in the ${windowText}.`
          : [
              `Insights for ${agent.name} — ${windowText}:`,
              `- Conversations: ${totalConversations}`,
              `- Total messages: ${totalMessages} (avg ${avgMessages.toFixed(1)} per conversation)`,
              `- Escalations (approx): ${escalated}`,
              `- Anonymous: ${anonymous} (${anonPct}%)`,
              topIntents ? `- Top intents: ${topIntents}` : `- Top intents: N/A`,
              `- Most recent activity: ${recentText}`
            ].join('\n');

        addAiTextDelta(summary);
        await completeAiMessage(summary);
      } catch (err) {
        const fallback = 'Unable to generate insights right now.';
        addAiTextDelta(fallback);
        await completeAiMessage(fallback);
      }
      return;
    }

    // Default path: use the enhanced text chat flow
    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatLinkClick = async (conversationId: string) => {
    try {
      console.log(`Attempting to load conversation: ${conversationId}`);
      
      // Fetch the conversation data
      const conversationData = await conversationService.getConversationById(conversationId);
      if (conversationData) {
        console.log('Conversation data loaded successfully:', conversationData);
        
        // Add sim data to the conversation object (similar to MySim.tsx)
        const enhancedConversation = {
          ...conversationData,
          sim: {
            name: agent.name,
            avatar: agent.avatar,
            avatar_url: agent.avatar_url
          }
        };
        setSelectedConversation(enhancedConversation);
        setIsChatModalOpen(true);
      } else {
        console.warn(`Conversation ${conversationId} not found or no longer available`);
        // Could add a toast notification here if needed
        // For now, just log the issue - the link simply won't work
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      // Could add error notification here if needed
    }
  };

  if (isLoading && !hasLoadedInitialMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse">Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background relative w-full max-w-full overflow-hidden">
      {/* Mobile viewport fix */}
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-chat-container {
            height: 100vh;
            height: 100dvh; /* Dynamic viewport height for mobile */
          }
        }
      `}</style>
      {/* Header - Only show for non-user sims */}
      {!isUserOwnSim && (
        <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={(agent as any)?.avatar_url || (agent?.avatar ? `/lovable-uploads/${agent?.avatar}` : undefined)} alt={agent?.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {agent?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">{agent?.name}</h2>
              <p className="text-sm text-muted-foreground">{agent?.title}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onToggleAudio && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleAudio}
                className="flex items-center gap-2"
              >
                {isAudioEnabled ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Audio Off
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Audio On
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoginClick}
              className="p-2"
            >
              <img 
                src="/lovable-uploads/bd1798e5-2033-45c5-a39b-4e8192a4b046.png" 
                alt="Login" 
                className="h-6 w-6 object-contain"
              />
            </Button>
          </div>
        </div>
      )}

      {/* Messages - Improved scrolling behavior for mobile */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto p-4 space-y-4 w-full ${
          isUserOwnSim 
            ? isMobile 
              ? 'pt-4 pb-20' 
              : 'pt-4 pb-24'
            : isMobile 
              ? 'pt-20 pb-20'
              : 'pt-24 pb-24'
        } mobile-chat-container`}
      >
        {/* Debug message count - using useEffect to avoid React node issues */}
        <div className="hidden">{messages.length}</div>
        
        {/* Show loading indicator if still loading messages */}
        {isLoading && messages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        {/* No placeholder message; show nothing while empty */}
        {!isLoading && messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Start a conversation with {agent?.name}
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'system' && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage 
                  src={(agent as any)?.avatar_url || (agent?.avatar ? `/lovable-uploads/${agent?.avatar}` : undefined)} 
                  alt={agent?.name} 
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {agent?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <div className="text-sm">
                {isUserOwnSim ? (
                  <MessageWithChatLinks 
                    content={message.content}
                    onChatLinkClick={handleChatLinkClick}
                  />
                ) : (
                  <span className="whitespace-pre-wrap">{message.content}</span>
                )}
              </div>
            </div>
            
            {message.role === 'user' && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Typing indicator - only show when processing */}
        {isProcessing && (
          <div className="flex gap-3 justify-start">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage 
                src={(agent as any)?.avatar_url || (agent?.avatar ? `/lovable-uploads/${agent?.avatar}` : undefined)} 
                alt={agent?.name} 
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {agent?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-lg px-4 py-2 flex items-center">
              <div className="flex space-x-1 items-center">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Fixed to bottom. When a sidebar exists, offset on desktop widths. */}
      <div className={`fixed bottom-0 z-10 border-t border-border bg-card ${
        hasSidebar ? 'left-0 right-0 md:left-80 md:right-0' : 'left-0 right-0'
      } ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex gap-2 w-full max-w-full">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${agent?.name}...`}
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isProcessing}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Modal for viewing referenced conversations */}
      <ChatModal 
        isOpen={isChatModalOpen}
        onClose={() => {
          setIsChatModalOpen(false);
          setSelectedConversation(null);
        }}
        conversation={selectedConversation}
        simName={agent.name}
        simAvatar={agent.avatar_url}
      />
    </div>
  );
};
