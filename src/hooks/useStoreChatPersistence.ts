import { useState, useEffect, useCallback } from 'react';

type ChatMessage = {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  productId?: string;
};

type Store = {
  id?: string;
  store_name?: string;
  greeting_message?: string;
  avatar_url?: string;
};

const STORAGE_KEY_PREFIX = 'store_chat_';
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface StoredChatData {
  messages: Array<Omit<ChatMessage, 'timestamp'> & { timestamp: string }>;
  lastUpdated: number;
  storeId: string;
}

export const useStoreChatPersistence = (username: string | undefined, store: Store | null) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load messages from sessionStorage on mount
  useEffect(() => {
    if (!username) return;

    const storageKey = `${STORAGE_KEY_PREFIX}${username}`;
    const stored = sessionStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed: StoredChatData = JSON.parse(stored);
        
        // Check if data is expired or store has changed
        const isExpired = Date.now() - parsed.lastUpdated > STORAGE_EXPIRY;
        const storeChanged = store?.id && parsed.storeId !== store.id;
        
        if (!isExpired && !storeChanged && parsed.messages.length > 0) {
          // Restore messages with proper Date objects
          const messages = parsed.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setChatMessages(messages);
          setIsInitialized(true);
          return;
        }
      } catch (error) {
        console.error('Error loading chat from storage:', error);
      }
    }

    // Initialize with greeting message if no stored messages
    if (store?.greeting_message && !isInitialized) {
      setChatMessages([{
        id: '1',
        role: 'agent',
        content: store.greeting_message,
        timestamp: new Date()
      }]);
      setIsInitialized(true);
    }
  }, [username, store?.id, store?.greeting_message, isInitialized]);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (!username || !store?.id || chatMessages.length === 0) return;

    const storageKey = `${STORAGE_KEY_PREFIX}${username}`;
    const dataToStore: StoredChatData = {
      messages: chatMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      })),
      lastUpdated: Date.now(),
      storeId: store.id
    };

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving chat to storage:', error);
    }
  }, [chatMessages, username, store?.id]);

  const clearChat = useCallback(() => {
    if (!username) return;
    const storageKey = `${STORAGE_KEY_PREFIX}${username}`;
    sessionStorage.removeItem(storageKey);
    setChatMessages([]);
    setIsInitialized(false);
  }, [username]);

  return {
    chatMessages,
    setChatMessages,
    clearChat
  };
};
